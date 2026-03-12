/**
 * Job Image Parser — Extrai texto de imagens de vagas via OCR.
 *
 * Usa Tesseract.js carregado via CDN (mesmo padrão do html2pdf no App.tsx).
 * Lazy loaded: só carrega quando o usuário envia uma imagem.
 * Fallback: retorna string vazia e orienta usuário a colar texto.
 */

let _tesseractLoaded = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _worker: any = null;

/* ── API pública ── */

/**
 * Extrai texto de uma imagem (data URL).
 * Carrega Tesseract.js sob demanda via CDN.
 *
 * @param imageSource - Data URL da imagem (base64)
 * @param onProgress - Callback de progresso (0-100)
 * @returns Texto extraído ou string vazia
 */
export async function extractTextFromImage(
  imageSource: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  try {
    const Tesseract = await loadTesseract();
    if (!Tesseract) {
      console.warn("Tesseract.js não disponível. OCR desabilitado.");
      return "";
    }

    if (!_worker) {
      _worker = await Tesseract.createWorker("por+eng", 1, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logger: (m: any) => {
          if (m.status === "recognizing text" && onProgress) {
            onProgress(Math.round((m.progress || 0) * 100));
          }
        },
      });
    }

    const result = await _worker.recognize(imageSource);
    return result?.data?.text || "";
  } catch (err) {
    console.warn("Erro no OCR:", err);
    return "";
  }
}

/**
 * Verifica se o Tesseract.js está disponível (sem carregar).
 */
export function isOCRAvailable(): boolean {
  return _tesseractLoaded;
}

/**
 * Libera o worker do Tesseract (cleanup).
 */
export async function terminateOCR(): Promise<void> {
  if (_worker) {
    try {
      await _worker.terminate();
    } catch {
      // ignore
    }
    _worker = null;
  }
}

/* ── Carregamento CDN (lazy) ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadTesseract(): Promise<any> {
  // Já carregado?
  if (_tesseractLoaded) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).Tesseract;
  }

  try {
    await loadScript(
      "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js",
    );
    _tesseractLoaded = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).Tesseract;
  } catch {
    console.warn("Falha ao carregar Tesseract.js via CDN.");
    return null;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

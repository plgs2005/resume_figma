/**
 * Job Input Resolver — Camada de normalização de entrada de vagas.
 *
 * Aceita 3 formatos de entrada:
 * 1. Texto colado (fonte principal)
 * 2. Link/URL (referência + orientação)
 * 3. Imagem/print (OCR → texto, fonte secundária)
 *
 * Output: ResolvedJobContent padronizado para o pipeline de agentes.
 *
 * Regras:
 * - texto: usar diretamente
 * - URL: registrar, extrair metadados, orientar usuário a complementar com texto
 * - imagem: OCR para texto, fallback para manual
 */

import { extractTextFromImage } from "./job-image-parser";

/* ── Tipos ── */

export type JobInputMode = "text" | "url" | "image";

export interface JobInput {
  mode: JobInputMode;
  /** Conteúdo bruto da entrada */
  raw: string;
  /** Texto da descrição da vaga (principal) */
  text?: string;
  /** URL da vaga */
  url?: string;
  /** Data URL da imagem */
  imageDataUrl?: string;
  /** Título da vaga (informado pelo usuário) */
  titulo?: string;
  /** Empresa (informado pelo usuário) */
  empresa?: string;
}

export interface ResolvedJobContent {
  source: JobInputMode;
  rawInput: string;
  /** Texto final extraído para análise */
  extractedText: string;
  url?: string;
  titulo?: string;
  empresa?: string;
  /** Se a resolução foi parcial (ex: URL sem conteúdo completo) */
  parcial: boolean;
  /** Mensagem de orientação ao usuário */
  orientacao?: string;
}

/* ── Resolver principal ── */

/**
 * Resolve qualquer formato de entrada em texto analisável.
 * Determinístico: mesma entrada → mesma saída.
 */
export async function resolveJobInput(
  input: JobInput,
  onOCRProgress?: (pct: number) => void,
): Promise<ResolvedJobContent> {
  switch (input.mode) {
    case "text":
      return resolveText(input);
    case "url":
      return resolveUrl(input);
    case "image":
      return resolveImage(input, onOCRProgress);
    default:
      throw new Error(`Modo de entrada desconhecido: ${input.mode}`);
  }
}

/* ── Resolvers por modo ── */

function resolveText(input: JobInput): ResolvedJobContent {
  const text = input.text || input.raw;

  if (!text.trim()) {
    return {
      source: "text",
      rawInput: input.raw,
      extractedText: "",
      titulo: input.titulo,
      empresa: input.empresa,
      parcial: true,
      orientacao: "Cole a descrição completa da vaga para análise.",
    };
  }

  return {
    source: "text",
    rawInput: input.raw,
    extractedText: text.trim(),
    titulo: input.titulo,
    empresa: input.empresa,
    parcial: false,
  };
}

function resolveUrl(input: JobInput): ResolvedJobContent {
  const url = input.url || input.raw;
  const isLinkedIn = /linkedin\.com/i.test(url);

  // Extrair metadados da URL quando possível
  const urlMeta = extractUrlMetadata(url);

  // Se há texto complementar substancial, usar como fonte principal
  if (input.text && input.text.trim().length > 50) {
    return {
      source: "url",
      rawInput: input.raw,
      extractedText: input.text.trim(),
      url,
      titulo: input.titulo || urlMeta.titulo,
      empresa: input.empresa || urlMeta.empresa,
      parcial: false,
    };
  }

  // URL sozinha → registrar e orientar
  const orientacao = isLinkedIn
    ? "URL do LinkedIn registrada. Para melhor análise, cole também a descrição completa da vaga no campo de texto complementar."
    : "URL registrada. Cole a descrição da vaga no campo complementar para uma análise completa.";

  return {
    source: "url",
    rawInput: input.raw,
    extractedText: input.text?.trim() || "",
    url,
    titulo: input.titulo || urlMeta.titulo,
    empresa: input.empresa || urlMeta.empresa,
    parcial: !input.text?.trim(),
    orientacao: !input.text?.trim() ? orientacao : undefined,
  };
}

async function resolveImage(
  input: JobInput,
  onOCRProgress?: (pct: number) => void,
): Promise<ResolvedJobContent> {
  const imageDataUrl = input.imageDataUrl || input.raw;
  const truncatedRaw = imageDataUrl
    ? imageDataUrl.slice(0, 80) + "..."
    : "";

  if (!imageDataUrl) {
    return {
      source: "image",
      rawInput: "",
      extractedText: "",
      titulo: input.titulo,
      empresa: input.empresa,
      parcial: true,
      orientacao: "Nenhuma imagem fornecida.",
    };
  }

  // Se o usuário já forneceu texto complementar, usar como principal
  if (input.text && input.text.trim().length > 50) {
    return {
      source: "image",
      rawInput: truncatedRaw,
      extractedText: input.text.trim(),
      titulo: input.titulo,
      empresa: input.empresa,
      parcial: false,
    };
  }

  // Tentar OCR
  try {
    const extractedText = await extractTextFromImage(
      imageDataUrl,
      onOCRProgress,
    );

    if (!extractedText || extractedText.trim().length < 20) {
      // OCR retornou pouco conteúdo
      const fallbackText = input.text?.trim() || "";
      return {
        source: "image",
        rawInput: truncatedRaw,
        extractedText: fallbackText,
        titulo: input.titulo,
        empresa: input.empresa,
        parcial: !fallbackText,
        orientacao: fallbackText
          ? undefined
          : "A extração de texto da imagem retornou pouco conteúdo. Complemente com o texto da vaga.",
      };
    }

    return {
      source: "image",
      rawInput: truncatedRaw,
      extractedText: extractedText.trim(),
      titulo: input.titulo,
      empresa: input.empresa,
      parcial: false,
    };
  } catch (err) {
    console.warn("Falha na extração de texto da imagem:", err);
    const fallbackText = input.text?.trim() || "";
    return {
      source: "image",
      rawInput: truncatedRaw,
      extractedText: fallbackText,
      titulo: input.titulo,
      empresa: input.empresa,
      parcial: !fallbackText,
      orientacao: fallbackText
        ? undefined
        : "Não foi possível extrair texto da imagem. Cole a descrição da vaga manualmente.",
    };
  }
}

/* ── Utilitários ── */

/**
 * Extrai metadados básicos de uma URL de vaga.
 */
function extractUrlMetadata(url: string): {
  titulo?: string;
  empresa?: string;
} {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/").filter(Boolean);

    // LinkedIn: /company/{name}/... ou /jobs/view/{id}
    if (/linkedin\.com/i.test(parsed.hostname)) {
      const companyIdx = pathParts.indexOf("company");
      if (companyIdx >= 0 && pathParts[companyIdx + 1]) {
        return {
          empresa: decodeURIComponent(pathParts[companyIdx + 1]).replace(
            /-/g,
            " ",
          ),
        };
      }
    }

    return {};
  } catch {
    return {};
  }
}

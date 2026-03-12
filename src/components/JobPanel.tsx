/**
 * JobPanel — Painel lateral para análise de vagas.
 *
 * Aceita 3 formatos de entrada:
 * 1. Texto colado (principal)
 * 2. Link/URL da vaga (referência + texto complementar)
 * 3. Imagem/print da vaga (OCR + texto complementar)
 *
 * Fluxo: input → resolver → pipeline → resultado → exportar PDF
 */

import { useState, useRef, useCallback } from "react";
import type { PipelineResult } from "../agents/orchestrator";
import type { JobInput } from "../agents/job-input-resolver";

type InputTab = "text" | "url" | "image";

interface JobPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onAnalyze: (input: JobInput) => Promise<PipelineResult>;
    onReset: () => void;
    onExportPDF?: () => void;
    isProcessing: boolean;
    isTailored: boolean;
    result: PipelineResult | null;
}

export function JobPanel({
    isOpen,
    onClose,
    onAnalyze,
    onReset,
    onExportPDF,
    isProcessing,
    isTailored,
    result,
}: JobPanelProps) {
    const [activeTab, setActiveTab] = useState<InputTab>("text");
    const [jobText, setJobText] = useState("");
    const [jobUrl, setJobUrl] = useState("");
    const [complementText, setComplementText] = useState("");
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [titulo, setTitulo] = useState("");
    const [empresa, setEmpresa] = useState("");
    const [ocrProgress, setOcrProgress] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOCRProgress = useCallback((pct: number) => {
        setOcrProgress(pct);
    }, []);

    const handleAnalyze = async () => {
        setErrorMsg(null);
        setOcrProgress(null);

        try {
            let input: JobInput;

            switch (activeTab) {
                case "text":
                    if (!jobText.trim()) return;
                    input = {
                        mode: "text",
                        raw: jobText,
                        text: jobText,
                        titulo: titulo || undefined,
                        empresa: empresa || undefined,
                    };
                    break;
                case "url":
                    if (!jobUrl.trim() && !complementText.trim()) return;
                    input = {
                        mode: "url",
                        raw: jobUrl,
                        url: jobUrl,
                        text: complementText || undefined,
                        titulo: titulo || undefined,
                        empresa: empresa || undefined,
                    };
                    break;
                case "image":
                    if (!imageDataUrl && !complementText.trim()) return;
                    input = {
                        mode: "image",
                        raw: imageDataUrl || "",
                        imageDataUrl: imageDataUrl || undefined,
                        text: complementText || undefined,
                        titulo: titulo || undefined,
                        empresa: empresa || undefined,
                    };
                    break;
            }

            const pipelineResult = await onAnalyze(input);

            // Mostrar orientação se resolução foi parcial
            if (
                pipelineResult.resolvedContent?.parcial &&
                pipelineResult.resolvedContent.orientacao
            ) {
                setErrorMsg(pipelineResult.resolvedContent.orientacao);
            }
        } catch (err: unknown) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Erro ao processar entrada.";
            setErrorMsg(msg);
        } finally {
            setOcrProgress(null);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErrorMsg("Arquivo deve ser uma imagem.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setErrorMsg("Imagem muito grande (máximo 10MB).");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setImageDataUrl(reader.result as string);
            setErrorMsg(null);
        };
        reader.onerror = () => setErrorMsg("Erro ao ler imagem.");
        reader.readAsDataURL(file);
    };

    const handleReset = () => {
        onReset();
        setJobText("");
        setJobUrl("");
        setComplementText("");
        setImageDataUrl(null);
        setTitulo("");
        setEmpresa("");
        setErrorMsg(null);
        setOcrProgress(null);
    };

    const canAnalyze = (() => {
        if (isProcessing) return false;
        switch (activeTab) {
            case "text":
                return jobText.trim().length > 0;
            case "url":
                return (
                    jobUrl.trim().length > 0 ||
                    complementText.trim().length > 0
                );
            case "image":
                return !!imageDataUrl || complementText.trim().length > 0;
        }
    })();

    const stageLabel = (() => {
        if (ocrProgress !== null) return `OCR: ${ocrProgress}%`;
        if (isProcessing) return "Analisando...";
        return "Analisar & Gerar";
    })();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] print:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-[500px] bg-white shadow-2xl overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[20px] font-bold text-[#0f172b]">
                            Analisar Vaga
                        </h2>
                        <button
                            onClick={onClose}
                            className="size-8 rounded-full bg-[#f1f5f9] flex items-center justify-center hover:bg-[#e2e8f0] transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="size-4"
                            >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-4 bg-[#f1f5f9] rounded-lg p-1">
                        {(
                            [
                                { id: "text", label: "Texto" },
                                { id: "url", label: "Link" },
                                { id: "image", label: "Imagem" },
                            ] as const
                        ).map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setErrorMsg(null);
                                }}
                                className={`flex-1 py-2 px-3 text-[13px] font-semibold rounded-md transition-colors ${activeTab === tab.id
                                    ? "bg-white text-[#0f172b] shadow-sm"
                                    : "text-[#62748e] hover:text-[#314158]"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Shared fields: título e empresa */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="block text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-1">
                                Título da Vaga
                            </label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Ex: Eng. Software Sr."
                                className="w-full px-3 py-2 text-[14px] border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-1">
                                Empresa
                            </label>
                            <input
                                type="text"
                                value={empresa}
                                onChange={(e) => setEmpresa(e.target.value)}
                                placeholder="Ex: Empresa X"
                                className="w-full px-3 py-2 text-[14px] border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Tab-specific content */}
                    <div className="space-y-4 mb-6">
                        {/* TEXT TAB */}
                        {activeTab === "text" && (
                            <div>
                                <label className="block text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-1">
                                    Descrição da Vaga
                                </label>
                                <textarea
                                    value={jobText}
                                    onChange={(e) =>
                                        setJobText(e.target.value)
                                    }
                                    placeholder="Cole aqui a descrição completa da vaga..."
                                    rows={12}
                                    className="w-full px-3 py-2 text-[14px] border border-[#e2e8f0] rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                                />
                            </div>
                        )}

                        {/* URL TAB */}
                        {activeTab === "url" && (
                            <>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-1">
                                        URL da Vaga
                                    </label>
                                    <input
                                        type="url"
                                        value={jobUrl}
                                        onChange={(e) =>
                                            setJobUrl(e.target.value)
                                        }
                                        placeholder="https://linkedin.com/jobs/view/..."
                                        className="w-full px-3 py-2 text-[14px] border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                                    />
                                    <p className="text-[11px] text-[#62748e] mt-1">
                                        A URL será registrada como referência.
                                        Para melhor análise, cole também a
                                        descrição abaixo.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-1">
                                        Texto Complementar
                                    </label>
                                    <textarea
                                        value={complementText}
                                        onChange={(e) =>
                                            setComplementText(e.target.value)
                                        }
                                        placeholder="Cole aqui a descrição da vaga copiada do site..."
                                        rows={8}
                                        className="w-full px-3 py-2 text-[14px] border border-[#e2e8f0] rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                                    />
                                </div>
                            </>
                        )}

                        {/* IMAGE TAB */}
                        {activeTab === "image" && (
                            <>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-1">
                                        Print / Screenshot da Vaga
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    {imageDataUrl ? (
                                        <div className="relative">
                                            <img
                                                src={imageDataUrl}
                                                alt="Preview da vaga"
                                                className="w-full max-h-[200px] object-contain rounded-lg border border-[#e2e8f0] bg-[#f8fafc]"
                                            />
                                            <button
                                                onClick={() => {
                                                    setImageDataUrl(null);
                                                    if (fileInputRef.current)
                                                        fileInputRef.current.value =
                                                            "";
                                                }}
                                                className="absolute top-2 right-2 size-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[12px] hover:bg-red-600"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className="w-full py-8 border-2 border-dashed border-[#e2e8f0] rounded-lg text-[#62748e] hover:border-[#009966] hover:text-[#009966] transition-colors"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="size-8 mx-auto mb-2"
                                            >
                                                <rect
                                                    width="18"
                                                    height="18"
                                                    x="3"
                                                    y="3"
                                                    rx="2"
                                                    ry="2"
                                                />
                                                <circle
                                                    cx="9"
                                                    cy="9"
                                                    r="2"
                                                />
                                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                            </svg>
                                            <span className="text-[13px] font-medium">
                                                Clique para enviar imagem
                                            </span>
                                        </button>
                                    )}
                                    <p className="text-[11px] text-[#62748e] mt-1">
                                        A imagem será processada via OCR.
                                        Complemente com texto para melhor
                                        resultado.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-1">
                                        Texto Complementar (Recomendado)
                                    </label>
                                    <textarea
                                        value={complementText}
                                        onChange={(e) =>
                                            setComplementText(e.target.value)
                                        }
                                        placeholder="Se possível, cole o texto da vaga aqui para complementar o OCR..."
                                        rows={6}
                                        className="w-full px-3 py-2 text-[14px] border border-[#e2e8f0] rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                                    />
                                </div>
                            </>
                        )}

                        {/* OCR Progress */}
                        {ocrProgress !== null && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="text-[13px] text-blue-700 font-medium mb-1">
                                    Processando imagem via OCR...
                                </div>
                                <div className="w-full bg-blue-100 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${ocrProgress}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error / Warning message */}
                        {errorMsg && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[13px] text-amber-700">
                                {errorMsg}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleAnalyze}
                                disabled={!canAnalyze}
                                className="flex-1 py-2.5 px-4 bg-[#009966] text-white text-[14px] font-semibold rounded-lg hover:bg-[#008855] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {stageLabel}
                            </button>

                            {isTailored && (
                                <button
                                    onClick={handleReset}
                                    className="py-2.5 px-4 bg-[#f1f5f9] text-[#45556c] text-[14px] font-semibold rounded-lg hover:bg-[#e2e8f0] transition-colors"
                                >
                                    Resetar
                                </button>
                            )}
                        </div>

                        {/* Export PDF button (when tailored) */}
                        {isTailored && onExportPDF && (
                            <button
                                onClick={onExportPDF}
                                className="w-full py-2.5 px-4 bg-[#0f172b] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1e293b] transition-colors flex items-center justify-center gap-2"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="size-4"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line
                                        x1="12"
                                        x2="12"
                                        y1="15"
                                        y2="3"
                                    />
                                </svg>
                                Exportar Currículo em PDF
                            </button>
                        )}
                    </div>

                    {/* Resolved content info */}
                    {result?.resolvedContent && (
                        <div className="mb-4 bg-[#f8fafc] rounded-lg p-3 border border-[#e2e8f0]">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-semibold text-[#45556c] uppercase tracking-wider">
                                    Entrada Resolvida
                                </span>
                                <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${result.resolvedContent.parcial
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-green-100 text-green-700"
                                        }`}
                                >
                                    {result.resolvedContent.source.toUpperCase()}
                                    {result.resolvedContent.parcial
                                        ? " (parcial)"
                                        : ""}
                                </span>
                            </div>
                            {result.resolvedContent.url && (
                                <p className="text-[12px] text-[#62748e] truncate">
                                    URL: {result.resolvedContent.url}
                                </p>
                            )}
                            <p className="text-[12px] text-[#314158] mt-1">
                                {result.resolvedContent.extractedText.length}{" "}
                                caracteres analisados
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {result && <AnalysisResults result={result} />}
                </div>
            </div>
        </div>
    );
}

/* ── Resultado da análise ── */

function AnalysisResults({ result }: { result: PipelineResult }) {
    const { analysis, comparison, summarySuggestions, skeCoverage } =
        result;
    const { match } = analysis;

    const aderenciaColor =
        match.aderencia >= 70
            ? "text-green-600 bg-green-50 border-green-200"
            : match.aderencia >= 40
                ? "text-yellow-600 bg-yellow-50 border-yellow-200"
                : "text-red-600 bg-red-50 border-red-200";

    return (
        <div className="space-y-4">
            {/* Score */}
            <div
                className={`rounded-xl border p-4 text-center ${aderenciaColor}`}
            >
                <div className="text-[36px] font-bold leading-tight">
                    {match.aderencia}%
                </div>
                <div className="text-[14px] font-medium">
                    Aderência à Vaga
                </div>
                {match.empresa_vaga && (
                    <div className="text-[12px] mt-1 opacity-70">
                        {match.titulo_vaga} @ {match.empresa_vaga}
                    </div>
                )}
            </div>

            {/* Dimensions info */}
            {analysis.dimensions && (
                <div className="bg-[#f8fafc] rounded-lg p-3 border border-[#e2e8f0]">
                    <h4 className="text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-2">
                        Contexto da Vaga
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-[#e2e8f0] text-[#314158] text-[11px] font-medium rounded">
                            {analysis.dimensions.senioridade}
                        </span>
                        {analysis.dimensions.lideranca && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[11px] font-medium rounded">
                                Liderança
                            </span>
                        )}
                        {analysis.dimensions.temas_negocio.map((t) => (
                            <span
                                key={t}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded"
                            >
                                {t}
                            </span>
                        ))}
                        {analysis.dimensions.contexto.map((c) => (
                            <span
                                key={c}
                                className="px-2 py-0.5 bg-[#f1f5f9] text-[#45556c] text-[11px] font-medium rounded"
                            >
                                {c}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Keywords Match */}
            {match.keywords_match.length > 0 && (
                <div>
                    <h4 className="text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-2">
                        Skills Atendidas ({match.keywords_match.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {match.keywords_match.map((kw) => (
                            <span
                                key={kw}
                                className="px-2 py-0.5 bg-green-50 text-green-700 text-[12px] font-medium rounded border border-green-200"
                            >
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Keywords Gap */}
            {match.keywords_gap.length > 0 && (
                <div>
                    <h4 className="text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-2">
                        Gaps Identificados ({match.keywords_gap.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {match.keywords_gap.map((kw) => (
                            <span
                                key={kw}
                                className="px-2 py-0.5 bg-red-50 text-red-700 text-[12px] font-medium rounded border border-red-200"
                            >
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Comparison */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f8fafc] rounded-lg p-3 text-center">
                    <div className="text-[20px] font-bold text-[#0f172b]">
                        {comparison.skills_destacadas}
                    </div>
                    <div className="text-[11px] text-[#62748e]">
                        Skills Destacadas
                    </div>
                </div>
                <div className="bg-[#f8fafc] rounded-lg p-3 text-center">
                    <div className="text-[20px] font-bold text-[#0f172b]">
                        {comparison.experiencias_relevantes}
                    </div>
                    <div className="text-[11px] text-[#62748e]">
                        Exp. Relevantes
                    </div>
                </div>
            </div>

            {/* SKE Coverage */}
            {skeCoverage.total_skills > 0 && (
                <div className="bg-[#f8fafc] rounded-lg p-3">
                    <h4 className="text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-1">
                        Cobertura SKE
                    </h4>
                    <div className="text-[14px] text-[#314158]">
                        {skeCoverage.coverage_pct}% das skills do currículo
                        confirmadas
                        <span className="text-[12px] text-[#62748e] ml-1">
                            ({skeCoverage.skills_confirmadas}/
                            {skeCoverage.skills_no_resume})
                        </span>
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {summarySuggestions.length > 0 && (
                <div>
                    <h4 className="text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-2">
                        Sugestões
                    </h4>
                    <ul className="space-y-1.5">
                        {summarySuggestions.map((s, i) => (
                            <li
                                key={i}
                                className="text-[13px] text-[#314158] leading-[18px]"
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Match Sugestoes */}
            {match.sugestoes.length > 0 && (
                <div>
                    <h4 className="text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-2">
                        Análise Estratégica
                    </h4>
                    <ul className="space-y-1.5">
                        {match.sugestoes.map((s, i) => (
                            <li
                                key={i}
                                className="text-[13px] text-[#314158] leading-[18px]"
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

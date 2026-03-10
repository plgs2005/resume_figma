/**
 * JobPanel — Painel lateral para análise de vagas.
 *
 * Permite ao usuário colar uma descrição de vaga, executar o pipeline
 * de agentes e ver o resultado da análise.
 */

import { useState } from "react";
import type { PipelineResult } from "../agents/orchestrator";

interface JobPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onAnalyze: (
        text: string,
        titulo?: string,
        empresa?: string,
    ) => Promise<PipelineResult>;
    onReset: () => void;
    isProcessing: boolean;
    isTailored: boolean;
    result: PipelineResult | null;
}

export function JobPanel({
    isOpen,
    onClose,
    onAnalyze,
    onReset,
    isProcessing,
    isTailored,
    result,
}: JobPanelProps) {
    const [jobText, setJobText] = useState("");
    const [titulo, setTitulo] = useState("");
    const [empresa, setEmpresa] = useState("");

    const handleAnalyze = async () => {
        if (!jobText.trim()) return;
        await onAnalyze(
            jobText,
            titulo || undefined,
            empresa || undefined,
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] print:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-[480px] bg-white shadow-2xl overflow-y-auto">
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

                    {/* Form */}
                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-3">
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

                        <div>
                            <label className="block text-[12px] font-semibold text-[#45556c] uppercase tracking-wider mb-1">
                                Descrição da Vaga
                            </label>
                            <textarea
                                value={jobText}
                                onChange={(e) => setJobText(e.target.value)}
                                placeholder="Cole aqui a descrição completa da vaga..."
                                rows={12}
                                className="w-full px-3 py-2 text-[14px] border border-[#e2e8f0] rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleAnalyze}
                                disabled={isProcessing || !jobText.trim()}
                                className="flex-1 py-2.5 px-4 bg-[#009966] text-white text-[14px] font-semibold rounded-lg hover:bg-[#008855] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isProcessing ? "Analisando..." : "Analisar & Gerar"}
                            </button>

                            {isTailored && (
                                <button
                                    onClick={onReset}
                                    className="py-2.5 px-4 bg-[#f1f5f9] text-[#45556c] text-[14px] font-semibold rounded-lg hover:bg-[#e2e8f0] transition-colors"
                                >
                                    Resetar
                                </button>
                            )}
                        </div>
                    </div>

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

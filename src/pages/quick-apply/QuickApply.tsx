/**
 * QuickApply — Modo de utilização imediata.
 *
 * Permite gerar currículos adaptados para vagas em menos de 2 minutos.
 * Reutiliza o pipeline existente (orchestrator → job-analyzer → resume-builder)
 * sem alterar nenhum agente ou componente existente.
 *
 * Fluxo: paste job → analyzeFromInput() → render resume → export PDF
 *
 * Rota: /quick-apply (independente do Workspace)
 */

import { useState, useEffect, useRef } from "react";
import { useOrchestrator } from "../../agents/useOrchestrator";
import type { JobInput } from "../../agents/job-input-resolver";
import OriginalApp from "../../App";

/* ── Ícones inline ── */

const IconZap = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
);

const IconDownload = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
);

const IconPrint = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect width="12" height="8" x="6" y="14" />
    </svg>
);

const IconArrowLeft = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </svg>
);

const IconRotate = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
    </svg>
);

/* ── Stage labels ── */

const stageLabels: Record<string, string> = {
    idle: "Aguardando vaga...",
    resolving: "Processando entrada...",
    "loading-ske": "Carregando dados SKE...",
    analyzing: "Analisando requisitos da vaga...",
    building: "Gerando currículo adaptado...",
    done: "Currículo pronto!",
    error: "Erro no processamento.",
};

/* ── Componente ── */

export default function QuickApply() {
    const [jobText, setJobText] = useState("");
    const [pdfReady, setPdfReady] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const resumeRef = useRef<HTMLDivElement>(null);

    const { state, analyzeFromInput, reset, isProcessing, isTailored } =
        useOrchestrator();

    // Carregar html2pdf
    useEffect(() => {
        const script = document.createElement("script");
        script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => setPdfReady(true);
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const handleAnalyze = async () => {
        if (!jobText.trim()) return;
        setErrorMsg(null);

        const input: JobInput = {
            mode: "text",
            raw: jobText,
            text: jobText,
        };

        try {
            await analyzeFromInput(input);
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Erro ao analisar vaga.");
        }
    };

    const handleExportPDF = () => {
        if (!pdfReady) {
            alert("Biblioteca de PDF carregando, tente novamente em alguns segundos.");
            return;
        }

        const element = document.getElementById("resume-content");
        if (!element) return;

        const nome = state.activeData.pessoal.nome.replace(/\s+/g, "_");

        // @ts-ignore
        window.html2pdf().set({
            margin: 0,
            filename: `Curriculo_${nome}_QuickApply.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        }).from(element).save();
    };

    const handlePrint = () => window.print();

    const handleReset = () => {
        reset();
        setJobText("");
        setErrorMsg(null);
    };

    const matchScore = state.lastResult?.analysis?.match?.aderencia;

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-[#0f172a] print:bg-white">
            {/* Top bar */}
            <header className="bg-[#0f172a] text-white px-6 py-3 flex items-center justify-between print:hidden sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <a
                        href="/workspace/home"
                        className="flex items-center gap-2 text-[13px] text-[#94a3b8] hover:text-white transition-colors"
                    >
                        <IconArrowLeft className="w-4 h-4" />
                        Workspace
                    </a>
                    <span className="text-[#475569]">|</span>
                    <div className="flex items-center gap-2">
                        <IconZap className="w-5 h-5 text-amber-400" />
                        <span className="text-[16px] font-semibold">Quick Apply</span>
                    </div>
                </div>

                {isTailored && (
                    <div className="flex items-center gap-3">
                        {matchScore != null && (
                            <span className={`text-[13px] font-medium px-3 py-1 rounded-full ${matchScore >= 70 ? "bg-emerald-500/20 text-emerald-300" :
                                matchScore >= 40 ? "bg-amber-500/20 text-amber-300" :
                                    "bg-red-500/20 text-red-300"
                                }`}>
                                Aderência: {matchScore}%
                            </span>
                        )}
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-[13px] font-medium transition-colors"
                        >
                            <IconDownload className="w-4 h-4" />
                            Export PDF
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[13px] font-medium transition-colors"
                        >
                            <IconPrint className="w-4 h-4" />
                            Print
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[13px] font-medium transition-colors"
                        >
                            <IconRotate className="w-4 h-4" />
                            Nova vaga
                        </button>
                    </div>
                )}
            </header>

            <div className="flex print:block">
                {/* Painel esquerdo — Input da vaga */}
                <aside className={`${isTailored ? "w-[380px]" : "w-full max-w-2xl mx-auto"} flex-shrink-0 print:hidden transition-all duration-300`}>
                    <div className={`${isTailored ? "p-6 border-r border-[#e2e8f0] min-h-[calc(100vh-52px)] sticky top-[52px]" : "p-8 pt-16"}`}>
                        {!isTailored && (
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
                                    <IconZap className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-[28px] font-bold text-[#0f172a] tracking-tight">
                                    Quick Apply
                                </h1>
                                <p className="text-[15px] text-[#64748b] mt-2 max-w-md mx-auto">
                                    Cole a descrição da vaga e gere um currículo adaptado em segundos.
                                </p>
                            </div>
                        )}

                        {isTailored && (
                            <h2 className="text-[14px] font-semibold text-[#0f172a] mb-3">
                                Descrição da vaga
                            </h2>
                        )}

                        <textarea
                            value={jobText}
                            onChange={(e) => setJobText(e.target.value)}
                            placeholder="Cole aqui a descrição completa da vaga..."
                            disabled={isProcessing}
                            className={`w-full border border-[#e2e8f0] rounded-xl p-4 text-[14px] leading-relaxed text-[#334155] placeholder:text-[#94a3b8] bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent resize-none transition-all disabled:opacity-50 ${isTailored ? "h-40" : "h-56"
                                }`}
                        />

                        {/* Status do pipeline */}
                        {isProcessing && (
                            <div className="mt-4 flex items-center gap-3 p-3 bg-[#eef2ff] rounded-lg border border-[#c7d2fe]">
                                <div className="w-5 h-5 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
                                <span className="text-[13px] font-medium text-[#4338ca]">
                                    {stageLabels[state.stage] ?? state.stage}
                                </span>
                            </div>
                        )}

                        {/* Erro */}
                        {errorMsg && (
                            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 text-[13px] text-red-700">
                                {errorMsg}
                            </div>
                        )}

                        {/* Botão de análise */}
                        {!isTailored && (
                            <button
                                onClick={handleAnalyze}
                                disabled={isProcessing || !jobText.trim()}
                                className="w-full mt-4 py-3 bg-[#0f172a] text-white rounded-xl text-[15px] font-semibold hover:bg-[#1e293b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <IconZap className="w-5 h-5" />
                                Analyze Job
                            </button>
                        )}

                        {/* Match summary (quando tailored) */}
                        {isTailored && state.lastResult && (
                            <div className="mt-4 space-y-3">
                                <h3 className="text-[13px] font-semibold text-[#0f172a]">Resultado da análise</h3>

                                {/* Keywords match */}
                                {state.lastResult.analysis.skills_encontradas?.length > 0 && (
                                    <div>
                                        <p className="text-[11px] font-medium text-emerald-600 mb-1.5">Match</p>
                                        <div className="flex flex-wrap gap-1">
                                            {state.lastResult.analysis.skills_encontradas.slice(0, 12).map((r, i) => (
                                                <span key={i} className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Keywords gap */}
                                {state.lastResult.analysis.gaps?.length > 0 && (
                                    <div>
                                        <p className="text-[11px] font-medium text-amber-600 mb-1.5">Gaps</p>
                                        <div className="flex flex-wrap gap-1">
                                            {state.lastResult.analysis.gaps.slice(0, 8).map((r, i) => (
                                                <span key={i} className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Re-analyze */}
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isProcessing || !jobText.trim()}
                                    className="w-full mt-2 py-2 bg-[#6366f1] text-white rounded-lg text-[13px] font-medium hover:bg-[#4f46e5] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                                >
                                    <IconZap className="w-4 h-4" />
                                    Re-analisar
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Painel direito — Preview do currículo */}
                {isTailored && (
                    <div ref={resumeRef} className="flex-1 min-w-0">
                        <OriginalApp data={state.activeData} />
                    </div>
                )}
            </div>
        </div>
    );
}

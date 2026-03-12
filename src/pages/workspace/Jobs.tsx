/**
 * Jobs — Análise de Vagas do Career Intelligence Workspace.
 *
 * Passo 3 do pipeline: recebe descrição de vaga → analisa → armazena JobAnalysis.
 *
 * Usa:
 * - job-analyzer.ts (parseJobDescription + analyzeJob)
 * - pipeline-store.ts (setJobAnalysis)
 * - ske-bridge.ts (carrega SKE para matching)
 */

import { useState } from "react";
import { ConfigActions } from "../../components/workspace/ConfigActions";
import { PipelineExecutionViewer } from "../../components/pipeline/PipelineExecutionViewer";
import { analyzeJob, type JobAnalysis } from "../../agents/job-analyzer";
import { usePipeline, setJobAnalysis } from "../../lib/pipeline-store";
import { getSKEData, loadSKEData } from "../../lib/ske-bridge";
import { runStepSequence } from "../../lib/execution-store";

export default function Jobs() {
    const [jobText, setJobText] = useState("");
    const [titulo, setTitulo] = useState("");
    const [empresa, setEmpresa] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [localResult, setLocalResult] = useState<JobAnalysis | null>(null);
    const pipeline = usePipeline();

    const handleAnalyze = async () => {
        if (!jobText.trim()) return;
        setIsAnalyzing(true);

        // Garantir SKE carregado para matching
        let ske = getSKEData();
        if (!ske) {
            try { ske = await loadSKEData(); } catch { /* ok sem SKE */ }
        }

        await runStepSequence([
            { step: "discovery", log: "Parsing job description", delay: 150 },
            { step: "collect", log: "Extracting requirements", delay: 200 },
            { step: "normalize", log: "Normalizing skills", delay: 200 },
            { step: "extract", log: "Matching against profile", delay: 250 },
            { step: "truth", log: "Computing match scores", delay: 200 },
        ], "jobs");

        const analysis = analyzeJob(
            jobText,
            titulo || undefined,
            empresa || undefined,
            ske,
        );

        setJobAnalysis(analysis);
        setLocalResult(analysis);
        setIsAnalyzing(false);
    };

    const handleClear = () => {
        setJobText("");
        setTitulo("");
        setEmpresa("");
        setLocalResult(null);
    };

    const result = localResult ?? pipeline.jobAnalysis;

    return (
        <div className="space-y-6">
            {/* Execution viewer */}
            <PipelineExecutionViewer />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[28px] font-bold text-[#0f172a] tracking-tight">
                        Análise de Vagas
                    </h1>
                    <p className="text-[15px] text-[#64748b] mt-1">
                        Cole a descrição de uma vaga para análise de aderência e gap.
                    </p>
                </div>
                <ConfigActions domain="jobs" />
            </div>

            {/* Pipeline prerequisites */}
            {!pipeline.profileData && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <p className="text-[14px] text-amber-800">
                        <strong>Passo 2 pendente:</strong> Analise seu perfil em <strong>Profile</strong> para obter melhores resultados de matching.
                    </p>
                </div>
            )}

            {/* Input area */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-[13px] font-medium text-[#475569] mb-1">
                            Título da vaga (opcional)
                        </label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ex: Desenvolvedor Full Stack Sênior"
                            className="w-full px-3 py-2 text-[14px] border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1]"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-[#475569] mb-1">
                            Empresa (opcional)
                        </label>
                        <input
                            type="text"
                            value={empresa}
                            onChange={(e) => setEmpresa(e.target.value)}
                            placeholder="Ex: Nubank"
                            className="w-full px-3 py-2 text-[14px] border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1]"
                        />
                    </div>
                </div>

                <label className="block text-[13px] font-medium text-[#475569] mb-1">
                    Descrição da vaga
                </label>
                <textarea
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    placeholder="Cole aqui a descrição completa da vaga..."
                    rows={10}
                    className="w-full px-3 py-2 text-[14px] border border-[#e2e8f0] rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1] font-mono"
                />

                <div className="flex items-center gap-3 mt-4">
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !jobText.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#6366f1] text-white rounded-lg text-[14px] font-medium hover:bg-[#4f46e5] transition-colors disabled:opacity-50"
                    >
                        {isAnalyzing ? "Analisando…" : "Analisar Vaga"}
                    </button>
                    {result && (
                        <button
                            onClick={handleClear}
                            className="px-4 py-2.5 text-[14px] font-medium text-[#64748b] hover:text-[#0f172a] transition-colors"
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            {/* Result */}
            {result && (
                <div className="space-y-6">
                    {/* Match Score */}
                    <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[18px] font-bold text-[#0f172a]">
                                {result.parsed.titulo}
                                {result.parsed.empresa && (
                                    <span className="text-[14px] font-normal text-[#64748b] ml-2">
                                        @ {result.parsed.empresa}
                                    </span>
                                )}
                            </h2>
                            <div className={`px-4 py-2 rounded-full text-[16px] font-bold ${result.match.aderencia >= 80
                                ? "bg-emerald-50 text-emerald-700"
                                : result.match.aderencia >= 50
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                                }`}>
                                {result.match.aderencia}%
                            </div>
                        </div>

                        {/* Skills encontradas */}
                        {result.skills_encontradas.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[13px] font-medium text-emerald-700 mb-2">
                                    ✓ Skills atendidas ({result.skills_encontradas.length})
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {result.skills_encontradas.map((s, i) => (
                                        <span key={i} className="text-[12px] px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gaps */}
                        {result.gaps.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[13px] font-medium text-red-600 mb-2">
                                    ✗ Gaps ({result.gaps.length})
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {result.gaps.map((s, i) => (
                                        <span key={i} className="text-[12px] px-2.5 py-1 rounded-md bg-red-50 text-red-600">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Requisitos */}
                        <div>
                            <p className="text-[13px] font-medium text-[#475569] mb-2">
                                Requisitos detectados ({result.parsed.requisitos.length})
                            </p>
                            <div className="space-y-1">
                                {result.parsed.requisitos.map((req, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[13px]">
                                        <span className={`w-2 h-2 rounded-full ${result.skills_encontradas.includes(req.nome)
                                            ? "bg-emerald-500"
                                            : "bg-red-400"
                                            }`} />
                                        <span className={result.skills_encontradas.includes(req.nome) ? "text-[#0f172a]" : "text-[#94a3b8]"}>
                                            {req.nome}
                                        </span>
                                        <span className={`text-[11px] px-1.5 py-0.5 rounded ${req.obrigatorio
                                            ? "bg-red-50 text-red-600"
                                            : "bg-gray-100 text-gray-500"
                                            }`}>
                                            {req.obrigatorio ? "Obrigatório" : "Diferencial"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sugestões */}
                    {result.sugestoes.length > 0 && (
                        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)]">
                            <h3 className="text-[16px] font-semibold text-[#0f172a] mb-3">
                                Sugestões
                            </h3>
                            <div className="space-y-2">
                                {result.sugestoes.map((s, i) => (
                                    <p key={i} className="text-[13px] text-[#475569] pl-3 border-l-2 border-[#e2e8f0]">
                                        {s}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Next step */}
                    <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <div className="flex-1">
                            <p className="text-[14px] font-medium text-indigo-800">
                                Passo 3 completo — Vaga analisada
                            </p>
                            <p className="text-[12px] text-indigo-600">
                                Prossiga para <strong>Resume</strong> para gerar o currículo tailored.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

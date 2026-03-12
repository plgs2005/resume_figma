/**
 * Home — Dashboard do Career Intelligence Workspace.
 *
 * Visão geral do escritório digital:
 * - Status da análise do usuário
 * - Resumo do perfil técnico atual
 * - Últimas análises / vagas / currículos
 * - Acesso rápido às outras áreas
 */

import { useNavigate } from "react-router-dom";
import { WorkspaceCard } from "../../components/workspace/WorkspaceCard";
import { ConfigActions } from "../../components/workspace/ConfigActions";
import { defaultResumeData } from "../../data/resume-default";
import { usePipeline } from "../../lib/pipeline-store";

/* ── Ícones inline ── */

const IconActivity = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
);

const IconUser = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const IconBriefcase = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
);

const IconFile = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
);

const IconDatabase = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
);

const IconArrowRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);

export default function Home() {
    const navigate = useNavigate();
    const { pessoal, skill_groups } = defaultResumeData;
    const pipeline = usePipeline();

    // Conta total de skills
    const totalSkills = skill_groups.reduce(
        (acc, g) => acc + g.skills.length,
        0,
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[28px] font-bold text-[#0f172a] tracking-tight">
                        Career Intelligence Workspace
                    </h1>
                    <p className="text-[15px] text-[#64748b] mt-1">
                        Bem-vindo ao seu escritório digital de inteligência de carreira.
                    </p>
                </div>
                <ConfigActions domain="home" />
            </div>

            {/* Status da Análise */}
            <WorkspaceCard
                title="Status da Análise"
                icon={<IconActivity className="w-5 h-5" />}
                badge={
                    <span className="text-[12px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Ativo
                    </span>
                }
            >
                <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="text-center p-3 bg-[#f8fafc] rounded-lg">
                        <p className="text-[24px] font-bold text-[#0f172a]">{totalSkills}</p>
                        <p className="text-[12px] text-[#64748b]">Skills mapeadas</p>
                    </div>
                    <div className="text-center p-3 bg-[#f8fafc] rounded-lg">
                        <p className="text-[24px] font-bold text-[#0f172a]">{skill_groups.length}</p>
                        <p className="text-[12px] text-[#64748b]">Categorias</p>
                    </div>
                    <div className="text-center p-3 bg-[#f8fafc] rounded-lg">
                        <p className="text-[24px] font-bold text-[#0f172a]">{pipeline.jobAnalysis ? 1 : 0}</p>
                        <p className="text-[12px] text-[#64748b]">Vagas analisadas</p>
                    </div>
                </div>
            </WorkspaceCard>

            {/* Grid de cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Perfil Técnico */}
                <WorkspaceCard
                    title="Perfil Técnico"
                    icon={<IconUser className="w-5 h-5" />}
                    onClick={() => navigate("/workspace/profile")}
                >
                    <div className="space-y-2">
                        <p className="font-medium text-[#0f172a]">{pessoal.nome}</p>
                        <p className="text-[13px]">{pessoal.titulo}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {skill_groups.slice(0, 3).map((g, i) => (
                                <span
                                    key={i}
                                    className="text-[11px] bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded"
                                >
                                    {g.titulo}
                                </span>
                            ))}
                        </div>
                    </div>
                </WorkspaceCard>

                {/* Últimas Vagas */}
                <WorkspaceCard
                    title="Últimas Vagas"
                    icon={<IconBriefcase className="w-5 h-5" />}
                    onClick={() => navigate("/workspace/jobs")}
                >
                    <div className="space-y-3">
                        <p className="text-[#94a3b8] italic">Nenhuma vaga analisada ainda.</p>
                        <div className="flex items-center gap-2 text-[#6366f1] text-[13px] font-medium">
                            <span>Analisar primeira vaga</span>
                            <IconArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </WorkspaceCard>

                {/* Últimos Currículos */}
                <WorkspaceCard
                    title="Últimos Currículos"
                    icon={<IconFile className="w-5 h-5" />}
                    onClick={() => navigate("/workspace/resume")}
                >
                    <div className="space-y-3">
                        {pipeline.tailoredResume ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    <span className="text-[13px]">
                                        Tailored: {pipeline.jobAnalysis?.parsed.titulo ?? "Vaga"}
                                    </span>
                                </div>
                                <p className="text-[12px] text-[#94a3b8]">
                                    Aderência: {pipeline.jobAnalysis?.match.aderencia ?? 0}%
                                </p>
                            </>
                        ) : (
                            <p className="text-[#94a3b8] italic">Nenhum currículo gerado ainda.</p>
                        )}
                        <div className="flex items-center gap-2 text-[#6366f1] text-[13px] font-medium">
                            <span>{pipeline.tailoredResume ? "Ver currículo" : "Gerar primeiro currículo"}</span>
                            <IconArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </WorkspaceCard>

                {/* Fontes Conectadas */}
                <WorkspaceCard
                    title="Fontes Conectadas"
                    icon={<IconDatabase className="w-5 h-5" />}
                    onClick={() => navigate("/workspace/sources")}
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span className="text-[13px]">skill-data.json (SKE)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span className="text-[13px]">resume-default.ts (Dados base)</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#6366f1] text-[13px] font-medium mt-2">
                            <span>Conectar mais fontes</span>
                            <IconArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </WorkspaceCard>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-xl p-6 text-white">
                <h3 className="text-[16px] font-semibold mb-1">Fluxo recomendado</h3>
                <p className="text-[13px] text-[#94a3b8] mb-4">
                    Siga estas etapas para máxima inteligência de carreira.
                </p>
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { step: "1", label: "Conectar fontes", route: "/workspace/sources", done: pipeline.sourcesCollected },
                        { step: "2", label: "Analisar perfil", route: "/workspace/profile", done: !!pipeline.profileData },
                        { step: "3", label: "Analisar vaga", route: "/workspace/jobs", done: !!pipeline.jobAnalysis },
                        { step: "4", label: "Gerar currículo", route: "/workspace/resume", done: !!pipeline.tailoredResume },
                    ].map((item) => (
                        <button
                            key={item.step}
                            onClick={() => navigate(item.route)}
                            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <span className={`w-8 h-8 rounded-full text-white text-[14px] font-bold flex items-center justify-center ${item.done ? "bg-emerald-500" : "bg-[#6366f1]"
                                }`}>
                                {item.done ? "✓" : item.step}
                            </span>
                            <span className="text-[12px] text-center">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

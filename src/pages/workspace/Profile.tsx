/**
 * Profile — Perfil Inteligente do Career Intelligence Workspace.
 *
 * Não é um currículo — é o modelo vivo do usuário inferido de dados.
 *
 * Seções:
 * - Skills detectadas
 * - Experiências inferidas
 * - Tecnologias dominadas vs experimentais
 * - Projetos analisados
 * - Lacunas detectadas
 * - Confiança por habilidade
 *
 * Dados de: skill-data.json, resume-default.ts, dados declarativos
 */

import { useState } from "react";
import { WorkspaceCard } from "../../components/workspace/WorkspaceCard";
import { ConfigActions } from "../../components/workspace/ConfigActions";
import { PipelineExecutionViewer } from "../../components/pipeline/PipelineExecutionViewer";
import { defaultResumeData } from "../../data/resume-default";
import {
    usePipeline,
    setProfile,
    setProfileData,
    type SimpleProfile,
    type PipelineSource,
} from "../../lib/pipeline-store";
import { runStepSequence } from "../../lib/execution-store";

/* ── Ícones ── */

const IconShield = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
);

const IconTrendingUp = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
    </svg>
);

const IconCode = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </svg>
);

const IconTarget = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const IconAlertTriangle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </svg>
);

const IconLayers = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
        <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
        <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    </svg>
);

/* ── Helpers ── */

function getLevelColor(nivel: string): string {
    switch (nivel) {
        case "dominio-solido":
            return "bg-emerald-100 text-emerald-700";
        case "experiencia-avancada":
            return "bg-blue-100 text-blue-700";
        case "experiencia-pratica":
            return "bg-amber-100 text-amber-700";
        case "conhecimento-basico":
            return "bg-gray-100 text-gray-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
}

function getLevelLabel(nivel: string): string {
    switch (nivel) {
        case "dominio-solido":
            return "Domínio Sólido";
        case "experiencia-avancada":
            return "Avançado";
        case "experiencia-pratica":
            return "Prático";
        case "conhecimento-basico":
            return "Básico";
        default:
            return nivel;
    }
}

function getConfidenceBar(confidence: number) {
    const width = Math.min(100, Math.max(0, confidence));
    let color = "bg-emerald-500";
    if (width < 40) color = "bg-red-400";
    else if (width < 70) color = "bg-amber-400";

    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${width}%` }} />
            </div>
            <span className="text-[11px] font-medium text-[#64748b] w-8 text-right">{width}%</span>
        </div>
    );
}

function stripBold(text: string): string {
    return text.replace(/\*\*/g, "");
}

/* ── Extração determinística de perfil ── */

const SKILL_KEYWORDS = [
    "react", "node", "python", "php", "laravel", "typescript", "javascript",
    "java", "go", "rust", "ruby", "vue", "angular", "svelte", "next", "nuxt",
    "express", "fastify", "django", "flask", "spring", "dotnet", "graphql",
    "rest", "sql", "nosql", "html", "css", "sass", "tailwind", "webpack",
    "vite", "jest", "cypress", "git", "linux", "bash",
];

const TECH_KEYWORDS = [
    "aws", "docker", "kubernetes", "gcp", "azure", "terraform", "ansible",
    "nginx", "redis", "kafka", "rabbitmq", "elasticsearch", "jenkins",
    "mongodb", "postgres", "mysql", "sqlite", "dynamodb", "s3",
    "grafana", "prometheus", "datadog", "vercel", "netlify", "heroku",
];

const DOMAIN_KEYWORDS = [
    "web", "mobile", "devops", "backend", "frontend", "fullstack",
    "cloud", "data", "api", "microservices", "saas", "ecommerce",
    "fintech", "security", "iot", "machine learning", "ai",
];

function extractProfileFromSources(sources: PipelineSource[]): SimpleProfile {
    const text = sources
        .map((s) => `${s.label} ${s.detail ?? ""} ${s.type}`)
        .join(" ")
        .toLowerCase();

    const match = (keywords: string[]) =>
        [...new Set(keywords.filter((kw) => text.includes(kw)))];

    return {
        skills: match(SKILL_KEYWORDS),
        technologies: match(TECH_KEYWORDS),
        domains: match(DOMAIN_KEYWORDS),
    };
}

/* ── Componente ── */

export default function Profile() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [extractionEmpty, setExtractionEmpty] = useState(false);
    const pipeline = usePipeline();

    const {
        pessoal,
        skill_groups,
        experiencias,
        projetos,
    } = defaultResumeData;

    /** Analisa perfil: extrai skills das sources e armazena no pipeline */
    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setExtractionEmpty(false);

        // Variável compartilhada entre step callbacks
        let profile: SimpleProfile = { skills: [], technologies: [], domains: [] };

        // Build source execution entries for the ledger
        const sourceExecutions = pipeline.sources.map((s) => ({
            sourceId: s.id,
            path: s.detail ?? s.label,
            type: s.type,
            status: s.status === "connected" ? "success" as const : "skipped" as const,
            skillsDetected: [] as string[],
            logs: [`Processed ${s.type}: ${s.label}`],
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
        }));

        await runStepSequence([
            { step: "discovery", log: "Reading pipeline sources" },
            { step: "collect", log: `Scanning ${pipeline.sources.length} source(s)` },
            { step: "normalize", log: "Normalizing skills" },
            {
                step: "extract",
                log: "Extracting skills & technologies",
                work: () => {
                    // Extração determinística — acontece DENTRO do step
                    profile = extractProfileFromSources(pipeline.sources);
                    // Atualiza source executions com skills detectadas (reflete no ledger)
                    for (const se of sourceExecutions) {
                        se.skillsDetected = [...profile.skills, ...profile.technologies];
                        se.finishedAt = new Date().toISOString();
                    }
                },
            },
            {
                step: "truth",
                log: "Building truth model",
                work: () => {
                    const totalExtracted = profile.skills.length + profile.technologies.length + profile.domains.length;
                    if (totalExtracted === 0) {
                        setExtractionEmpty(true);
                        // Armazena perfil vazio — NÃO chama setProfileData (downstream não avança)
                        setProfile(profile);
                        return;
                    }
                    // Armazena perfil derivado da execução
                    setProfile(profile);
                    // ProfileData para downstream (Resume.tsx): defaultData + metadata de execução
                    setProfileData({
                        ...defaultResumeData,
                        metadata: {
                            ...defaultResumeData.metadata,
                            gerado_por: "ske",
                            gerado_em: new Date().toISOString(),
                        },
                    });
                },
            },
        ], "profile", sourceExecutions);

        setIsAnalyzing(false);
    };

    // Agregar skills por nível
    const allSkills = skill_groups.flatMap((g) =>
        g.skills.map((s) => ({ ...s, grupo: g.titulo })),
    );

    const dominioSolido = allSkills.filter((s) => s.nivel === "dominio-solido");
    const pratico = allSkills.filter((s) => s.nivel === "experiencia-pratica");
    const basico = allSkills.filter((s) => s.nivel === "conhecimento-basico");
    const avancado = allSkills.filter((s) => s.nivel === "experiencia-avancada");

    return (
        <div className="space-y-8">
            {/* Execution viewer */}
            <PipelineExecutionViewer />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[28px] font-bold text-[#0f172a] tracking-tight">
                        Perfil Inteligente
                    </h1>
                    <p className="text-[15px] text-[#64748b] mt-1">
                        Modelo vivo inferido de suas fontes — não é um currículo, é inteligência.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ConfigActions domain="profile" />
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !pipeline.sourcesCollected}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-[14px] font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        title={!pipeline.sourcesCollected ? "Complete o Passo 1 (Sources) primeiro" : ""}
                    >
                        {isAnalyzing && (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        {isAnalyzing ? "Analisando perfil..." : pipeline.profileReady ? "✓ Reanalisar" : "Analisar Perfil"}
                    </button>
                </div>
            </div>

            {/* Feedback durante análise */}
            {isAnalyzing && (
                <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <svg className="animate-spin h-4 w-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-[14px] text-blue-600">
                        Analisando fontes conectadas e extraindo skills...
                    </p>
                </div>
            )}

            {/* Pipeline prerequisites */}
            {!pipeline.sourcesCollected && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <p className="text-[14px] text-amber-800">
                        <strong>Passo 1 pendente:</strong> Vá em <strong>Sources</strong> e execute a coleta antes de analisar o perfil.
                    </p>
                </div>
            )}

            {/* Warning: extraction yielded nothing */}
            {extractionEmpty && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <IconAlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-[14px] font-medium text-amber-800">
                            Nenhum dado extraído das fontes
                        </p>
                        <p className="text-[12px] text-amber-600">
                            As fontes conectadas não contêm keywords reconhecíveis. Adicione fontes com mais detalhes em <strong>Sources</strong> (ex: descrição manual de skills, repositório GitHub).
                        </p>
                    </div>
                </div>
            )}

            {pipeline.profileReady && !extractionEmpty && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div className="flex-1">
                        <p className="text-[14px] font-medium text-emerald-800">
                            Perfil analisado com sucesso — {(pipeline.profile?.skills.length ?? 0) + (pipeline.profile?.technologies.length ?? 0) + (pipeline.profile?.domains.length ?? 0)} itens extraídos
                        </p>
                        <p className="text-[12px] text-emerald-600">
                            Prossiga para <strong>Jobs</strong> para analisar uma vaga.
                        </p>
                    </div>
                </div>
            )}

            {/* Perfil Extraído das Sources */}
            {pipeline.profile && (pipeline.profile.skills.length > 0 || pipeline.profile.technologies.length > 0 || pipeline.profile.domains.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <WorkspaceCard title="Skills Extraídas" icon={<IconCode className="w-5 h-5" />}
                        badge={<span className="text-[12px] font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{pipeline.profile.skills.length}</span>}>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {pipeline.profile.skills.map((s) => (
                                <span key={s} className="text-[12px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md">{s}</span>
                            ))}
                        </div>
                    </WorkspaceCard>
                    <WorkspaceCard title="Tecnologias" icon={<IconShield className="w-5 h-5" />}
                        badge={<span className="text-[12px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{pipeline.profile.technologies.length}</span>}>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {pipeline.profile.technologies.map((t) => (
                                <span key={t} className="text-[12px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">{t}</span>
                            ))}
                        </div>
                    </WorkspaceCard>
                    <WorkspaceCard title="Domínios" icon={<IconTarget className="w-5 h-5" />}
                        badge={<span className="text-[12px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{pipeline.profile.domains.length}</span>}>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {pipeline.profile.domains.map((d) => (
                                <span key={d} className="text-[12px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md">{d}</span>
                            ))}
                        </div>
                    </WorkspaceCard>
                </div>
            )}

            {/* Identity */}
            <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-xl p-6 text-white">
                <h2 className="text-[22px] font-bold">{pessoal.nome}</h2>
                <p className="text-[14px] text-[#94a3b8] mt-1">{pessoal.titulo}</p>
                <div className="flex flex-wrap gap-3 mt-4">
                    <span className="text-[12px] bg-white/10 px-3 py-1 rounded-full">{pessoal.localizacao}</span>
                    <span className="text-[12px] bg-white/10 px-3 py-1 rounded-full">{pessoal.email}</span>
                </div>
            </div>

            {/* Skills detectadas — com confiança */}
            <WorkspaceCard
                title="Skills Detectadas"
                icon={<IconShield className="w-5 h-5" />}
                badge={
                    <span className="text-[12px] font-medium text-[#64748b] bg-[#f1f5f9] px-2.5 py-1 rounded-full">
                        {allSkills.length} skills
                    </span>
                }
            >
                <div className="space-y-3 mt-2">
                    {allSkills.slice(0, 12).map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="text-[13px] font-medium text-[#0f172a] min-w-[180px] truncate">
                                {stripBold(s.nome).split("–")[0].split("—")[0].trim().slice(0, 50)}
                            </span>
                            <span className={`text-[11px] px-2 py-0.5 rounded ${getLevelColor(s.nivel)}`}>
                                {getLevelLabel(s.nivel)}
                            </span>
                            {getConfidenceBar(
                                s.nivel === "dominio-solido" ? 90 :
                                    s.nivel === "experiencia-avancada" ? 70 :
                                        s.nivel === "experiencia-pratica" ? 50 : 30
                            )}
                            <span className="text-[11px] text-[#94a3b8] whitespace-nowrap">
                                {s.source === "truth-layer" ? "SKE" : "declarativo"}
                            </span>
                        </div>
                    ))}
                </div>
            </WorkspaceCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tecnologias dominadas */}
                <WorkspaceCard
                    title="Tecnologias Dominadas"
                    icon={<IconCode className="w-5 h-5" />}
                    badge={
                        <span className="text-[12px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                            {dominioSolido.length + avancado.length}
                        </span>
                    }
                >
                    <div className="flex flex-wrap gap-2 mt-1">
                        {[...dominioSolido, ...avancado].map((s, i) => (
                            <span
                                key={i}
                                className={`text-[12px] px-2.5 py-1 rounded-md ${s.nivel === "dominio-solido"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-blue-50 text-blue-700"
                                    }`}
                            >
                                {stripBold(s.nome).split("–")[0].split("—")[0].trim().slice(0, 40)}
                            </span>
                        ))}
                    </div>
                </WorkspaceCard>

                {/* Tecnologias experimentais */}
                <WorkspaceCard
                    title="Tecnologias Experimentais"
                    icon={<IconTrendingUp className="w-5 h-5" />}
                    badge={
                        <span className="text-[12px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                            {pratico.length + basico.length}
                        </span>
                    }
                >
                    <div className="flex flex-wrap gap-2 mt-1">
                        {[...pratico, ...basico].map((s, i) => (
                            <span key={i} className="text-[12px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md">
                                {stripBold(s.nome).split("–")[0].split("—")[0].trim().slice(0, 40)}
                            </span>
                        ))}
                    </div>
                </WorkspaceCard>
            </div>

            {/* Experiências inferidas */}
            <WorkspaceCard
                title="Experiências Inferidas"
                icon={<IconLayers className="w-5 h-5" />}
                badge={
                    <span className="text-[12px] font-medium text-[#64748b] bg-[#f1f5f9] px-2.5 py-1 rounded-full">
                        {experiencias.length} posições
                    </span>
                }
            >
                <div className="space-y-4 mt-2">
                    {experiencias.map((exp, i) => (
                        <div key={i} className="flex items-start gap-3 pb-3 border-b border-[#f1f5f9] last:border-0 last:pb-0">
                            <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${exp.atual ? "bg-emerald-400" : "bg-[#cbd5e1]"}`} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between gap-2">
                                    <p className="text-[14px] font-medium text-[#0f172a] truncate">{exp.cargo}</p>
                                    <span className="text-[12px] text-[#94a3b8] whitespace-nowrap">{exp.periodo}</span>
                                </div>
                                <p className="text-[13px] text-[#64748b]">{exp.empresa}</p>
                            </div>
                            <span className="text-[11px] text-[#94a3b8] whitespace-nowrap">
                                {exp.source === "truth-layer" ? "SKE" : "declarativo"}
                            </span>
                        </div>
                    ))}
                </div>
            </WorkspaceCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Projetos analisados */}
                <WorkspaceCard
                    title="Projetos Analisados"
                    icon={<IconTarget className="w-5 h-5" />}
                    badge={
                        <span className="text-[12px] font-medium text-[#64748b] bg-[#f1f5f9] px-2.5 py-1 rounded-full">
                            {projetos.length}
                        </span>
                    }
                >
                    <div className="space-y-3 mt-1">
                        {projetos.map((proj, i) => (
                            <div key={i} className="p-3 bg-[#f8fafc] rounded-lg">
                                <p className="text-[13px] font-medium text-[#0f172a]">{proj.nome}</p>
                                {proj.subtitulo && (
                                    <p className="text-[12px] text-[#64748b]">{proj.subtitulo}</p>
                                )}
                                <p className="text-[12px] text-[#94a3b8] mt-1 line-clamp-2">{proj.descricao}</p>
                            </div>
                        ))}
                    </div>
                </WorkspaceCard>

                {/* Lacunas detectadas */}
                <WorkspaceCard
                    title="Lacunas Detectadas"
                    icon={<IconAlertTriangle className="w-5 h-5" />}
                >
                    <div className="space-y-3 mt-1">
                        <p className="text-[13px] text-[#94a3b8] italic">
                            As lacunas são identificadas automaticamente ao comparar seu perfil com vagas analisadas.
                        </p>
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <p className="text-[13px] text-amber-700">
                                Analise uma vaga em <span className="font-medium">Jobs</span> para ver lacunas específicas do seu perfil.
                            </p>
                        </div>
                    </div>
                </WorkspaceCard>
            </div>

            {/* Summary table — por categoria */}
            <WorkspaceCard title="Distribuição por Categoria" icon={<IconShield className="w-5 h-5" />}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {skill_groups.map((g, i) => (
                        <div key={i} className="text-center p-3 bg-[#f8fafc] rounded-lg">
                            <p className="text-[20px] font-bold text-[#0f172a]">{g.skills.length}</p>
                            <p className="text-[12px] text-[#64748b] mt-0.5">{g.titulo}</p>
                        </div>
                    ))}
                </div>
            </WorkspaceCard>
        </div>
    );
}

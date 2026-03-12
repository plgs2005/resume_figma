/**
 * Sources — Gerenciamento de fontes de dados do Career Intelligence Workspace.
 *
 * Permite o usuário conectar/selecionar fontes para análise:
 * - GitHub
 * - Repositórios Git locais
 * - Diretórios locais
 * - Upload de currículo PDF
 * - Upload de projetos ZIP
 * - Export de perfil LinkedIn
 * - Descrição manual de experiência
 */

import { useState, useEffect } from "react";
import { WorkspaceCard } from "../../components/workspace/WorkspaceCard";
import { ConfigActions } from "../../components/workspace/ConfigActions";
import { PipelineExecutionViewer } from "../../components/pipeline/PipelineExecutionViewer";
import {
    getSourcesConfig,
    loadSourcesConfig,
    subscribeDomain,
    type SourceEntry,
} from "../../lib/config-loader";
import {
    usePipeline,
    collectSources,
    addSource,
    removeSource,
    initSources,
    replaceSources,
    type PipelineSource,
    type SourceType,
} from "../../lib/pipeline-store";
import { runStepSequence } from "../../lib/execution-store";

/* ── Configuração dos tipos de source ── */

interface SourceTypeConfig {
    type: SourceType;
    label: string;
    description: string;
    icon: React.ReactNode;
}

const IconGitHub = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
);

const IconFolder = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
);

const IconGitBranch = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <line x1="6" x2="6" y1="3" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
);

const IconFileUp = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M12 12v6" />
        <path d="m15 15-3-3-3 3" />
    </svg>
);

const IconLinkedin = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const IconEdit = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
    </svg>
);

const IconPlus = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M5 12h14" />
        <path d="M12 5v14" />
    </svg>
);

const sourceTypes: SourceTypeConfig[] = [
    {
        type: "github",
        label: "GitHub",
        description: "Conectar repositórios GitHub para análise automatizada",
        icon: <IconGitHub className="w-5 h-5" />,
    },
    {
        type: "local-repo",
        label: "Repositório Git Local",
        description: "Selecionar repositório Git do sistema local",
        icon: <IconGitBranch className="w-5 h-5" />,
    },
    {
        type: "local-folder",
        label: "Diretório Local",
        description: "Selecionar pasta de projetos para análise",
        icon: <IconFolder className="w-5 h-5" />,
    },
    {
        type: "resume-file",
        label: "Currículo PDF",
        description: "Upload de currículo em formato PDF",
        icon: <IconFileUp className="w-5 h-5" />,
    },
    {
        type: "linkedin-export",
        label: "LinkedIn Export",
        description: "Importar dados exportados do LinkedIn",
        icon: <IconLinkedin className="w-5 h-5" />,
    },
    {
        type: "manual-input",
        label: "Entrada Manual",
        description: "Descrever experiência e skills manualmente",
        icon: <IconEdit className="w-5 h-5" />,
    },
];

/* ── Componente ── */

/* ── Helper: converte sources do config para array de PipelineSource ── */

function configSourcesToArray(sources: SourceEntry[]): PipelineSource[] {
    return sources.map((src) => ({
        id: src.id,
        type: (src.type as SourceType) ?? "manual-input",
        label: src.label,
        status: src.enabled ? "connected" as const : "pending" as const,
        detail: src.path ?? undefined,
    }));
}

function pipelineSourceToConfig(source: PipelineSource): SourceEntry {
    return {
        id: source.id,
        type: source.type,
        label: source.label,
        path: source.detail ?? source.label,
        enabled: source.status === "connected",
    };
}

/* ── Helpers de configuração por tipo de source ── */

const SOURCE_INPUT_CONFIG: Record<SourceType, { label: string; placeholder: string; multiline?: boolean }> = {
    github: { label: "Usuário ou URL do repositório", placeholder: "Ex: plgs2005 ou https://github.com/plgs2005/resume_figma" },
    "local-repo": { label: "Caminho do repositório", placeholder: "Ex: /home/user/projects/my-app" },
    "local-folder": { label: "Caminho do diretório", placeholder: "Ex: /home/user/projects" },
    "resume-file": { label: "Nome ou caminho do arquivo PDF", placeholder: "Ex: curriculo-2026.pdf" },
    "linkedin-export": { label: "Caminho do arquivo de export", placeholder: "Ex: linkedin-export.zip" },
    "manual-input": { label: "Descreva sua experiência / skills", placeholder: "Ex: 5 anos com React, TypeScript, Node.js...", multiline: true },
};

export default function Sources() {
    const [showAddSource, setShowAddSource] = useState(false);
    const [isCollecting, setIsCollecting] = useState(false);
    const pipeline = usePipeline();

    // Modal de configuração de source
    const [pendingType, setPendingType] = useState<SourceType | null>(null);
    const [inputValue, setInputValue] = useState("");

    // Inicializa pipeline com sources do config (uma vez)
    useEffect(() => {
        const configSources = configSourcesToArray(getSourcesConfig().sources);
        initSources(configSources);

        const unsub = subscribeDomain("sources", (cfg) => {
            replaceSources(configSourcesToArray(cfg.sources));
        });

        return unsub;
    }, []);

    // Sources lidas diretamente do pipeline (single source of truth)
    const sources = pipeline.sources;

    /** Coleta dados de todas as sources conectadas e armazena no pipeline */
    const handleCollect = async () => {
        setIsCollecting(true);

        // Build source execution entries for ledger persistence
        const sourceExecutions = sources.map((s) => ({
            sourceId: s.id,
            path: s.detail ?? s.label,
            type: s.type,
            status: s.status === "connected" ? "success" as const : "skipped" as const,
            skillsDetected: [] as string[],
            logs: [`Scanned ${s.type}: ${s.label}`],
            startedAt: new Date().toISOString(),
            finishedAt: new Date().toISOString(),
        }));

        await runStepSequence([
            { step: "discovery", log: "Scanning connected sources" },
            { step: "collect", log: `Collecting data from ${sources.length} source(s)` },
            { step: "normalize", log: "Normalizing source metadata" },
            { step: "extract", log: "Extracting identifiers" },
            {
                step: "truth",
                log: "Building source index",
                work: () => {
                    collectSources();
                    // Update finish timestamps
                    for (const se of sourceExecutions) {
                        se.finishedAt = new Date().toISOString();
                    }
                },
            },
        ], "sources", sourceExecutions);

        setIsCollecting(false);
    };

    /** Abre o modal de configuração para o tipo selecionado */
    const handleSourceTypeClick = (type: SourceType) => {
        setPendingType(type);
        setInputValue("");
    };

    /** Confirma criação da source e adiciona ao pipeline */
    const handleConfirmSource = () => {
        if (!pendingType) return;
        const typeConfig = sourceTypes.find((st) => st.type === pendingType);
        const newSource: PipelineSource = {
            id: crypto.randomUUID(),
            type: pendingType,
            label: inputValue.trim() || typeConfig?.label || pendingType,
            status: "connected",
            detail: inputValue.trim() || undefined,
        };
        addSource(newSource);
        loadSourcesConfig({
            ...getSourcesConfig(),
            sources: [...getSourcesConfig().sources, pipelineSourceToConfig(newSource)],
        });
        setPendingType(null);
        setInputValue("");
    };

    /** Cancela o modal */
    const handleCancelModal = () => {
        setPendingType(null);
        setInputValue("");
    };

    /** Remove uma source do pipeline */
    const handleRemoveSource = (id: string) => {
        removeSource(id);
        loadSourcesConfig({
            ...getSourcesConfig(),
            sources: getSourcesConfig().sources.filter((source) => source.id !== id),
        });
    };

    const getStatusColor = (status: PipelineSource["status"]) => {
        switch (status) {
            case "connected":
                return "bg-emerald-400";
            case "pending":
                return "bg-amber-400";
            case "error":
                return "bg-red-400";
        }
    };

    const getStatusLabel = (status: PipelineSource["status"]) => {
        switch (status) {
            case "connected":
                return "Conectado";
            case "pending":
                return "Pendente";
            case "error":
                return "Erro";
        }
    };

    return (
        <div className="space-y-8">
            {/* Execution viewer */}
            <PipelineExecutionViewer />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[28px] font-bold text-[#0f172a] tracking-tight">
                        Sources
                    </h1>
                    <p className="text-[15px] text-[#64748b] mt-1">
                        Gerencie as fontes de dados para análise de carreira.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ConfigActions domain="sources" />
                    <button
                        onClick={handleCollect}
                        disabled={isCollecting}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-[14px] font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                        {isCollecting ? "Coletando…" : pipeline.sourcesCollected ? "✓ Recoletar" : "Iniciar Coleta"}
                    </button>
                    <button
                        onClick={() => setShowAddSource(!showAddSource)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#0f172a] text-white rounded-lg text-[14px] font-medium hover:bg-[#1e293b] transition-colors"
                    >
                        <IconPlus className="w-4 h-4" />
                        Add Source
                    </button>
                </div>
            </div>

            {/* Pipeline status */}
            {pipeline.sourcesCollected && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div className="flex-1">
                        <p className="text-[14px] font-medium text-emerald-800">
                            Passo 1 completo — {pipeline.sourcesCount} fonte(s) coletada(s)
                        </p>
                        <p className="text-[12px] text-emerald-600">
                            Prossiga para <strong>Profile</strong> para análise do perfil.
                        </p>
                    </div>
                </div>
            )}

            {/* Fontes conectadas */}
            <div className="space-y-4">
                <h2 className="text-[16px] font-semibold text-[#0f172a]">
                    Fontes conectadas ({sources.length})
                </h2>
                {sources.map((source) => (
                    <div
                        key={source.id}
                        className="flex items-center justify-between bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#475569]">
                                {sourceTypes.find((st) => st.type === source.type)?.icon}
                            </div>
                            <div>
                                <p className="text-[14px] font-medium text-[#0f172a]">{source.label}</p>
                                {source.detail && (
                                    <p className="text-[12px] text-[#94a3b8] mt-0.5">{source.detail}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`}></span>
                                <span className="text-[12px] text-[#64748b]">{getStatusLabel(source.status)}</span>
                            </div>
                            <button
                                onClick={() => handleRemoveSource(source.id)}
                                className="text-[12px] text-[#94a3b8] hover:text-red-500 transition-colors"
                                title="Remover fonte"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Adicionar nova fonte */}
            {showAddSource && (
                <div className="space-y-4">
                    <h2 className="text-[16px] font-semibold text-[#0f172a]">
                        Selecionar tipo de fonte
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sourceTypes.map((st) => (
                            <WorkspaceCard
                                key={st.type}
                                title={st.label}
                                icon={st.icon}
                                onClick={() => handleSourceTypeClick(st.type)}
                            >
                                <p className="text-[13px]">{st.description}</p>
                            </WorkspaceCard>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de configuração de source */}
            {pendingType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal header */}
                        <div className="flex items-center gap-3 px-6 pt-6 pb-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#475569]">
                                {sourceTypes.find((st) => st.type === pendingType)?.icon}
                            </div>
                            <div>
                                <h3 className="text-[16px] font-semibold text-[#0f172a]">
                                    Configurar {sourceTypes.find((st) => st.type === pendingType)?.label}
                                </h3>
                                <p className="text-[12px] text-[#64748b]">
                                    {sourceTypes.find((st) => st.type === pendingType)?.description}
                                </p>
                            </div>
                        </div>

                        {/* Modal body */}
                        <div className="px-6 py-4">
                            <label className="block text-[13px] font-medium text-[#475569] mb-1.5">
                                {SOURCE_INPUT_CONFIG[pendingType].label}
                            </label>
                            {SOURCE_INPUT_CONFIG[pendingType].multiline ? (
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={SOURCE_INPUT_CONFIG[pendingType].placeholder}
                                    rows={4}
                                    autoFocus
                                    className="w-full px-3 py-2 text-[14px] border border-[#e2e8f0] rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1]"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={SOURCE_INPUT_CONFIG[pendingType].placeholder}
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && handleConfirmSource()}
                                    className="w-full px-3 py-2 text-[14px] border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1]"
                                />
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
                            <button
                                onClick={handleCancelModal}
                                className="px-4 py-2 text-[14px] font-medium text-[#64748b] hover:text-[#0f172a] transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmSource}
                                className="px-5 py-2 bg-[#0f172a] text-white rounded-lg text-[14px] font-medium hover:bg-[#1e293b] transition-colors"
                            >
                                Conectar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * PipelineExecutionViewer — AI Execution Visualization Layer.
 *
 * Three AI-pattern components:
 * - Reasoning: execution steps (always visible after any execution, never auto-hides)
 * - Queue:     logs and per-source history (expandable, persistent)
 * - Shimmer:   active processing state (Skeleton-based, only during execution)
 *
 * RULES:
 * - NEVER auto-hides — always visible if there's any execution history
 * - Reasoning panel persists after execution completes
 * - Shows: last execution, previous execution, per-source result, errors
 * - These components VISUALIZE execution — they do NOT replace orchestrator logic
 */

import { useState, useMemo } from "react";
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from "../ui/collapsible";
import { Skeleton } from "../ui/skeleton";
import {
    useExecution,
    STEP_ORDER,
    STEP_LABELS,
    loadLedger,
    type ExecutionStatus,
    type PipelineExecution,
} from "../../lib/execution-store";

/* ── Ícones de status ── */

function StatusIcon({ status }: { status: ExecutionStatus }) {
    switch (status) {
        case "complete":
            return (
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            );
        case "active":
            return (
                <svg className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            );
        case "error":
            return (
                <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            );
        case "pending":
        default:
            return (
                <span className="w-4 h-4 rounded-full border-2 border-[#e2e8f0] flex-shrink-0" />
            );
    }
}

function statusTextColor(status: ExecutionStatus): string {
    switch (status) {
        case "complete": return "text-emerald-700";
        case "active": return "text-blue-700 font-medium";
        case "error": return "text-red-600";
        default: return "text-[#94a3b8]";
    }
}

/* ── Helpers ── */

const ORIGIN_LABELS: Record<string, string> = {
    sources: "Sources",
    profile: "Profile",
    jobs: "Jobs",
    resume: "Resume",
    unknown: "Pipeline",
};

function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(iso: string): string {
    try {
        return new Date(iso).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    } catch {
        return iso;
    }
}

/* ── Shimmer — Indicador de processamento ativo ── */

function ShimmerProcessing() {
    return (
        <div className="space-y-2 py-2">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <span className="absolute inset-0 rounded-full animate-ping bg-blue-400/30" />
                </div>
                <Skeleton className="h-3 w-48 rounded" />
            </div>
            <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-3 w-36 rounded" />
            </div>
            <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-3 w-40 rounded" />
            </div>
        </div>
    );
}

/* ── Reasoning — Steps de execução (sempre persiste) ── */

function ReasoningPanel({
    steps,
    isActive,
}: {
    steps: Record<string, ExecutionStatus>;
    isActive: boolean;
}) {
    return (
        <div className="space-y-1.5">
            {STEP_ORDER.map((step) => {
                const status = steps[step];
                return (
                    <div key={step} className="flex items-center gap-3 py-1">
                        <StatusIcon status={status} />
                        <span className={`text-[13px] ${statusTextColor(status)}`}>
                            {STEP_LABELS[step]}
                        </span>
                        {isActive && status === "active" && (
                            <span className="inline-flex items-center ml-auto">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse mr-1" />
                                <span className="text-[10px] text-blue-500 font-medium">processando</span>
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ── Queue — Logs e histórico per-source ── */

function QueuePanel({
    logs,
    sources,
}: {
    logs: string[];
    sources: PipelineExecution["sources"];
}) {
    const [showAll, setShowAll] = useState(false);
    const visibleLogs = showAll ? logs : logs.slice(-8);

    return (
        <div className="space-y-3">
            {/* Logs */}
            {logs.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-medium text-[#94a3b8] uppercase tracking-wider">
                            Log ({logs.length})
                        </p>
                        {logs.length > 8 && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="text-[10px] text-blue-500 hover:text-blue-700"
                            >
                                {showAll ? "Mostrar menos" : `Ver todos (${logs.length})`}
                            </button>
                        )}
                    </div>
                    <div className="space-y-0.5 max-h-40 overflow-y-auto">
                        {visibleLogs.map((log, i) => (
                            <p key={i} className="text-[11px] text-[#64748b] flex items-start gap-1.5">
                                <span className="text-[#94a3b8] mt-0.5 select-none">›</span>
                                {log}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Per-source results */}
            {sources.length > 0 && (
                <div>
                    <p className="text-[10px] font-medium text-[#94a3b8] uppercase tracking-wider mb-1.5">
                        Sources processadas ({sources.length})
                    </p>
                    <div className="space-y-1.5">
                        {sources.map((src, i) => {
                            const statusColor = src.status === "success" ? "bg-emerald-500"
                                : src.status === "error" ? "bg-red-500"
                                    : src.status === "partial" ? "bg-amber-500"
                                        : "bg-gray-400";
                            const statusLabel = src.status === "success" ? "OK"
                                : src.status === "error" ? "Erro"
                                    : src.status === "partial" ? "Parcial"
                                        : "Ignorado";

                            return (
                                <div key={i} className="flex items-center gap-2 text-[11px] p-1.5 rounded bg-black/[0.02]">
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColor}`} />
                                    <span className="text-[#475569] truncate flex-1 max-w-[200px]">{src.path}</span>
                                    <span className="text-[10px] text-[#94a3b8] font-medium">{src.type}</span>
                                    <span className={`text-[10px] font-medium ${src.status === "error" ? "text-red-600" : "text-[#94a3b8]"}`}>
                                        {statusLabel}
                                    </span>
                                    {src.skillsDetected.length > 0 && (
                                        <span className="text-[10px] text-emerald-600 font-medium">
                                            {src.skillsDetected.length} skills
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Per-source logs (expandable) */}
                    {sources.some((s) => s.logs.length > 0) && (
                        <details className="mt-2">
                            <summary className="text-[10px] text-blue-500 cursor-pointer hover:text-blue-700">
                                Ver logs por source
                            </summary>
                            <div className="mt-1 space-y-2">
                                {sources.filter((s) => s.logs.length > 0).map((src, i) => (
                                    <div key={i} className="pl-3 border-l-2 border-[#e2e8f0]">
                                        <p className="text-[10px] font-medium text-[#475569]">{src.path}</p>
                                        {src.logs.map((log, li) => (
                                            <p key={li} className="text-[10px] text-[#94a3b8]">› {log}</p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </details>
                    )}
                </div>
            )}

            {logs.length === 0 && sources.length === 0 && (
                <p className="text-[11px] text-[#94a3b8] italic">Nenhum log registrado.</p>
            )}
        </div>
    );
}

/* ── Componente de resumo de execução finalizada ── */

function ExecutionSummary({
    execution,
    label,
    defaultOpen = false,
}: {
    execution: PipelineExecution;
    label: string;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const allComplete = execution.summary.completedSteps === execution.summary.totalSteps;
    const hasErrors = execution.summary.errorSteps > 0;

    const borderColor = hasErrors
        ? "border-red-200"
        : allComplete
            ? "border-emerald-200"
            : "border-amber-200";
    const bgColor = hasErrors
        ? "bg-red-50/50"
        : allComplete
            ? "bg-emerald-50/50"
            : "bg-amber-50/50";
    const accentColor = hasErrors
        ? "text-red-600"
        : allComplete
            ? "text-emerald-700"
            : "text-amber-700";
    const badgeBg = hasErrors
        ? "bg-red-100 text-red-700"
        : allComplete
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-700";

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className={`rounded-xl border ${borderColor} ${bgColor} overflow-hidden`}>
                <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between px-5 py-3 hover:opacity-80 transition-opacity">
                        <div className="flex items-center gap-3">
                            {/* Status icon */}
                            {allComplete ? (
                                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : hasErrors ? (
                                <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-amber-500 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            )}
                            <span className={`text-[13px] font-semibold ${accentColor}`}>
                                {label}
                            </span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${badgeBg}`}>
                                {ORIGIN_LABELS[execution.origin] ?? "Pipeline"}
                            </span>
                            <span className="text-[11px] text-[#94a3b8]">
                                {formatTime(execution.finishedAt)} · {formatDuration(execution.durationMs)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] text-[#94a3b8] font-medium">
                                {execution.summary.completedSteps}/{execution.summary.totalSteps}
                            </span>
                            <svg
                                className={`w-3.5 h-3.5 text-[#94a3b8] transition-transform ${isOpen ? "rotate-180" : ""}`}
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round"
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                    </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="px-5 pb-4 space-y-3">
                        {/* Reasoning — execution steps */}
                        <ReasoningPanel steps={execution.steps} isActive={false} />

                        {/* Divider */}
                        <div className="border-t border-black/5" />

                        {/* Queue — logs + source results */}
                        <QueuePanel logs={execution.logs} sources={execution.sources} />
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}

/* ── Componente principal ── */

export function PipelineExecutionViewer() {
    const execution = useExecution();
    const [isOpen, setIsOpen] = useState(true);

    // Carregar histórico do ledger (memoizado para evitar re-parse a cada render)
    const ledger = useMemo(() => loadLedger(), [execution.lastFinished]);

    // Se não há execução ativa NEM histórico, não renderiza nada
    const hasHistory = ledger.lastExecution !== null;
    if (!execution.running && !hasHistory) return null;

    const completedCount = STEP_ORDER.filter(
        (s) => execution.steps[s] === "complete",
    ).length;

    return (
        <div className="space-y-2">
            {/* Execução ativa (tempo real) */}
            {execution.running && (
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <div className="rounded-xl border border-blue-200 bg-blue-50/50 overflow-hidden">
                        {/* Header */}
                        <CollapsibleTrigger asChild>
                            <button className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-blue-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-blue-500 animate-pulse" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
                                    </svg>
                                    <span className="text-[14px] font-semibold text-blue-800">
                                        Pipeline Execution
                                    </span>
                                    <span className="text-[12px] text-blue-500 font-medium">
                                        {completedCount}/{STEP_ORDER.length}
                                    </span>
                                </div>
                                <svg
                                    className={`w-4 h-4 text-blue-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    strokeLinecap="round" strokeLinejoin="round"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                        </CollapsibleTrigger>

                        {/* Steps */}
                        <CollapsibleContent>
                            <div className="px-5 pb-4 space-y-3">
                                {/* Reasoning — real-time step tracking */}
                                <ReasoningPanel steps={execution.steps} isActive={true} />

                                {/* Shimmer — active processing indicator */}
                                {execution.currentStep && (
                                    <ShimmerProcessing />
                                )}

                                {/* Queue — live logs */}
                                {execution.logs.length > 0 && (
                                    <div className="border-t border-blue-100 pt-3">
                                        <QueuePanel logs={execution.logs} sources={[]} />
                                    </div>
                                )}
                            </div>
                        </CollapsibleContent>
                    </div>
                </Collapsible>
            )}

            {/* Última execução finalizada */}
            {!execution.running && ledger.lastExecution && (
                <ExecutionSummary
                    execution={ledger.lastExecution}
                    label="Última execução"
                    defaultOpen={true}
                />
            )}

            {/* Execução anterior */}
            {!execution.running && ledger.previousExecution && (
                <ExecutionSummary
                    execution={ledger.previousExecution}
                    label="Execução anterior"
                    defaultOpen={false}
                />
            )}
        </div>
    );
}

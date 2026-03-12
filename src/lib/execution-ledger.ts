/**
 * Execution Ledger — Histórico persistente de execuções do pipeline.
 *
 * Armazena a última execução (lastExecution) e a execução anterior
 * (previousExecution) no localStorage.
 *
 * Cada execução registra:
 * - id, timestamp de início/fim
 * - status de cada step do pipeline
 * - logs gerados
 * - resultado por source (skillsDetected, status individual)
 *
 * Chave localStorage: career_engine_execution_ledger
 */

import type { ExecutionStep, ExecutionStatus } from "./execution-store";

/* ── Tipos ── */

/** Resultado de execução para uma source individual */
export interface SourceExecution {
  sourceId: string;
  path: string;
  type: string;
  status: "success" | "partial" | "error" | "skipped";
  skillsDetected: string[];
  logs: string[];
  startedAt: string;
  finishedAt: string;
}

/** Registro completo de uma execução do pipeline */
export interface PipelineExecution {
  id: string;
  startedAt: string;
  finishedAt: string;
  /** Duração em ms */
  durationMs: number;
  steps: Record<ExecutionStep, ExecutionStatus>;
  logs: string[];
  sources: SourceExecution[];
  /** Resumo rápido */
  summary: {
    totalSteps: number;
    completedSteps: number;
    errorSteps: number;
    sourcesProcessed: number;
    totalSkillsDetected: number;
  };
  /** Contexto de onde a execução foi disparada */
  origin: "sources" | "profile" | "jobs" | "resume" | "unknown";
}

/** Ledger com histórico de duas execuções */
export interface ExecutionLedger {
  lastExecution: PipelineExecution | null;
  previousExecution: PipelineExecution | null;
}

/* ── Constantes ── */

const LEDGER_KEY = "career_engine_execution_ledger";

/* ── Helpers internos ── */

function isLocalStorageAvailable(): boolean {
  try {
    const test = "__ls_ledger_test__";
    localStorage.setItem(test, "1");
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

const _available = isLocalStorageAvailable();

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `exec_${ts}_${rand}`;
}

/* ── API Pública ── */

/**
 * Carrega o ledger do localStorage.
 * Retorna { lastExecution: null, previousExecution: null } se vazio.
 */
export function loadLedger(): ExecutionLedger {
  if (!_available) return { lastExecution: null, previousExecution: null };
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (!raw) return { lastExecution: null, previousExecution: null };
    return JSON.parse(raw) as ExecutionLedger;
  } catch {
    localStorage.removeItem(LEDGER_KEY);
    return { lastExecution: null, previousExecution: null };
  }
}

/**
 * Persiste o ledger no localStorage.
 */
function persistLedger(ledger: ExecutionLedger): void {
  if (!_available) return;
  try {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
  } catch {
    console.warn("[execution-ledger] Falha ao persistir: quota excedida.");
  }
}

/**
 * Cria um novo PipelineExecution a partir do estado finalizado do execution-store.
 *
 * @param steps - Record<ExecutionStep, ExecutionStatus> final
 * @param logs - array de logs gerados durante a execução
 * @param startedAt - ISO string do início
 * @param origin - página que disparou a execução
 * @param sources - execuções individuais de sources (opcional)
 */
export function createPipelineExecution(
  steps: Record<ExecutionStep, ExecutionStatus>,
  logs: string[],
  startedAt: string,
  origin: PipelineExecution["origin"] = "unknown",
  sources: SourceExecution[] = [],
): PipelineExecution {
  const finishedAt = new Date().toISOString();
  const startMs = new Date(startedAt).getTime();
  const endMs = new Date(finishedAt).getTime();

  const stepEntries = Object.values(steps);
  const completedSteps = stepEntries.filter((s) => s === "complete").length;
  const errorSteps = stepEntries.filter((s) => s === "error").length;
  const totalSkillsDetected = sources.reduce(
    (acc, s) => acc + s.skillsDetected.length,
    0,
  );

  return {
    id: generateId(),
    startedAt,
    finishedAt,
    durationMs: endMs - startMs,
    steps: { ...steps },
    logs: [...logs],
    sources: [...sources],
    summary: {
      totalSteps: stepEntries.length,
      completedSteps,
      errorSteps,
      sourcesProcessed: sources.length,
      totalSkillsDetected,
    },
    origin,
  };
}

/**
 * Salva uma nova execução no ledger.
 * Move lastExecution → previousExecution, insere a nova em lastExecution.
 */
export function saveLedgerEntry(execution: PipelineExecution): void {
  const ledger = loadLedger();
  ledger.previousExecution = ledger.lastExecution;
  ledger.lastExecution = execution;
  persistLedger(ledger);
}

/**
 * Registra uma execução completa no ledger em um único passo.
 * Aceita o estado bruto do execution-store + metadados.
 */
export function recordExecution(
  steps: Record<ExecutionStep, ExecutionStatus>,
  logs: string[],
  startedAt: string,
  origin: PipelineExecution["origin"] = "unknown",
  sources: SourceExecution[] = [],
): PipelineExecution {
  const execution = createPipelineExecution(steps, logs, startedAt, origin, sources);
  saveLedgerEntry(execution);
  return execution;
}

/**
 * Limpa o ledger.
 */
export function clearLedger(): void {
  if (!_available) return;
  localStorage.removeItem(LEDGER_KEY);
}

/**
 * Retorna a última execução, ou null.
 */
export function getLastExecution(): PipelineExecution | null {
  return loadLedger().lastExecution;
}

/**
 * Retorna a execução anterior, ou null.
 */
export function getPreviousExecution(): PipelineExecution | null {
  return loadLedger().previousExecution;
}

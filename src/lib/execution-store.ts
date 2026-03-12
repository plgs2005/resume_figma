/**
 * Execution Store — Estado global de execução do pipeline.
 *
 * Fornece feedback visual em tempo real sobre processos longos
 * (coleta de sources, análise de perfil, análise de vaga).
 *
 * Padrão: singleton com subscribe/notify (idêntico ao pipeline-store).
 */

import { useEffect, useState } from "react";
import {
  recordExecution,
  loadLedger,
  getLastExecution,
  getPreviousExecution,
  type PipelineExecution,
  type SourceExecution,
  type ExecutionLedger,
} from "./execution-ledger";

// Re-export ledger types/functions para facilitar imports
export type { PipelineExecution, SourceExecution, ExecutionLedger };
export { loadLedger, getLastExecution, getPreviousExecution };

/* ── Tipos ── */

export type ExecutionStep =
  | "discovery"
  | "collect"
  | "normalize"
  | "extract"
  | "truth";

export type ExecutionStatus =
  | "pending"
  | "active"
  | "complete"
  | "error";

export type ExecutionOrigin = "sources" | "profile" | "jobs" | "resume" | "unknown";

export interface ExecutionState {
  running: boolean;
  currentStep: ExecutionStep | null;
  steps: Record<ExecutionStep, ExecutionStatus>;
  logs: string[];
  /** Metadata para ledger */
  startedAt: string | null;
  origin: ExecutionOrigin;
  /** Última execução finalizada (para exibir histórico) */
  lastFinished: PipelineExecution | null;
}

/* ── Labels para UI ── */

export const STEP_LABELS: Record<ExecutionStep, string> = {
  discovery: "Discover sources",
  collect: "Collect data",
  normalize: "Normalize skills",
  extract: "Extract skills",
  truth: "Build truth layer",
};

export const STEP_ORDER: ExecutionStep[] = [
  "discovery",
  "collect",
  "normalize",
  "extract",
  "truth",
];

/* ── Estado inicial ── */

const INITIAL_STATE: ExecutionState = {
  running: false,
  currentStep: null,
  steps: {
    discovery: "pending",
    collect: "pending",
    normalize: "pending",
    extract: "pending",
    truth: "pending",
  },
  logs: [],
  startedAt: null,
  origin: "unknown",
  lastFinished: null,
};

/* ── Singleton ── */

let _state: ExecutionState = { ...INITIAL_STATE, steps: { ...INITIAL_STATE.steps } };
let _listeners: Array<(state: ExecutionState) => void> = [];

function notify() {
  const snapshot: ExecutionState = {
    ..._state,
    steps: { ..._state.steps },
    logs: [..._state.logs],
  };
  for (const fn of _listeners) fn(snapshot);
}

/* ── API pública ── */

export function getExecutionState(): ExecutionState {
  return {
    ..._state,
    steps: { ..._state.steps },
    logs: [..._state.logs],
  };
}

export function subscribeExecution(
  listener: (state: ExecutionState) => void,
): () => void {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter((l) => l !== listener);
  };
}

/** Inicia uma nova execução, resetando todos os steps para pending */
export function startExecution(origin: ExecutionOrigin = "unknown"): void {
  _state = {
    running: true,
    currentStep: null,
    steps: {
      discovery: "pending",
      collect: "pending",
      normalize: "pending",
      extract: "pending",
      truth: "pending",
    },
    logs: [],
    startedAt: new Date().toISOString(),
    origin,
    lastFinished: _state.lastFinished, // preserva histórico anterior
  };
  notify();
}

/** Marca um step como ativo (em progresso) */
export function setStepActive(step: ExecutionStep): void {
  _state = {
    ..._state,
    currentStep: step,
    steps: { ..._state.steps, [step]: "active" },
  };
  notify();
}

/** Marca um step como concluído */
export function setStepComplete(step: ExecutionStep): void {
  _state = {
    ..._state,
    steps: { ..._state.steps, [step]: "complete" },
  };
  notify();
}

/** Marca um step como erro */
export function setStepError(step: ExecutionStep): void {
  _state = {
    ..._state,
    steps: { ..._state.steps, [step]: "error" },
  };
  notify();
}

/** Adiciona uma mensagem de log */
export function addLog(message: string): void {
  _state = {
    ..._state,
    logs: [..._state.logs, message],
  };
  notify();
}

/** Finaliza a execução (running = false) e grava no ledger */
export function finishExecution(sources: SourceExecution[] = []): void {
  // Grava no ledger antes de mudar o estado
  const recorded = recordExecution(
    _state.steps,
    _state.logs,
    _state.startedAt ?? new Date().toISOString(),
    _state.origin,
    sources,
  );

  _state = {
    ..._state,
    running: false,
    currentStep: null,
    lastFinished: recorded,
  };
  notify();
}

/** Reseta tudo para o estado inicial (preserva lastFinished) */
export function resetExecution(): void {
  _state = {
    ...INITIAL_STATE,
    steps: { ...INITIAL_STATE.steps },
    logs: [],
    lastFinished: _state.lastFinished,
  };
  notify();
}

/* ── Helper: executar sequência de steps com work callbacks ── */

/**
 * Descritor de step para sequência de execução.
 * - `work`: callback opcional executado DURANTE o step (antes de marcá-lo complete).
 *   Se `work` lança erro, o step é marcado como "error" e a sequência continua.
 */
export interface StepEntry {
  step: ExecutionStep;
  log: string;
  delay?: number;
  /** Processamento real a executar neste step. Erros são capturados por step. */
  work?: () => Promise<void> | void;
}

/**
 * Executa a sequência completa do pipeline:
 * 1. startExecution (origin)
 * 2. Para cada step: setActive → addLog → work() → setComplete (ou setError)
 * 3. finishExecution (grava ledger com sources)
 *
 * Processamento real DEVE acontecer dentro do `work` callback.
 * Isso garante que o ledger reflete o resultado real de cada step.
 */
export async function runStepSequence(
  sequence: StepEntry[],
  origin: ExecutionOrigin = "unknown",
  sources: SourceExecution[] = [],
): Promise<void> {
  startExecution(origin);
  for (const { step, log, delay = 200, work } of sequence) {
    setStepActive(step);
    addLog(log);
    try {
      if (work) await work();
      await new Promise((r) => setTimeout(r, delay));
      setStepComplete(step);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`[ERROR] ${step}: ${msg}`);
      setStepError(step);
    }
  }
  finishExecution(sources);
}

/* ── React Hook ── */

export function useExecution(): ExecutionState {
  const [state, setState] = useState<ExecutionState>(getExecutionState);

  useEffect(() => {
    const unsub = subscribeExecution((s) =>
      setState({ ...s, steps: { ...s.steps }, logs: [...s.logs] }),
    );
    return unsub;
  }, []);

  return state;
}

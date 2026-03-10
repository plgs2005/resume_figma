/**
 * React hook para o Agent Orchestrator.
 * Provê estado reativo e ações para o pipeline de agentes.
 */

import { useCallback, useEffect, useState } from "react";
import {
  subscribe,
  getState,
  initialize,
  runPipeline,
  resetToDefault,
  type OrchestratorState,
  type PipelineResult,
  type BuilderOptions,
} from "./orchestrator";

export interface UseOrchestratorReturn {
  /** Estado atual do orchestrator */
  state: OrchestratorState;
  /** Executa o pipeline: analisa vaga → gera currículo tailored */
  analyze: (
    jobText: string,
    titulo?: string,
    empresa?: string,
    options?: BuilderOptions,
  ) => Promise<PipelineResult>;
  /** Reseta para dados default */
  reset: () => void;
  /** Se está processando */
  isProcessing: boolean;
  /** Se há resultado tailored ativo */
  isTailored: boolean;
}

export function useOrchestrator(): UseOrchestratorReturn {
  const [state, setState] = useState<OrchestratorState>(getState);

  useEffect(() => {
    // Subscrever a mudanças de estado
    const unsubscribe = subscribe(setState);

    // Inicializar SKE na montagem
    initialize();

    return unsubscribe;
  }, []);

  const analyze = useCallback(
    async (
      jobText: string,
      titulo?: string,
      empresa?: string,
      options?: BuilderOptions,
    ) => {
      return runPipeline(jobText, titulo, empresa, options);
    },
    [],
  );

  const reset = useCallback(() => {
    resetToDefault();
  }, []);

  const isProcessing =
    state.stage === "loading-ske" ||
    state.stage === "analyzing" ||
    state.stage === "building";

  const isTailored = state.lastResult !== null;

  return {
    state,
    analyze,
    reset,
    isProcessing,
    isTailored,
  };
}

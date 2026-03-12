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
  resolveAndRunPipeline,
  resetToDefault,
  type OrchestratorState,
  type PipelineResult,
  type BuilderOptions,
} from "./orchestrator";
import type { JobInput } from "./job-input-resolver";

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
  /** Executa pipeline a partir de JobInput (texto/URL/imagem) */
  analyzeFromInput: (
    input: JobInput,
    options?: BuilderOptions,
    onOCRProgress?: (pct: number) => void,
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
    const unsubscribe = subscribe(setState);
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

  const analyzeFromInput = useCallback(
    async (
      input: JobInput,
      options?: BuilderOptions,
      onOCRProgress?: (pct: number) => void,
    ) => {
      return resolveAndRunPipeline(input, options, onOCRProgress);
    },
    [],
  );

  const reset = useCallback(() => {
    resetToDefault();
  }, []);

  const isProcessing =
    state.stage === "resolving" ||
    state.stage === "loading-ske" ||
    state.stage === "analyzing" ||
    state.stage === "building";

  const isTailored = state.lastResult !== null;

  return {
    state,
    analyze,
    analyzeFromInput,
    reset,
    isProcessing,
    isTailored,
  };
}

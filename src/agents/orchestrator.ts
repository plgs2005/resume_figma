/**
 * Agent Orchestrator — Coordena o fluxo completo de agentes.
 *
 * Pipeline:
 * 1. Carrega dados do SKE (public/skill-data.json)
 * 2. Recebe texto da vaga do usuário
 * 3. Job Analyzer → parseia requisitos e calcula match
 * 4. Resume Builder → gera versão tailored do currículo
 * 5. Retorna ResumeData pronto para renderização
 *
 * Estado gerenciado via React hook (useOrchestrator).
 */

import type { ResumeData } from "../types/resume";
import type { SKEData, SKEStats } from "../lib/ske-bridge";
import {
  loadSKEData,
  calculateCoverage,
} from "../lib/ske-bridge";
import { analyzeJob, type JobAnalysis } from "./job-analyzer";
import {
  buildTailoredResume,
  compareTailored,
  suggestSummaryAdjustments,
  type BuilderOptions,
} from "./resume-builder";
import { defaultResumeData } from "../data/resume-default";

/* ── Tipos ── */

export type PipelineStage =
  | "idle"
  | "loading-ske"
  | "analyzing"
  | "building"
  | "done"
  | "error";

export interface PipelineResult {
  /** Dados tailored para renderização */
  tailoredData: ResumeData;
  /** Análise completa da vaga */
  analysis: JobAnalysis;
  /** Comparação base vs tailored */
  comparison: {
    aderencia_antes: number;
    aderencia_depois: number;
    skills_destacadas: number;
    experiencias_relevantes: number;
  };
  /** Sugestões de ajuste no resumo profissional */
  summarySuggestions: string[];
  /** Cobertura SKE */
  skeCoverage: SKEStats;
  /** Timestamp da geração */
  gerado_em: string;
}

export interface OrchestratorState {
  stage: PipelineStage;
  /** Dados ativos: tailored se disponível, senão default */
  activeData: ResumeData;
  /** Resultado do último pipeline executado */
  lastResult: PipelineResult | null;
  /** Dados do SKE carregados */
  skeData: SKEData | null;
  /** Se o SKE foi carregado com sucesso */
  skeLoaded: boolean;
  /** Erro, se houver */
  error: string | null;
}

/* ── Orchestrator singleton ── */

let _state: OrchestratorState = {
  stage: "idle",
  activeData: defaultResumeData,
  lastResult: null,
  skeData: null,
  skeLoaded: false,
  error: null,
};

let _listeners: Array<(state: OrchestratorState) => void> = [];

function notify() {
  for (const listener of _listeners) {
    listener({ ..._state });
  }
}

/**
 * Registra um listener para mudanças de estado.
 * Retorna função de cleanup.
 */
export function subscribe(
  listener: (state: OrchestratorState) => void,
): () => void {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter((l) => l !== listener);
  };
}

/**
 * Retorna o estado atual do orchestrator.
 */
export function getState(): OrchestratorState {
  return { ..._state };
}

/* ── Ações ── */

/**
 * Inicializa o orchestrator carregando dados do SKE.
 * Pode ser chamado no mount do app.
 */
export async function initialize(): Promise<void> {
  if (_state.skeLoaded) return;

  _state = { ..._state, stage: "loading-ske", error: null };
  notify();

  try {
    const skeData = await loadSKEData();
    _state = {
      ..._state,
      stage: "idle",
      skeData,
      skeLoaded: true,
    };
    notify();
  } catch (err) {
    // SKE não é obrigatório — funciona sem ele
    console.warn(
      "SKE data não disponível. Funcionalidades de match limitadas.",
      err,
    );
    _state = {
      ..._state,
      stage: "idle",
      skeLoaded: false,
    };
    notify();
  }
}

/**
 * Executa o pipeline completo: analisa vaga → gera currículo tailored.
 */
export async function runPipeline(
  jobText: string,
  titulo?: string,
  empresa?: string,
  options?: BuilderOptions,
): Promise<PipelineResult> {
  // Garantir que SKE está carregado
  if (!_state.skeLoaded) {
    await initialize();
  }

  // Fase 1: Análise da vaga
  _state = { ..._state, stage: "analyzing", error: null };
  notify();

  const analysis = analyzeJob(jobText, titulo, empresa, _state.skeData);

  // Fase 2: Construir currículo tailored
  _state = { ..._state, stage: "building" };
  notify();

  const tailoredData = buildTailoredResume(
    defaultResumeData,
    analysis,
    _state.skeData,
    options,
  );

  // Fase 3: Métricas
  const comparison = compareTailored(defaultResumeData, tailoredData);
  const summarySuggestions = suggestSummaryAdjustments(
    defaultResumeData.resumo.paragrafos,
    analysis,
  );
  const skeCoverage = calculateCoverage(
    tailoredData,
    _state.skeData,
  );

  const result: PipelineResult = {
    tailoredData,
    analysis,
    comparison,
    summarySuggestions,
    skeCoverage,
    gerado_em: new Date().toISOString(),
  };

  // Atualizar estado
  _state = {
    ..._state,
    stage: "done",
    activeData: tailoredData,
    lastResult: result,
  };
  notify();

  return result;
}

/**
 * Reseta para os dados default (remove tailoring).
 */
export function resetToDefault(): void {
  _state = {
    ..._state,
    stage: "idle",
    activeData: defaultResumeData,
    lastResult: null,
    error: null,
  };
  notify();
}

/**
 * Retorna os dados ativos (tailored se disponível, default caso contrário).
 */
export function getActiveData(): ResumeData {
  return _state.activeData;
}

/* ── React Hook ── */

/**
 * Hook React para usar o orchestrator.
 *
 * Uso:
 * ```tsx
 * const { state, runPipeline, reset } = useOrchestrator();
 * ```
 *
 * NOTA: Importar de forma lazy para evitar dependência circular.
 * Este hook é implementado em separado para permitir uso sem React.
 */

// Re-exports para conveniência
export type { JobAnalysis, BuilderOptions, SKEData, SKEStats };

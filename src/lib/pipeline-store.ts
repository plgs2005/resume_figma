/**
 * Pipeline Store — Estado compartilhado do fluxo Career Intelligence.
 *
 * Fluxo em 4 passos:
 *   1. Sources   → coleta evidências (skills, experiências, projetos)
 *   2. Profile   → analisa evidências → ResumeData enriquecido com confiança
 *   3. Jobs      → analisa descrição de vaga → JobAnalysis
 *   4. Resume    → combina Profile + JobAnalysis → ResumeData tailored
 *
 * Padrão: singleton com subscribe/notify (idêntico ao orchestrator.ts).
 */

import type { ResumeData } from "../types/resume";
import type { JobAnalysis } from "../agents/job-analyzer";
import {
    persistPipelineState,
    loadPipelineState,
} from "../config/config-store";
import { getSourcesConfig, type SourceEntry } from "./config-loader";
import { defaultResumeData } from "../data/resume-default";

/* ── Tipos ── */

export type PipelineStep = 0 | 1 | 2 | 3 | 4;

export type SourceType =
  | "github"
  | "local-folder"
  | "local-repo"
  | "resume-file"
  | "linkedin-export"
  | "manual-input";

export interface PipelineSource {
  id: string;
  type: SourceType;
  label: string;
  status: "connected" | "pending" | "error";
  detail?: string;
}

export interface SimpleProfile {
  skills: string[];
  technologies: string[];
  domains: string[];
}

export interface PipelineState {
  /* Passo 1: Sources */
  sources: PipelineSource[];
  sourcesCollected: boolean;
  sourcesCount: number;
  sourcesCollectedAt: string | null;

  /* Passo 2: Profile */
  profile: SimpleProfile | null;
  profileReady: boolean;
  profileData: ResumeData | null;
  profileAnalyzedAt: string | null;

  /* Passo 3: Job */
  jobAnalysis: JobAnalysis | null;
  jobAnalyzedAt: string | null;

  /* Passo 4: Resume tailored */
  tailoredResume: ResumeData | null;
  tailoredAt: string | null;

  /** Maior passo completado (0 = nenhum) */
  completedStep: PipelineStep;
}

/* ── Estado inicial ── */

const INITIAL_STATE: PipelineState = {
  sources: [],
  sourcesCollected: false,
  sourcesCount: 0,
  sourcesCollectedAt: null,
  profile: null,
  profileReady: false,
  profileData: null,
  profileAnalyzedAt: null,
  jobAnalysis: null,
  jobAnalyzedAt: null,
  tailoredResume: null,
  tailoredAt: null,
  completedStep: 0,
};

function configSourceToPipeline(source: SourceEntry): PipelineSource {
  return {
    id: source.id,
    type: (source.type as SourceType) ?? "manual-input",
    label: source.label,
    status: source.enabled ? "connected" : "pending",
    detail: source.path ?? undefined,
  };
}

function mergeHydratedSources(
  configSources: PipelineSource[],
  persistedSources: PipelineSource[],
): PipelineSource[] {
  const merged = new Map<string, PipelineSource>();

  for (const source of configSources) {
    merged.set(source.id, source);
  }

  for (const source of persistedSources) {
    merged.set(source.id, source);
  }

  return Array.from(merged.values());
}

/* ── Singleton (hidratado do localStorage) ── */

function hydrateInitialState(): PipelineState {
  const persisted = loadPipelineState();
  const configSources = getSourcesConfig().sources.map(configSourceToPipeline);

  if (!persisted) {
    return {
      ...INITIAL_STATE,
      sources: configSources,
      sourcesCount: configSources.length,
    };
  }

  const hydratedSources = mergeHydratedSources(
    configSources,
    (persisted.sources ?? []) as PipelineSource[],
  );

  const isProfileReady = persisted.profileReady ?? false;

  // profileData não é persistido (dados grandes). Se profileReady,
  // reconstruímos a partir de defaultResumeData + metadata de execução.
  const reconstructedProfileData: ResumeData | null = isProfileReady
    ? {
        ...defaultResumeData,
        metadata: {
          ...defaultResumeData.metadata,
          gerado_por: "ske",
          gerado_em: persisted.profileAnalyzedAt ?? new Date().toISOString(),
        },
      }
    : null;

  return {
    ...INITIAL_STATE,
    sources: hydratedSources,
    sourcesCollected: persisted.sourcesCollected ?? false,
    sourcesCount: persisted.sourcesCount ?? hydratedSources.length,
    sourcesCollectedAt: persisted.sourcesCollectedAt ?? null,
    profile: (persisted.profile ?? null) as SimpleProfile | null,
    profileReady: isProfileReady,
    profileData: reconstructedProfileData,
    profileAnalyzedAt: persisted.profileAnalyzedAt ?? null,
    completedStep: (persisted.completedStep ?? 0) as PipelineStep,
  };
}

let _state: PipelineState = hydrateInitialState();
let _listeners: Array<(state: PipelineState) => void> = [];

function notify() {
  const snapshot = { ..._state };
  persistPipelineState(snapshot);
  for (const fn of _listeners) fn(snapshot);
}

function recalcStep() {
  if (_state.tailoredResume) _state.completedStep = 4;
  else if (_state.jobAnalysis) _state.completedStep = 3;
  else if (_state.profileReady || _state.profileData) _state.completedStep = 2;
  else if (_state.sourcesCollected) _state.completedStep = 1;
  else _state.completedStep = 0;
}

/* ── API pública ── */

export function getPipelineState(): PipelineState {
  return { ..._state, sources: [..._state.sources] };
}

export function subscribePipeline(
  listener: (state: PipelineState) => void,
): () => void {
  _listeners.push(listener);
  return () => {
    _listeners = _listeners.filter((l) => l !== listener);
  };
}

/* Ações — Sources */

/** Inicializa sources a partir de config (chamada uma vez) */
export function initSources(initial: PipelineSource[]): void {
  // Só inicializa se o store não tiver sources do usuário ainda
  if (_state.sources.length === 0) {
    _state = { ..._state, sources: [...initial] };
    notify();
  }
}

/** Sincroniza o store com a configuração ativa de sources */
export function replaceSources(sources: PipelineSource[]): void {
  _state = {
    ..._state,
    sources: [...sources],
    sourcesCount: _state.sourcesCollected
      ? sources.filter((s) => s.status === "connected").length || sources.length
      : _state.sourcesCount,
  };
  notify();
}

/** Adiciona uma source ao pipeline */
export function addSource(source: PipelineSource): void {
  _state = { ..._state, sources: [..._state.sources, source] };
  notify();
}

/** Remove uma source pelo id */
export function removeSource(id: string): void {
  _state = { ..._state, sources: _state.sources.filter((s) => s.id !== id) };
  notify();
}

/** Passo 1: marcar sources como coletadas */
export function collectSources(): void {
  const count = _state.sources.filter((s) => s.status === "connected").length
    || _state.sources.length;
  _state = {
    ..._state,
    sourcesCollected: true,
    sourcesCount: count,
    sourcesCollectedAt: new Date().toISOString(),
  };
  recalcStep();
  notify();
}

/** Passo 2a: armazenar perfil simples extraído das sources */
export function setProfile(profile: SimpleProfile): void {
  _state = {
    ..._state,
    profile,
    profileReady: true,
    profileAnalyzedAt: new Date().toISOString(),
  };
  recalcStep();
  notify();
}

/** Passo 2b: armazenar perfil analisado (ResumeData enriquecido) */
export function setProfileData(data: ResumeData): void {
  _state = {
    ..._state,
    profileData: data,
    profileAnalyzedAt: new Date().toISOString(),
  };
  recalcStep();
  notify();
}

/** Passo 3: armazenar análise da vaga */
export function setJobAnalysis(analysis: JobAnalysis): void {
  _state = {
    ..._state,
    jobAnalysis: analysis,
    jobAnalyzedAt: new Date().toISOString(),
    // Invalidar resume tailored anterior (nova vaga = novo resume)
    tailoredResume: null,
    tailoredAt: null,
  };
  recalcStep();
  notify();
}

/** Passo 4: armazenar resume tailored */
export function setTailoredResume(data: ResumeData): void {
  _state = {
    ..._state,
    tailoredResume: data,
    tailoredAt: new Date().toISOString(),
  };
  recalcStep();
  notify();
}

/** Resetar pipeline inteiro (preserva sources) */
export function resetPipeline(): void {
  _state = { ...INITIAL_STATE, sources: _state.sources };
  notify();
}

/** Resetar TUDO incluindo sources */
export function resetAll(): void {
  _state = { ...INITIAL_STATE };
  notify();
}

/* ── React Hook ── */

import { useEffect, useState } from "react";

export function usePipeline(): PipelineState {
  const [state, setState] = useState<PipelineState>(getPipelineState);

  useEffect(() => {
    const unsub = subscribePipeline((s) =>
      setState({ ...s, sources: [...s.sources] }),
    );
    return unsub;
  }, []);

  return state;
}

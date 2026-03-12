/**
 * Config Store — Persistência universal de configuração via localStorage.
 *
 * Cada domínio é salvo com a chave:
 *   career_engine_config_{domain}
 *
 * Funções:
 *   loadDomainConfig(domain)   → lê do localStorage (ou null se ausente)
 *   persistDomainConfig(domain, data) → grava no localStorage
 *   updateDomainConfig(domain, partial) → merge parcial + persiste
 *   clearDomainConfig(domain)  → remove do localStorage
 *   clearAllConfig()           → limpa todos os domínios
 */

/* ── Tipos ── */

export type ConfigDomain =
  | "home"
  | "profile"
  | "sources"
  | "jobs"
  | "resume"
  | "agents"
  | "workspace";

const STORAGE_PREFIX = "career_engine_config_";

/* ── Helpers ── */

function key(domain: ConfigDomain): string {
  return `${STORAGE_PREFIX}${domain}`;
}

function isLocalStorageAvailable(): boolean {
  try {
    const test = "__ls_test__";
    localStorage.setItem(test, "1");
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

const _available = isLocalStorageAvailable();

/* ── API Pública ── */

/**
 * Carrega configuração persistida de um domínio.
 * Retorna null se não existir ou se localStorage não estiver disponível.
 */
export function loadDomainConfig<T = unknown>(domain: ConfigDomain): T | null {
  if (!_available) return null;
  try {
    const raw = localStorage.getItem(key(domain));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    // JSON corrompido — remove
    localStorage.removeItem(key(domain));
    return null;
  }
}

/**
 * Persiste configuração de um domínio no localStorage.
 */
export function persistDomainConfig<T = unknown>(
  domain: ConfigDomain,
  data: T,
): void {
  if (!_available) return;
  try {
    localStorage.setItem(key(domain), JSON.stringify(data));
  } catch {
    // quota exceeded — silencia
    console.warn(`[config-store] Falha ao persistir ${domain}: quota excedida.`);
  }
}

/**
 * Merge parcial + persiste.
 * Lê o valor atual, aplica Object.assign com o partial, e persiste.
 */
export function updateDomainConfig<T extends Record<string, unknown>>(
  domain: ConfigDomain,
  partial: Partial<T>,
): T {
  const current = (loadDomainConfig<T>(domain) ?? {}) as T;
  const merged = { ...current, ...partial };
  persistDomainConfig(domain, merged);
  return merged;
}

/**
 * Remove configuração persistida de um domínio.
 */
export function clearDomainConfig(domain: ConfigDomain): void {
  if (!_available) return;
  localStorage.removeItem(key(domain));
}

/**
 * Remove todas as configurações persistidas.
 */
export function clearAllConfig(): void {
  if (!_available) return;
  const domains: ConfigDomain[] = [
    "home", "profile", "sources", "jobs", "resume", "agents", "workspace",
  ];
  for (const d of domains) {
    localStorage.removeItem(key(d));
  }
}

/* ── Pipeline State Persistence ── */

const PIPELINE_KEY = "career_engine_pipeline";

/**
 * Persiste o estado do pipeline no localStorage.
 * Exclui campos com dados grandes (profileData, tailoredResume) para
 * economizar quota — persiste apenas metadados e sources.
 */
export function persistPipelineState(state: {
  sources: unknown[];
  sourcesCollected: boolean;
  sourcesCount: number;
  sourcesCollectedAt: string | null;
  profile: unknown | null;
  profileReady: boolean;
  profileAnalyzedAt: string | null;
  completedStep: number;
}): void {
  if (!_available) return;
  try {
    const slim = {
      sources: state.sources,
      sourcesCollected: state.sourcesCollected,
      sourcesCount: state.sourcesCount,
      sourcesCollectedAt: state.sourcesCollectedAt,
      profile: state.profile,
      profileReady: state.profileReady,
      profileAnalyzedAt: state.profileAnalyzedAt,
      completedStep: state.completedStep,
    };
    localStorage.setItem(PIPELINE_KEY, JSON.stringify(slim));
  } catch {
    console.warn("[config-store] Falha ao persistir pipeline: quota excedida.");
  }
}

/**
 * Carrega estado persistido do pipeline.
 */
export function loadPipelineState(): {
  sources: unknown[];
  sourcesCollected: boolean;
  sourcesCount: number;
  sourcesCollectedAt: string | null;
  profile: unknown | null;
  profileReady: boolean;
  profileAnalyzedAt: string | null;
  completedStep: number;
} | null {
  if (!_available) return null;
  try {
    const raw = localStorage.getItem(PIPELINE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(PIPELINE_KEY);
    return null;
  }
}

/**
 * Limpa estado persistido do pipeline.
 */
export function clearPipelineState(): void {
  if (!_available) return;
  localStorage.removeItem(PIPELINE_KEY);
}

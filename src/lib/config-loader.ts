/**
 * Config Loader — Camada de configuração modular para o Career Intelligence Workspace.
 *
 * Cada domínio possui seu próprio arquivo de configuração:
 *   - profile-config.json
 *   - sources-config.json
 *   - jobs-config.json
 *   - resume-config.json
 *   - agents-config.json
 *
 * Fornece loaders por domínio, export/import por domínio, e getRuntimeConfig()
 * que monta o objeto unificado a partir de todos os configs individuais.
 *
 * Agentes leem configuração via getRuntimeConfig() ou loaders individuais.
 */

import defaultHomeConfig from "../config/home-config.json";
import defaultProfileConfig from "../config/profile-config.json";
import defaultSourcesConfig from "../config/sources-config.json";
import defaultJobsConfig from "../config/jobs-config.json";
import defaultResumeConfig from "../config/resume-config.json";
import defaultAgentsConfig from "../config/agents-config.json";
import defaultWorkspaceConfig from "../config/workspace-config.json";
import {
    loadDomainConfig as loadPersistedConfig,
    persistDomainConfig as persistConfig,
} from "../config/config-store";

/* ── Tipos ── */

export interface HomeConfig {
  schema_version: string;
  home: {
    welcome_message: string;
    show_quick_actions: boolean;
    show_recent_activity: boolean;
    recommended_flow: string[];
    [key: string]: unknown;
  };
}

export interface ProfileConfig {
  schema_version: string;
  profile: {
    name: string;
    title: string;
    email: string;
    location: string;
    linkedin: string;
    [key: string]: unknown;
  };
}

export interface SourceEntry {
  id: string;
  type: string;
  label: string;
  path: string;
  enabled: boolean;
}

export interface SourcesConfig {
  schema_version: string;
  sources: SourceEntry[];
}

export interface JobsConfig {
  schema_version: string;
  jobs: {
    auto_analyze: boolean;
    min_match_score: number;
    max_recent_jobs: number;
    [key: string]: unknown;
  };
}

export interface ResumeSection {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

export interface ResumeConfig {
  schema_version: string;
  resume: {
    layout: string;
    header?: {
      title: string;
      subtitle: string;
    };
    theme: {
      primary: string;
      accent: string;
      background: string;
      text: string;
      [key: string]: string;
    };
    sections: ResumeSection[];
    max_skills_highlight: number;
    include_match_score: boolean;
    max_experience_items: number;
    max_achievements_per_item?: number;
    [key: string]: unknown;
  };
}

export interface AgentsConfig {
  schema_version: string;
  agents: Record<string, boolean>;
}

export interface WorkspaceConfig {
  schema_version: string;
  workspace: {
    enabledModules: string[];
    agents: Record<string, boolean>;
    features: Record<string, boolean>;
    theme: string;
    locale: string;
    [key: string]: unknown;
  };
}

/** Objeto runtime unificado */
export interface RuntimeConfig {
  home: HomeConfig;
  profile: ProfileConfig;
  sources: SourcesConfig;
  jobs: JobsConfig;
  resume: ResumeConfig;
  agents: AgentsConfig;
  workspace: WorkspaceConfig;
}

/** Domínios suportados */
export type ConfigDomain = "home" | "profile" | "sources" | "jobs" | "resume" | "agents" | "workspace";

/** Map domínio → tipo */
type DomainConfigMap = {
  home: HomeConfig;
  profile: ProfileConfig;
  sources: SourcesConfig;
  jobs: JobsConfig;
  resume: ResumeConfig;
  agents: AgentsConfig;
  workspace: WorkspaceConfig;
};

function mergeSourcesConfig(
  base: SourcesConfig,
  persisted: SourcesConfig | null,
): SourcesConfig {
  if (!persisted) return structuredClone(base) as SourcesConfig;

  const merged = new Map<string, SourceEntry>();

  for (const source of base.sources) {
    merged.set(source.id, structuredClone(source));
  }

  for (const source of persisted.sources ?? []) {
    merged.set(source.id, structuredClone(source));
  }

  return {
    ...structuredClone(base),
    ...structuredClone(persisted),
    sources: Array.from(merged.values()),
  } as SourcesConfig;
}

/* ── Estado em memória (hidratado do localStorage se disponível) ── */

let _home: HomeConfig = (loadPersistedConfig<HomeConfig>("home") ?? structuredClone(defaultHomeConfig)) as HomeConfig;
let _profile: ProfileConfig = (loadPersistedConfig<ProfileConfig>("profile") ?? structuredClone(defaultProfileConfig)) as ProfileConfig;
let _sources: SourcesConfig = mergeSourcesConfig(
  structuredClone(defaultSourcesConfig) as SourcesConfig,
  loadPersistedConfig<SourcesConfig>("sources"),
);
let _jobs: JobsConfig = (loadPersistedConfig<JobsConfig>("jobs") ?? structuredClone(defaultJobsConfig)) as JobsConfig;
let _resume: ResumeConfig = (loadPersistedConfig<ResumeConfig>("resume") ?? structuredClone(defaultResumeConfig)) as ResumeConfig;
let _agents: AgentsConfig = (loadPersistedConfig<AgentsConfig>("agents") ?? structuredClone(defaultAgentsConfig)) as AgentsConfig;
let _workspace: WorkspaceConfig = (loadPersistedConfig<WorkspaceConfig>("workspace") ?? structuredClone(defaultWorkspaceConfig)) as WorkspaceConfig;

/* ── Pub/Sub por domínio ── */

type DomainListener<D extends ConfigDomain> = (config: DomainConfigMap[D]) => void;

const _listeners: { [D in ConfigDomain]: Array<DomainListener<D>> } = {
  home: [],
  profile: [],
  sources: [],
  jobs: [],
  resume: [],
  agents: [],
  workspace: [],
};

function _notify<D extends ConfigDomain>(domain: D): void {
  const config = _getDomainRef(domain);
  for (const listener of _listeners[domain]) {
    (listener as (c: unknown) => void)(config);
  }
}

function _getDomainRef<D extends ConfigDomain>(domain: D): DomainConfigMap[D] {
  const map: Record<ConfigDomain, unknown> = {
    home: _home,
    profile: _profile,
    sources: _sources,
    jobs: _jobs,
    resume: _resume,
    agents: _agents,
    workspace: _workspace,
  };
  return map[domain] as DomainConfigMap[D];
}

/**
 * Subscreve a mudanças em um domínio específico.
 */
export function subscribeDomain<D extends ConfigDomain>(
  domain: D,
  listener: DomainListener<D>,
): () => void {
  _listeners[domain].push(listener);
  return () => {
    const arr = _listeners[domain];
    const idx = arr.indexOf(listener);
    if (idx >= 0) arr.splice(idx, 1);
  };
}

/* ── Loaders por domínio ── */

export function loadHomeConfig(override?: HomeConfig): HomeConfig {
  _home = override ? structuredClone(override) : structuredClone(defaultHomeConfig) as HomeConfig;
  persistConfig("home", _home);
  _notify("home");
  return _home;
}

export function loadProfileConfig(override?: ProfileConfig): ProfileConfig {
  _profile = override ? structuredClone(override) : structuredClone(defaultProfileConfig) as ProfileConfig;
  persistConfig("profile", _profile);
  _notify("profile");
  return _profile;
}

export function loadSourcesConfig(override?: SourcesConfig): SourcesConfig {
  _sources = override ? structuredClone(override) : structuredClone(defaultSourcesConfig) as SourcesConfig;
  persistConfig("sources", _sources);
  _notify("sources");
  return _sources;
}

export function loadJobsConfig(override?: JobsConfig): JobsConfig {
  _jobs = override ? structuredClone(override) : structuredClone(defaultJobsConfig) as JobsConfig;
  persistConfig("jobs", _jobs);
  _notify("jobs");
  return _jobs;
}

export function loadResumeConfig(override?: ResumeConfig): ResumeConfig {
  _resume = override ? structuredClone(override) : structuredClone(defaultResumeConfig) as ResumeConfig;
  persistConfig("resume", _resume);
  _notify("resume");
  return _resume;
}

export function loadAgentsConfig(override?: AgentsConfig): AgentsConfig {
  _agents = override ? structuredClone(override) : structuredClone(defaultAgentsConfig) as AgentsConfig;
  persistConfig("agents", _agents);
  _notify("agents");
  return _agents;
}

export function loadWorkspaceConfig(override?: WorkspaceConfig): WorkspaceConfig {
  _workspace = override ? structuredClone(override) : structuredClone(defaultWorkspaceConfig) as WorkspaceConfig;
  persistConfig("workspace", _workspace);
  _notify("workspace");
  return _workspace;
}

/* ── Getters de leitura ── */

export function getHomeConfig(): Readonly<HomeConfig> { return _home; }
export function getProfileConfig(): Readonly<ProfileConfig> { return _profile; }
export function getSourcesConfig(): Readonly<SourcesConfig> { return _sources; }
export function getJobsConfig(): Readonly<JobsConfig> { return _jobs; }
export function getResumeConfig(): Readonly<ResumeConfig> { return _resume; }
export function getAgentsConfig(): Readonly<AgentsConfig> { return _agents; }
export function getWorkspaceConfig(): Readonly<WorkspaceConfig> { return _workspace; }

/**
 * Monta o objeto runtime unificado a partir de todos os configs individuais.
 */
export function getRuntimeConfig(): Readonly<RuntimeConfig> {
  return {
    home: _home,
    profile: _profile,
    sources: _sources,
    jobs: _jobs,
    resume: _resume,
    agents: _agents,
    workspace: _workspace,
  };
}

/* ── Export por domínio (download browser) ── */

const DOMAIN_FILENAMES: Record<ConfigDomain, string> = {
  home: "home-config.json",
  profile: "profile-config.json",
  sources: "sources-config.json",
  jobs: "jobs-config.json",
  resume: "resume-config.json",
  agents: "agents-config.json",
  workspace: "workspace-config.json",
};

export function exportDomainConfig(domain: ConfigDomain): void {
  const config = _getDomainRef(domain);
  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = DOMAIN_FILENAMES[domain];
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/* ── Import por domínio (upload browser) ── */

/**
 * Importa configuração de um domínio a partir de um File (.json, .yml, .md).
 *
 * - .json → parse direto
 * - .yml  → extrai bloco JSON embutido ou tenta JSON puro
 * - .md   → extrai bloco ```json``` do conteúdo
 *
 * Valida a estrutura antes de aplicar.
 */
export async function importDomainConfig<D extends ConfigDomain>(
  domain: D,
  file: File,
): Promise<DomainConfigMap[D]> {
  const text = await file.text();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  let parsed: unknown;

  if (ext === "json") {
    parsed = JSON.parse(text);
  } else if (ext === "yml" || ext === "yaml") {
    parsed = parseSimpleYaml(text);
  } else if (ext === "md") {
    parsed = parseMarkdownJson(text);
  } else {
    throw new Error(`Formato não suportado: .${ext}. Use .json, .yml ou .md.`);
  }

  const validated = validateDomainConfig(domain, parsed);

  // Aplica no estado correspondente + persiste
  switch (domain) {
    case "home": _home = structuredClone(validated) as HomeConfig; break;
    case "profile": _profile = structuredClone(validated) as ProfileConfig; break;
    case "sources": _sources = structuredClone(validated) as SourcesConfig; break;
    case "jobs": _jobs = structuredClone(validated) as JobsConfig; break;
    case "resume": _resume = structuredClone(validated) as ResumeConfig; break;
    case "agents": _agents = structuredClone(validated) as AgentsConfig; break;
    case "workspace": _workspace = structuredClone(validated) as WorkspaceConfig; break;
  }

  persistConfig(domain, _getDomainRef(domain));
  _notify(domain);
  return _getDomainRef(domain);
}

/* ── Parsers auxiliares ── */

function parseMarkdownJson(text: string): unknown {
  const match = text.match(/```json\s*\n([\s\S]*?)```/);
  if (!match?.[1]) {
    throw new Error("Arquivo .md deve conter um bloco ```json``` com a configuração.");
  }
  return JSON.parse(match[1]);
}

function parseSimpleYaml(text: string): unknown {
  // Tenta extrair bloco JSON embutido
  const jsonBlock = text.match(/```json\s*\n([\s\S]*?)```/);
  if (jsonBlock?.[1]) {
    return JSON.parse(jsonBlock[1]);
  }

  // Tenta JSON puro
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return JSON.parse(trimmed);
  }

  throw new Error(
    "Arquivo YAML complexo não suportado. Converta para JSON ou use um bloco ```json``` dentro do YAML.",
  );
}

/* ── Validação por domínio ── */

function validateDomainConfig<D extends ConfigDomain>(
  domain: D,
  data: unknown,
): DomainConfigMap[D] {
  if (!data || typeof data !== "object") {
    throw new Error("Configuração inválida: deve ser um objeto JSON.");
  }

  switch (domain) {
    case "home": return validateHome(data) as DomainConfigMap[D];
    case "profile": return validateProfile(data) as DomainConfigMap[D];
    case "sources": return validateSources(data) as DomainConfigMap[D];
    case "jobs": return validateJobs(data) as DomainConfigMap[D];
    case "resume": return validateResume(data) as DomainConfigMap[D];
    case "agents": return validateAgents(data) as DomainConfigMap[D];
    case "workspace": return validateWorkspace(data) as DomainConfigMap[D];
    default: throw new Error(`Domínio desconhecido: ${domain}`);
  }
}

function validateHome(data: unknown): HomeConfig {
  const obj = data as Record<string, unknown>;
  if (!obj.home || typeof obj.home !== "object") {
    throw new Error("home-config: bloco 'home' ausente ou inválido.");
  }
  return {
    schema_version: typeof obj.schema_version === "string" ? obj.schema_version : "1.0",
    home: obj.home as HomeConfig["home"],
  };
}

function validateProfile(data: unknown): ProfileConfig {
  const obj = data as Record<string, unknown>;
  if (!obj.profile || typeof obj.profile !== "object") {
    throw new Error("profile-config: bloco 'profile' ausente ou inválido.");
  }
  return {
    schema_version: typeof obj.schema_version === "string" ? obj.schema_version : "1.0",
    profile: obj.profile as ProfileConfig["profile"],
  };
}

function validateSources(data: unknown): SourcesConfig {
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.sources)) {
    throw new Error("sources-config: campo 'sources' deve ser um array.");
  }
  for (const [i, src] of (obj.sources as unknown[]).entries()) {
    if (!src || typeof src !== "object") {
      throw new Error(`sources-config: sources[${i}] deve ser um objeto.`);
    }
    const s = src as Record<string, unknown>;
    if (typeof s.id !== "string") throw new Error(`sources[${i}]: 'id' (string) obrigatório.`);
    if (typeof s.type !== "string") throw new Error(`sources[${i}]: 'type' (string) obrigatório.`);
    if (typeof s.enabled !== "boolean") throw new Error(`sources[${i}]: 'enabled' (boolean) obrigatório.`);
  }
  return {
    schema_version: typeof obj.schema_version === "string" ? obj.schema_version : "1.0",
    sources: obj.sources as SourceEntry[],
  };
}

function validateJobs(data: unknown): JobsConfig {
  const obj = data as Record<string, unknown>;
  if (!obj.jobs || typeof obj.jobs !== "object") {
    throw new Error("jobs-config: bloco 'jobs' ausente ou inválido.");
  }
  return {
    schema_version: typeof obj.schema_version === "string" ? obj.schema_version : "1.0",
    jobs: obj.jobs as JobsConfig["jobs"],
  };
}

function validateResume(data: unknown): ResumeConfig {
  const obj = data as Record<string, unknown>;
  if (!obj.resume || typeof obj.resume !== "object") {
    throw new Error("resume-config: bloco 'resume' ausente ou inválido.");
  }
  return {
    schema_version: typeof obj.schema_version === "string" ? obj.schema_version : "1.0",
    resume: obj.resume as ResumeConfig["resume"],
  };
}

function validateAgents(data: unknown): AgentsConfig {
  const obj = data as Record<string, unknown>;
  if (!obj.agents || typeof obj.agents !== "object") {
    throw new Error("agents-config: bloco 'agents' ausente ou inválido.");
  }
  const agents = obj.agents as Record<string, unknown>;
  for (const [key, val] of Object.entries(agents)) {
    if (typeof val !== "boolean") {
      throw new Error(`agents-config: agents.${key} deve ser boolean.`);
    }
  }
  return {
    schema_version: typeof obj.schema_version === "string" ? obj.schema_version : "1.0",
    agents: obj.agents as Record<string, boolean>,
  };
}

function validateWorkspace(data: unknown): WorkspaceConfig {
  const obj = data as Record<string, unknown>;
  if (!obj.workspace || typeof obj.workspace !== "object") {
    throw new Error("workspace-config: bloco 'workspace' ausente ou inválido.");
  }
  return {
    schema_version: typeof obj.schema_version === "string" ? obj.schema_version : "1.0",
    workspace: obj.workspace as WorkspaceConfig["workspace"],
  };
}

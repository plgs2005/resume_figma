/**
 * SelfKnowledgeEngine — Etapa 0: Project Discovery Layer
 *
 * Responsável por:
 * A) Descobrir projetos LOCAIS a partir de um path raiz
 * B) Descobrir projetos REMOTOS via GitHub/GitLab API
 * C) Normalizar e calcular relevância (score simples)
 * D) Gerar projects-catalog.json
 *
 * O engine não assume mais que o "repositório atual" é o universo.
 * Ele descobre e cataloga TODOS os projetos relevantes antes de qualquer análise.
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import type {
  DiscoveredProject,
  ProjectsCatalog,
  ProjectIndicator,
  ProjectRelevanceScore,
  DiscoveryConfig,
} from './types.js';
import { generateEvidenceId, safeReadJson, log, now } from './utils.js';

// ─── Indicadores de Projeto ──────────────────────────────────────────

/**
 * Lista de arquivos/diretórios que indicam a raiz de um projeto.
 * Ordem importa: os primeiros são mais fortes.
 */
const PROJECT_INDICATORS = [
  '.git',
  'package.json',
  'composer.json',
  'pyproject.toml',
  'requirements.txt',
  'go.mod',
  'pom.xml',
  'build.gradle',
  'Cargo.toml',
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  '.github/workflows',
  'Jenkinsfile',
  '.gitlab-ci.yml',
  '.circleci',
  'Makefile',
  'Pipfile',
  'setup.py',
  'setup.cfg',
] as const;

/**
 * Indicadores que contam como "infra" para scoring (docker/ci).
 */
const INFRA_INDICATORS = new Set([
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  '.github/workflows',
  'Jenkinsfile',
  '.gitlab-ci.yml',
  '.circleci',
]);

/**
 * Diretórios que devem ser ignorados na varredura.
 */
const DEFAULT_IGNORE = [
  'node_modules', '.git', 'vendor', 'dist', '.next',
  '__pycache__', '.cache', 'coverage', '.nyc_output',
  'build', 'tmp', 'temp', 'venv', '.venv', 'env',
  'Downloads', 'google-cloud-sdk', '.local', '.npm',
  '.nvm', '.yarn', '.pnpm', 'backups_copilot', 'backups',
  '.docker', '.kube', '.terraform', '.gradle', '.m2',
  '.cargo', 'target', 'bin', '.rustup', '.cache',
  '.config', '.mozilla', '.vscode-server', 'snap',
  '.gnupg', '.ssh', '.dbus', 'Pictures', 'Videos',
  'Music', 'Documents', 'Desktop', 'Templates', 'Public',
  '.android', '.java', '.gcloud',
];

// ─── ProjectDiscovery Class ──────────────────────────────────────────

export class ProjectDiscovery {
  private config: DiscoveryConfig;

  constructor(config: DiscoveryConfig) {
    this.config = config;
  }

  // ─── Método Principal ─────────────────────────────────────────────

  /**
   * Executa o discovery completo: local + remoto + scoring + seleção.
   * Retorna o catálogo final.
   */
  async discover(): Promise<ProjectsCatalog> {
    log.section('PROJECT DISCOVERY — ETAPA 0');
    const avisos: string[] = [];

    // (A) Projetos locais
    log.step(`Varrendo projetos locais em: ${this.config.root_path}`);
    const localProjects = this.discoverLocal();
    log.ok(`${localProjects.length} projeto(s) local(is) encontrado(s).`);

    // (B) Projetos remotos
    let remoteProjects: DiscoveredProject[] = [];
    if (this.config.github_user) {
      log.step(`Buscando repositórios GitHub de: ${this.config.github_user}`);
      try {
        const { projects, warnings } = await this.discoverGitHub();
        remoteProjects = projects;
        avisos.push(...warnings);
        log.ok(`${remoteProjects.length} repositório(s) GitHub encontrado(s).`);
      } catch (err) {
        const msg = `Erro ao acessar GitHub API: ${err}`;
        avisos.push(msg);
        log.warn(msg);
      }
    } else {
      avisos.push('GitHub: nenhum username configurado. Pulando descoberta remota.');
      log.warn('Nenhum github_user configurado. Pulando descoberta remota.');
    }

    // Mesclar e deduplicar
    const allProjects = this.deduplicateProjects([...localProjects, ...remoteProjects]);

    // (C) Calcular relevância e selecionar top N
    const scored = this.scoreAndSelect(allProjects);

    const selectedCount = scored.filter(p => p.selected_for_analysis).length;

    const catalog: ProjectsCatalog = {
      versao: '1.0.0',
      gerado_em: now(),
      root_path: this.config.root_path,
      github_user: this.config.github_user,
      total_descobertos: scored.length,
      total_selecionados: selectedCount,
      projetos: scored,
      avisos,
    };

    log.ok(`Catálogo gerado: ${catalog.total_descobertos} projetos, ${catalog.total_selecionados} selecionados.`);
    return catalog;
  }

  // ─── (A) Descoberta Local ──────────────────────────────────────────

  /**
   * Varre o root_path recursivamente procurando diretórios com indicadores.
   * Usa uma abordagem BFS com profundidade limitada.
   */
  discoverLocal(): DiscoveredProject[] {
    const rootPath = resolve(this.config.root_path);
    if (!existsSync(rootPath)) {
      log.warn(`Path raiz não existe: ${rootPath}`);
      return [];
    }

    const ignoreSet = new Set([
      ...DEFAULT_IGNORE,
      ...(this.config.ignore_patterns || []),
    ]);

    const discovered: DiscoveredProject[] = [];
    const visited = new Set<string>();

    this.scanDirectory(rootPath, 0, ignoreSet, discovered, visited);

    return discovered;
  }

  /**
   * Escaneia um diretório e seus filhos, coletando projetos encontrados.
   */
  private scanDirectory(
    dir: string,
    depth: number,
    ignoreSet: Set<string>,
    results: DiscoveredProject[],
    visited: Set<string>,
  ): void {
    if (depth > this.config.max_depth) return;

    // Resolver symlinks e evitar ciclos
    let realDir: string;
    try {
      realDir = resolve(dir);
      if (visited.has(realDir)) return;
      visited.add(realDir);
    } catch {
      return;
    }

    // Verificar indicadores neste diretório
    const indicators = this.findIndicators(realDir);

    if (indicators.length > 0) {
      // Este diretório é raiz de um projeto
      const project = this.buildLocalProject(realDir, indicators);
      results.push(project);

      // NÃO descer em sub-projetos dentro de node_modules/vendor, etc.
      // Mas pode haver monorepos, então continue descendo com profundidade reduzida
    }

    // Continuar descendo (a menos que já tenha encontrado indicadores e esteja profundo)
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith('.') && entry.name !== '.github') continue;
        if (ignoreSet.has(entry.name)) continue;

        const childPath = join(dir, entry.name);
        this.scanDirectory(childPath, depth + 1, ignoreSet, results, visited);
      }
    } catch {
      // Permissão negada, etc.
    }
  }

  /**
   * Encontra indicadores de projeto em um diretório.
   */
  private findIndicators(dir: string): ProjectIndicator[] {
    const found: ProjectIndicator[] = [];

    for (const indicator of PROJECT_INDICATORS) {
      const fullPath = join(dir, indicator);
      try {
        if (existsSync(fullPath)) {
          found.push({
            tipo: indicator,
            caminho: fullPath,
          });
        }
      } catch {
        // Inacessível
      }
    }

    return found;
  }

  /**
   * Constrói um DiscoveredProject a partir de um diretório local.
   */
  private buildLocalProject(dir: string, indicators: ProjectIndicator[]): DiscoveredProject {
    const nome = this.getProjectName(dir);
    const id = generateEvidenceId(dir, 'project-discovery', nome);

    return {
      id,
      nome,
      caminho: dir,
      origem: 'local',
      indicadores: indicators,
      relevancia: { total: 0, commits_autorais: 0, tamanho: 0, infra: 0, atualizado_recentemente: 0 },
      selected_for_analysis: false,
    };
  }

  /**
   * Extrai nome do projeto a partir do diretório.
   */
  private getProjectName(dir: string): string {
    // Tenta ler de package.json
    const pkg = safeReadJson<{ name?: string }>(join(dir, 'package.json'));
    if (pkg?.name) return pkg.name;

    // Tenta composer.json
    const composer = safeReadJson<{ name?: string }>(join(dir, 'composer.json'));
    if (composer?.name) return composer.name;

    // Tenta pyproject.toml (simplificado: só nome do dir)
    // Tenta go.mod
    const goMod = this.safeReadLine(join(dir, 'go.mod'));
    if (goMod) {
      const match = goMod.match(/^module\s+(.+)/);
      if (match) return match[1].trim();
    }

    return basename(dir);
  }

  private safeReadLine(path: string): string | null {
    try {
      if (!existsSync(path)) return null;
      const content = readFileSync(path, 'utf-8');
      return content.split('\n')[0] || null;
    } catch {
      return null;
    }
  }

  // ─── (B) Descoberta Remota: GitHub ─────────────────────────────────

  /**
   * Lista repositórios do GitHub para o username configurado.
   * Se token existir: públicos + privados.
   * Se não existir: apenas públicos.
   */
  async discoverGitHub(): Promise<{ projects: DiscoveredProject[]; warnings: string[] }> {
    const warnings: string[] = [];
    const username = this.config.github_user;
    if (!username) return { projects: [], warnings: ['GitHub: nenhum username configurado.'] };

    const token = this.config.github_token;
    const hasToken = !!token;

    if (!hasToken) {
      warnings.push('REMOTO: limitado a públicos (nenhum token GitHub configurado).');
      log.warn('Sem token GitHub — apenas repositórios públicos serão listados.');
    }

    const projects: DiscoveredProject[] = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      try {
        const url = hasToken
          ? `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=pushed&affiliation=owner`
          : `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}&sort=pushed`;

        const headers: Record<string, string> = {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'SelfKnowledgeEngine/1.0',
        };
        if (hasToken) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`GitHub API ${response.status}: ${errorBody.slice(0, 200)}`);
        }

        const repos: GitHubRepo[] = await response.json() as GitHubRepo[];

        if (repos.length === 0) {
          hasMore = false;
          break;
        }

        for (const repo of repos) {
          // Filtrar forks (a menos que tenha commits próprios)
          if (repo.fork && !hasToken) continue;

          const id = generateEvidenceId(repo.html_url, 'github-discovery', repo.full_name);

          const project: DiscoveredProject = {
            id,
            nome: repo.name,
            caminho: repo.html_url,
            origem: 'github',
            indicadores: this.repoToIndicators(repo),
            linguagens: repo.language ? { [repo.language]: 1 } : undefined,
            default_branch: repo.default_branch,
            last_push: repo.pushed_at,
            visibility: repo.private ? 'private' : 'public',
            url: repo.html_url,
            provider: 'github',
            relevancia: { total: 0, commits_autorais: 0, tamanho: 0, infra: 0, atualizado_recentemente: 0 },
            selected_for_analysis: false,
          };

          projects.push(project);
        }

        if (repos.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      } catch (err) {
        warnings.push(`Erro paginando GitHub (página ${page}): ${err}`);
        hasMore = false;
      }
    }

    return { projects, warnings };
  }

  /**
   * Converte metadados de um repo GitHub em indicadores inferidos.
   */
  private repoToIndicators(repo: GitHubRepo): ProjectIndicator[] {
    const indicators: ProjectIndicator[] = [];

    // Todo repo GitHub tem .git
    indicators.push({ tipo: '.git', caminho: `${repo.html_url}/.git` });

    // Inferir indicadores pela linguagem
    if (repo.language) {
      const langIndicators: Record<string, string> = {
        'JavaScript': 'package.json',
        'TypeScript': 'package.json',
        'PHP': 'composer.json',
        'Python': 'requirements.txt',
        'Go': 'go.mod',
        'Java': 'pom.xml',
        'Kotlin': 'build.gradle',
        'Rust': 'Cargo.toml',
      };
      const indicator = langIndicators[repo.language];
      if (indicator) {
        indicators.push({ tipo: indicator, caminho: `${repo.html_url}/${indicator}` });
      }
    }

    // Se tem GitHub Actions
    if (repo.has_actions !== undefined) {
      // A API não retorna has_actions diretamente, mas podemos inferir via topics
    }

    return indicators;
  }

  // ─── (C) Scoring e Seleção ─────────────────────────────────────────

  /**
   * Para cada projeto, calcula o score de relevância e seleciona os top N.
   */
  scoreAndSelect(projects: DiscoveredProject[]): DiscoveredProject[] {
    for (const project of projects) {
      project.relevancia = this.calculateRelevance(project);
    }

    // Ordenar por score descendente
    projects.sort((a, b) => b.relevancia.total - a.relevancia.total);

    // Selecionar top N
    const maxSelected = this.config.max_selected;
    for (let i = 0; i < projects.length; i++) {
      projects[i].selected_for_analysis = i < maxSelected;
    }

    return projects;
  }

  /**
   * Calcula score de relevância para um projeto.
   *
   * Componentes:
   * - commits_autorais: até 30 pts (+++ tem commits do github_user?)
   * - tamanho: até 20 pts (++ n. de arquivos ou indicadores)
   * - infra: até 20 pts (++ docker/ci presentes)
   * - atualizado_recentemente: até 10 pts (+ last push < 6 meses)
   * - bônus por tipo de indicador: até 20 pts
   */
  private calculateRelevance(project: DiscoveredProject): ProjectRelevanceScore {
    let commits_autorais = 0;
    let tamanho = 0;
    let infra = 0;
    let atualizado_recentemente = 0;

    // ── Commits autorais (até 30 pts) ──
    if (project.origem === 'local') {
      commits_autorais = this.countAuthorCommitsLocal(project);
    } else if (project.origem === 'github') {
      // Para repos remotos, verificamos se é owner
      if (project.visibility === 'private') {
        commits_autorais = 25; // Repo privado que o user é owner → provável autoria
      } else {
        commits_autorais = 15; // Público do user → alguma autoria provável
      }
    }

    // ── Tamanho (até 20 pts) ──
    if (project.origem === 'local') {
      tamanho = this.estimateProjectSize(project);
    } else {
      // Pela quantidade de indicadores como proxy
      tamanho = Math.min(20, project.indicadores.length * 5);
    }

    // ── Infra (até 20 pts) ──
    const infraIndicators = project.indicadores.filter(i => INFRA_INDICATORS.has(i.tipo));
    infra = Math.min(20, infraIndicators.length * 10);

    // ── Atualizado recentemente (até 10 pts) ──
    if (project.last_push) {
      const pushDate = new Date(project.last_push);
      const now = new Date();
      const monthsAgo = (now.getTime() - pushDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsAgo <= 1) atualizado_recentemente = 10;
      else if (monthsAgo <= 3) atualizado_recentemente = 8;
      else if (monthsAgo <= 6) atualizado_recentemente = 5;
      else if (monthsAgo <= 12) atualizado_recentemente = 3;
      else atualizado_recentemente = 1;
    } else if (project.origem === 'local') {
      // Verificar último commit no git
      atualizado_recentemente = this.getLocalRecentScore(project);
    }

    const total = commits_autorais + tamanho + infra + atualizado_recentemente;

    return { total, commits_autorais, tamanho, infra, atualizado_recentemente };
  }

  /**
   * Conta commits autorais em um projeto local (até 30 pts).
   */
  private countAuthorCommitsLocal(project: DiscoveredProject): number {
    const gitDir = join(project.caminho, '.git');
    if (!existsSync(gitDir)) return 0;

    const username = this.config.github_user;
    if (!username) {
      // Sem username, tentar contar todos os commits do HEAD
      try {
        const count = execSync('git log --oneline --max-count=100 | wc -l', {
          cwd: project.caminho,
          timeout: 5000,
          stdio: ['pipe', 'pipe', 'pipe'],
        }).toString().trim();
        const n = parseInt(count, 10);
        if (n > 50) return 20;
        if (n > 20) return 15;
        if (n > 5) return 10;
        return 5;
      } catch {
        return 5; // Tem .git, algum valor
      }
    }

    try {
      // Contar commits do autor configurado
      const result = execSync(
        `git log --oneline --author="${username}" --max-count=100 2>/dev/null | wc -l`,
        { cwd: project.caminho, timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'] }
      ).toString().trim();

      const ownCommits = parseInt(result, 10);
      if (ownCommits > 50) return 30;
      if (ownCommits > 20) return 25;
      if (ownCommits > 10) return 20;
      if (ownCommits > 5) return 15;
      if (ownCommits > 0) return 10;
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Estima tamanho do projeto (até 20 pts) contando arquivos relevantes.
   */
  private estimateProjectSize(project: DiscoveredProject): number {
    try {
      // Conta rápida de arquivos (excluindo node_modules, .git, etc.)
      const result = execSync(
        `find . -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.py" -o -name "*.php" -o -name "*.go" -o -name "*.java" -o -name "*.rs" \\) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/vendor/*" -not -path "*/dist/*" 2>/dev/null | wc -l`,
        { cwd: project.caminho, timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'] }
      ).toString().trim();

      const fileCount = parseInt(result, 10);
      if (fileCount > 100) return 20;
      if (fileCount > 50) return 15;
      if (fileCount > 20) return 12;
      if (fileCount > 10) return 8;
      if (fileCount > 0) return 5;
      return 2; // Tem indicadores mas poucos arquivos de código
    } catch {
      return 2;
    }
  }

  /**
   * Verifica quão recente é o último commit local (até 10 pts).
   */
  private getLocalRecentScore(project: DiscoveredProject): number {
    const gitDir = join(project.caminho, '.git');
    if (!existsSync(gitDir)) return 0;

    try {
      const dateStr = execSync(
        'git log -1 --format="%aI" 2>/dev/null',
        { cwd: project.caminho, timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'] }
      ).toString().trim();

      if (!dateStr) return 0;

      const lastCommit = new Date(dateStr);
      const nowDate = new Date();
      const monthsAgo = (nowDate.getTime() - lastCommit.getTime()) / (1000 * 60 * 60 * 24 * 30);

      if (monthsAgo <= 1) return 10;
      if (monthsAgo <= 3) return 8;
      if (monthsAgo <= 6) return 5;
      if (monthsAgo <= 12) return 3;
      return 1;
    } catch {
      return 0;
    }
  }

  // ─── Deduplicação ─────────────────────────────────────────────────

  /**
   * Remove projetos duplicados (mesmo caminho ou mesmo repo GitHub clonado localmente).
   * Prioriza a versão local (mais dados disponíveis).
   */
  private deduplicateProjects(projects: DiscoveredProject[]): DiscoveredProject[] {
    const byName = new Map<string, DiscoveredProject>();

    for (const project of projects) {
      const key = project.nome.toLowerCase().replace(/^@[^/]+\//, '');
      const existing = byName.get(key);

      if (!existing) {
        byName.set(key, project);
      } else {
        // Priorizar local sobre remoto (mais dados)
        if (project.origem === 'local' && existing.origem !== 'local') {
          // Mesclar dados do remoto no local
          project.url = existing.url;
          project.default_branch = existing.default_branch;
          project.last_push = existing.last_push;
          project.visibility = existing.visibility;
          project.provider = existing.provider;
          project.linguagens = existing.linguagens;
          byName.set(key, project);
        } else if (existing.origem === 'local' && project.origem !== 'local') {
          // Mesclar dados do remoto no local existente
          existing.url = project.url;
          existing.default_branch = project.default_branch;
          existing.last_push = project.last_push;
          existing.visibility = project.visibility;
          existing.provider = project.provider;
          existing.linguagens = project.linguagens;
        }
        // Se ambos locais ou ambos remotos, manter o primeiro
      }
    }

    return Array.from(byName.values());
  }

  // ─── Util: Lista de paths dos selecionados ────────────────────────

  /**
   * Retorna apenas os caminhos dos projetos selecionados para análise.
   * Usado pelo pipeline para alimentar o collector.
   */
  static getSelectedPaths(catalog: ProjectsCatalog): string[] {
    return catalog.projetos
      .filter(p => p.selected_for_analysis && p.origem === 'local')
      .map(p => p.caminho);
  }
}

// ─── GitHub API Types (simplificado) ──────────────────────────────────

interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  language: string | null;
  default_branch: string;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  size: number;
  stargazers_count: number;
  has_actions?: boolean;
  topics?: string[];
  owner: {
    login: string;
  };
}

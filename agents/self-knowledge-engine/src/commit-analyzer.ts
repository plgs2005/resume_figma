/**
 * SelfKnowledgeEngine — Commit Analyzer (v3.0)
 *
 * Módulo central para análise granular de commits Git.
 *
 * Responsabilidades:
 * - Avaliar CADA commit individualmente (autor, data, mensagem, arquivos, linhas)
 * - Classificar arquivos por extensão → domínio técnico
 * - Ignorar arquivos de dependência como prova de habilidade
 * - Diferenciar código autoral de scaffold
 * - Calcular profundidade da alteração (níveis 1-4)
 * - Aplicar peso por contexto arquitetural
 * - NÃO inferir habilidade apenas porque o projeto usa tecnologia X
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import type {
  CommitAnalysis,
  CommitFileChange,
  FileClassification,
  ModuleType,
  DepthLevel,
  SkillCategory,
} from './types.js';
import { log } from './utils.js';

// ─── Extension → Domain Mapping ─────────────────────────────────────

const EXTENSION_DOMAIN_MAP: Record<string, { dominio: string; categoria: SkillCategory }> = {
  // Frontend
  '.tsx': { dominio: 'React/TypeScript', categoria: 'frontend' },
  '.jsx': { dominio: 'React/JavaScript', categoria: 'frontend' },
  '.vue': { dominio: 'Vue.js', categoria: 'frontend' },
  '.svelte': { dominio: 'Svelte', categoria: 'frontend' },
  '.css': { dominio: 'CSS', categoria: 'frontend' },
  '.scss': { dominio: 'SCSS', categoria: 'frontend' },
  '.less': { dominio: 'LESS', categoria: 'frontend' },
  '.html': { dominio: 'HTML', categoria: 'frontend' },

  // Backend
  '.ts': { dominio: 'TypeScript', categoria: 'fundamentos' },
  '.js': { dominio: 'JavaScript', categoria: 'fundamentos' },
  '.mjs': { dominio: 'JavaScript (ESM)', categoria: 'fundamentos' },
  '.cjs': { dominio: 'JavaScript (CJS)', categoria: 'fundamentos' },
  '.php': { dominio: 'PHP', categoria: 'backend' },
  '.py': { dominio: 'Python', categoria: 'backend' },
  '.go': { dominio: 'Go', categoria: 'backend' },
  '.rs': { dominio: 'Rust', categoria: 'backend' },
  '.java': { dominio: 'Java', categoria: 'backend' },
  '.kt': { dominio: 'Kotlin', categoria: 'backend' },
  '.rb': { dominio: 'Ruby', categoria: 'backend' },
  '.cs': { dominio: 'C#', categoria: 'backend' },
  '.cpp': { dominio: 'C++', categoria: 'backend' },
  '.c': { dominio: 'C', categoria: 'backend' },
  '.swift': { dominio: 'Swift', categoria: 'backend' },
  '.dart': { dominio: 'Dart', categoria: 'frontend' },

  // Database
  '.sql': { dominio: 'SQL', categoria: 'banco-de-dados' },
  '.prisma': { dominio: 'Prisma Schema', categoria: 'banco-de-dados' },

  // DevOps / Config
  '.yml': { dominio: 'YAML Config', categoria: 'devops' },
  '.yaml': { dominio: 'YAML Config', categoria: 'devops' },
  '.toml': { dominio: 'TOML Config', categoria: 'devops' },
  '.tf': { dominio: 'Terraform', categoria: 'devops' },

  // Shell
  '.sh': { dominio: 'Shell Script', categoria: 'devops' },
  '.bash': { dominio: 'Bash Script', categoria: 'devops' },

  // Docs
  '.md': { dominio: 'Documentação', categoria: 'produto' },
  '.txt': { dominio: 'Documentação', categoria: 'produto' },
  '.rst': { dominio: 'Documentação', categoria: 'produto' },
};

// ─── Dependency / Scaffold Paths ─────────────────────────────────────

/** Caminhos que indicam arquivo de dependência (NÃO é prova de skill) */
const DEPENDENCY_PATHS = [
  'node_modules', 'vendor', 'dist', 'build', '.next', '__pycache__',
  '.cache', 'coverage', '.nyc_output', 'bower_components', '.tox',
  'venv', '.venv', 'env', '.env', 'target', 'bin/Debug', 'bin/Release',
  'obj', '.gradle', '.dart_tool', '.pub-cache',
];

/** Arquivos que são gerados por scaffolding/CLI e não provam skill */
const SCAFFOLD_FILES = [
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'composer.lock',
  'Gemfile.lock', 'Pipfile.lock', 'poetry.lock', 'go.sum',
  '.gitignore', '.editorconfig', '.prettierrc', '.eslintrc',
  '.eslintrc.js', '.eslintrc.json', '.babelrc', 'babel.config.js',
  'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
  'postcss.config.js', 'tailwind.config.js', 'tailwind.config.ts',
  'vite.config.ts', 'vite.config.js', 'webpack.config.js',
  'next.config.js', 'next.config.ts', 'nuxt.config.ts',
  'jest.config.js', 'jest.config.ts', 'jest.config.cjs',
  'vitest.config.ts', 'vitest.config.js',
  '.env.example', '.env.local', '.env.development',
];

/** Arquivos de asset (não provam skill técnica) */
const ASSET_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif',
  '.mp3', '.mp4', '.wav', '.ogg', '.webm',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.zip', '.tar', '.gz', '.rar',
];

// ─── Core Module Path Patterns ───────────────────────────────────────

/** Paths que indicam módulo CORE (peso arquitetural alto) */
const CORE_PATH_PATTERNS = [
  /\/(domain|domains)\//i,
  /\/(services|service)\//i,
  /\/(middleware|middlewares)\//i,
  /\/(auth|authentication|authorization)\//i,
  /\/(infrastructure|infra)\//i,
  /\/(entities|entity)\//i,
  /\/(use-cases|usecases|use_cases)\//i,
  /\/(repositories|repository)\//i,
  /\/(guards|interceptors|pipes)\//i,
  /\/(providers|factories)\//i,
  /\/(core)\//i,
  /\/(lib)\//i,
  /\/(api|apis)\//i,
  /\/(controllers|controller)\//i,
  /\/(models|model)\//i,
];

/** Paths que indicam módulo FEATURE (peso normal) */
const FEATURE_PATH_PATTERNS = [
  /\/(components|component)\//i,
  /\/(pages|page|views|view)\//i,
  /\/(routes|routing)\//i,
  /\/(hooks|composables)\//i,
  /\/(screens|screen)\//i,
  /\/(modules|module)\//i,
  /\/(features|feature)\//i,
  /\/(layouts|layout)\//i,
  /\/(templates|template)\//i,
];

/** Paths que indicam testes */
const TEST_PATH_PATTERNS = [
  /\/__tests__\//i,
  /\/(tests|test|spec|specs)\//i,
  /\.(test|spec)\.(ts|tsx|js|jsx|py|php|rb)$/i,
  /\.cy\.(ts|js)$/i,
  /\.e2e\.(ts|js)$/i,
];

// ─── Commit Message Patterns for Depth ───────────────────────────────

const DEPTH_4_PATTERNS = [
  /\b(auth|security|permission|middleware|guard|interceptor|infra|migration|schema|database)\b/i,
  /\b(breaking|critical|major|hotfix)\b/i,
  /\b(api|endpoint|route|controller)\b/i,
];

const DEPTH_3_PATTERNS = [
  /\b(refactor|restructure|reorganize|redesign|rewrite|overhaul)\b/i,
  /\b(architect|modular|decouple|extract|abstract)\b/i,
  /\b(optimize|performance|cache|index)\b/i,
];

const DEPTH_2_PATTERNS = [
  /\b(feat|feature|implement|add|create|build|develop)\b/i,
  /\b(component|page|view|screen|hook|service|util)\b/i,
  /\b(fix|bugfix|resolve|handle|support)\b/i,
  /\b(test|spec|coverage)\b/i,
];

// ─── Main CommitAnalyzer Class ───────────────────────────────────────

export class CommitAnalyzer {
  private username: string;
  private userEmails: Set<string> = new Set();

  constructor(username: string) {
    this.username = username.toLowerCase();
  }

  /**
   * Analisa todos os commits de um repositório Git, retornando análises individuais.
   * Apenas commits do USUÁRIO configurado são marcados como is_own_commit.
   */
  analyzeRepository(repoDir: string, maxCommits: number = 200): CommitAnalysis[] {
    if (!existsSync(join(repoDir, '.git'))) {
      log.warn(`Diretório sem .git: ${repoDir}`);
      return [];
    }

    // Primeiro, descobrir os emails do usuário
    this.discoverUserEmails(repoDir);

    // Obter log detalhado de commits
    const rawLog = this.getDetailedGitLog(repoDir, maxCommits);
    if (!rawLog.trim()) return [];

    const commits = this.parseGitLog(rawLog, repoDir);

    log.step(`Commits analisados em ${repoDir}: ${commits.length} (${commits.filter(c => c.is_own_commit).length} autorais)`);

    return commits;
  }

  /**
   * Classifica um arquivo modificado num commit.
   */
  classifyFile(filePath: string): CommitFileChange {
    const ext = extname(filePath).toLowerCase();
    const name = basename(filePath);

    return {
      caminho: filePath,
      extensao: ext,
      adicionadas: 0,
      removidas: 0,
      classificacao: this.getFileClassification(filePath, ext, name),
      dominio: this.getFileDomain(ext),
      is_dependency: this.isDependencyFile(filePath),
      modulo_tipo: this.getModuleType(filePath),
    };
  }

  /**
   * Calcula a profundidade da alteração de um commit (1-4).
   */
  calculateDepthLevel(commit: Omit<CommitAnalysis, 'depth_level' | 'peso_arquitetural'>): DepthLevel {
    const { mensagem, arquivos_modificados, linhas_adicionadas, linhas_removidas } = commit;

    // Filtrar apenas arquivos que representam código autoral real
    // (exclui dependências, scaffolds, assets, docs, configs)
    const NON_AUTHORAL_CLASSIFICATIONS = new Set([
      'dependencia', 'scaffold', 'asset', 'documentacao', 'configuracao',
    ]);
    const authoralFiles = arquivos_modificados.filter(
      f => !f.is_dependency && !NON_AUTHORAL_CLASSIFICATIONS.has(f.classificacao)
    );
    if (authoralFiles.length === 0) return 1;

    let depth: DepthLevel = 1;

    // Regra 1: Mensagem do commit indica profundidade
    if (DEPTH_4_PATTERNS.some(p => p.test(mensagem))) depth = Math.max(depth, 4) as DepthLevel;
    else if (DEPTH_3_PATTERNS.some(p => p.test(mensagem))) depth = Math.max(depth, 3) as DepthLevel;
    else if (DEPTH_2_PATTERNS.some(p => p.test(mensagem))) depth = Math.max(depth, 2) as DepthLevel;

    // Regra 2: Tipo de módulo alterado
    const hasCore = authoralFiles.some(f => f.modulo_tipo === 'core');
    const hasTest = authoralFiles.some(f => f.modulo_tipo === 'test');
    if (hasCore) depth = Math.max(depth, 3) as DepthLevel;
    if (hasCore && hasTest) depth = Math.max(depth, 4) as DepthLevel;

    // Regra 3: Volume de alterações (linhas)
    const totalLines = linhas_adicionadas + linhas_removidas;
    if (totalLines > 500) depth = Math.max(depth, 3) as DepthLevel;
    else if (totalLines > 100) depth = Math.max(depth, 2) as DepthLevel;

    // Regra 4: Quantidade de arquivos (refatoração estrutural)
    if (authoralFiles.length > 10) depth = Math.max(depth, 3) as DepthLevel;

    return depth;
  }

  /**
   * Calcula o peso arquitetural de um commit baseado nos arquivos tocados.
   */
  calculateArchitecturalWeight(files: CommitFileChange[]): number {
    const authoralFiles = files.filter(f => !f.is_dependency);
    if (authoralFiles.length === 0) return 0;

    let weight = 1.0;

    for (const file of authoralFiles) {
      switch (file.modulo_tipo) {
        case 'core':
          weight += 0.5;
          break;
        case 'feature':
          weight += 0.2;
          break;
        case 'test':
          weight += 0.3;
          break;
        case 'config':
          weight += 0.05;
          break;
        case 'docs':
          weight += 0.02;
          break;
        case 'superficial':
          weight += 0.01;
          break;
      }
    }

    // Cap em 5.0
    return Math.min(weight, 5.0);
  }

  /**
   * Extrai os domínios técnicos de um conjunto de arquivos.
   * NÃO infere domínio de dependências.
   */
  extractDomains(files: CommitFileChange[]): string[] {
    const domains = new Set<string>();

    for (const file of files) {
      // Ignorar dependências — não conta como evidência
      if (file.is_dependency) continue;
      // Ignorar scaffolding — não prova skill
      if (file.classificacao === 'scaffold') continue;
      // Ignorar assets
      if (file.classificacao === 'asset') continue;

      if (file.dominio) {
        domains.add(file.dominio);
      }
    }

    return Array.from(domains);
  }

  // ─── Private: Git Log Parsing ──────────────────────────────────

  private discoverUserEmails(repoDir: string): void {
    try {
      const output = execSync(
        'git log --format="%an|%ae" --all 2>/dev/null | sort -u',
        { cwd: repoDir, encoding: 'utf-8', timeout: 10000 }
      ).trim();

      for (const line of output.split('\n')) {
        const [name, email] = line.split('|');
        if (!name || !email) continue;

        if (
          name.toLowerCase().includes(this.username) ||
          email.toLowerCase().includes(this.username) ||
          this.username.includes(name.toLowerCase())
        ) {
          this.userEmails.add(email.toLowerCase());
          this.userEmails.add(name.toLowerCase());
        }
      }
    } catch {
      // fallback: usar username direto
    }
  }

  private getDetailedGitLog(repoDir: string, maxCommits: number): string {
    try {
      // Formato: hash|autor|email|data|mensagem\0
      // Seguido por --numstat para linhas adicionadas/removidas por arquivo
      return execSync(
        `git log --format="__COMMIT__%H|%an|%ae|%aI|%s" --numstat -${maxCommits} 2>/dev/null`,
        { cwd: repoDir, encoding: 'utf-8', timeout: 30000, maxBuffer: 10 * 1024 * 1024 }
      );
    } catch {
      log.warn(`Falha ao obter git log de: ${repoDir}`);
      return '';
    }
  }

  private parseGitLog(rawLog: string, _repoDir: string): CommitAnalysis[] {
    const commits: CommitAnalysis[] = [];
    const lines = rawLog.split('\n');

    let current: Partial<CommitAnalysis> | null = null;
    let currentFiles: CommitFileChange[] = [];

    for (const line of lines) {
      if (line.startsWith('__COMMIT__')) {
        // Finalizar commit anterior
        if (current) {
          commits.push(this.finalizeCommit(current, currentFiles));
        }

        // Parsear novo commit
        const parts = line.replace('__COMMIT__', '').split('|');
        const [hash, autor, email, data, ...msgParts] = parts;

        current = {
          hash: hash || '',
          autor: autor || '',
          autor_email: email || '',
          data: data || '',
          mensagem: msgParts.join('|') || '',
          is_own_commit: this.isOwnCommit(autor || '', email || ''),
          linhas_adicionadas: 0,
          linhas_removidas: 0,
        };
        currentFiles = [];
      } else if (current && line.trim()) {
        // Parse --numstat line: "added\tremoved\tfilepath"
        const match = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
        if (match) {
          const added = match[1] === '-' ? 0 : parseInt(match[1], 10);
          const removed = match[2] === '-' ? 0 : parseInt(match[2], 10);
          const filePath = match[3];

          const fileChange = this.classifyFile(filePath);
          fileChange.adicionadas = added;
          fileChange.removidas = removed;

          currentFiles.push(fileChange);
          current.linhas_adicionadas = (current.linhas_adicionadas || 0) + added;
          current.linhas_removidas = (current.linhas_removidas || 0) + removed;
        }
      }
    }

    // Último commit
    if (current) {
      commits.push(this.finalizeCommit(current, currentFiles));
    }

    return commits;
  }

  private finalizeCommit(partial: Partial<CommitAnalysis>, files: CommitFileChange[]): CommitAnalysis {
    const commit: CommitAnalysis = {
      hash: partial.hash || '',
      autor: partial.autor || '',
      autor_email: partial.autor_email || '',
      data: partial.data || '',
      mensagem: partial.mensagem || '',
      arquivos_modificados: files,
      linhas_adicionadas: partial.linhas_adicionadas || 0,
      linhas_removidas: partial.linhas_removidas || 0,
      is_own_commit: partial.is_own_commit || false,
      depth_level: 1,
      dominios: [],
      peso_arquitetural: 0,
    };

    // Calcular depth level
    commit.depth_level = this.calculateDepthLevel(commit);

    // Extrair domínios (SEM inferência por stack)
    commit.dominios = this.extractDomains(files);

    // Calcular peso arquitetural
    commit.peso_arquitetural = this.calculateArchitecturalWeight(files);

    return commit;
  }

  private isOwnCommit(autor: string, email: string): boolean {
    if (!this.username) return false;

    const autorLower = autor.toLowerCase();
    const emailLower = email.toLowerCase();

    // Check direto contra username
    if (autorLower.includes(this.username) || emailLower.includes(this.username)) {
      return true;
    }

    // Check contra emails descobertos
    if (this.userEmails.has(autorLower) || this.userEmails.has(emailLower)) {
      return true;
    }

    return false;
  }

  // ─── Private: File Classification ──────────────────────────────

  private getFileClassification(filePath: string, ext: string, name: string): FileClassification {
    // 1. Dependência
    if (this.isDependencyFile(filePath)) return 'dependencia';

    // 2. Asset
    if (ASSET_EXTENSIONS.includes(ext)) return 'asset';

    // 3. Scaffold
    if (SCAFFOLD_FILES.includes(name)) return 'scaffold';

    // 4. Teste
    if (TEST_PATH_PATTERNS.some(p => p.test(filePath))) return 'teste';

    // 5. Migration
    if (/migration/i.test(filePath) || /\.sql$/i.test(filePath)) return 'migracao';

    // 6. Documentação
    if (['.md', '.txt', '.rst'].includes(ext) || /\b(docs?|documentation)\b/i.test(filePath)) return 'documentacao';

    // 7. Config
    if (['.json', '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf'].includes(ext) && !this.isCodeFile(name)) {
      return 'configuracao';
    }

    // 8. Código autoral
    return 'codigo-autoral';
  }

  private isCodeFile(name: string): boolean {
    // Arquivos JSON que são código (não config)
    return /\.(component|service|module|controller|resolver|guard)\./i.test(name);
  }

  private isDependencyFile(filePath: string): boolean {
    const lower = filePath.toLowerCase();
    return DEPENDENCY_PATHS.some(p =>
      lower.includes(`/${p}/`) || lower.includes(`\\${p}\\`) || lower.startsWith(`${p}/`)
    );
  }

  private getFileDomain(ext: string): string {
    const mapping = EXTENSION_DOMAIN_MAP[ext];
    return mapping?.dominio || 'Outro';
  }

  private getModuleType(filePath: string): ModuleType {
    // Prioridade: core > test > feature > config > docs > superficial
    if (CORE_PATH_PATTERNS.some(p => p.test(filePath))) return 'core';
    if (TEST_PATH_PATTERNS.some(p => p.test(filePath))) return 'test';
    if (FEATURE_PATH_PATTERNS.some(p => p.test(filePath))) return 'feature';

    const ext = extname(filePath).toLowerCase();
    const name = basename(filePath).toLowerCase();

    if (['.json', '.yml', '.yaml', '.toml', '.ini'].includes(ext)) return 'config';
    if (['.md', '.txt', '.rst'].includes(ext)) return 'docs';
    if (SCAFFOLD_FILES.includes(basename(filePath))) return 'config';

    // Dockerfile, docker-compose → config
    if (name.startsWith('dockerfile') || name.includes('docker-compose')) return 'config';

    // Se é código mas não está em path reconhecido → feature (default para código)
    if (EXTENSION_DOMAIN_MAP[ext]) return 'feature';

    return 'superficial';
  }
}

// ─── Exported utilities for testing ──────────────────────────────────

export {
  EXTENSION_DOMAIN_MAP,
  DEPENDENCY_PATHS,
  SCAFFOLD_FILES,
  ASSET_EXTENSIONS,
  CORE_PATH_PATTERNS,
  FEATURE_PATH_PATTERNS,
  TEST_PATH_PATTERNS,
  DEPTH_4_PATTERNS,
  DEPTH_3_PATTERNS,
  DEPTH_2_PATTERNS,
};

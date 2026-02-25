/**
 * SelfKnowledgeEngine — Camada 1: Evidence Collector
 *
 * Responsável por coletar evidências factuais de:
 * - Arquivos de configuração (package.json, composer.json, docker-compose, etc.)
 * - Código fonte (padrões arquiteturais, imports, estrutura)
 * - Histórico Git (commits, branches)
 * - GitHub API (repos, linguagens)
 * - README e documentação
 * - Migrations e schemas
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import type { Evidence, ComplexityLevel, SKEConfig } from './types.js';
import {
  generateEvidenceId,
  safeReadFile,
  safeReadJson,
  walkDir,
  isProjectRoot,
  getProjectName,
  now,
  log,
} from './utils.js';
import { CommitAnalyzer } from './commit-analyzer.js';

// ─── Stack Detection Maps ────────────────────────────────────────────

const DEPENDENCY_STACK_MAP: Record<string, string[]> = {
  // JavaScript/TypeScript
  react: ['React', 'Frontend'],
  'react-dom': ['React', 'Frontend'],
  'react-router': ['React Router', 'SPA'],
  'react-router-dom': ['React Router', 'SPA'],
  next: ['Next.js', 'SSR', 'React'],
  vue: ['Vue.js', 'Frontend'],
  nuxt: ['Nuxt.js', 'SSR', 'Vue.js'],
  angular: ['Angular', 'Frontend'],
  svelte: ['Svelte', 'Frontend'],
  express: ['Express.js', 'Node.js', 'Backend'],
  fastify: ['Fastify', 'Node.js', 'Backend'],
  nestjs: ['NestJS', 'Node.js', 'Backend', 'TypeScript'],
  '@nestjs/core': ['NestJS', 'Node.js', 'Backend', 'TypeScript'],
  prisma: ['Prisma ORM', 'Database'],
  '@prisma/client': ['Prisma ORM', 'Database'],
  typeorm: ['TypeORM', 'Database'],
  sequelize: ['Sequelize', 'Database', 'ORM'],
  mongoose: ['Mongoose', 'MongoDB', 'Database'],
  knex: ['Knex.js', 'Query Builder', 'Database'],
  redis: ['Redis', 'Cache'],
  ioredis: ['Redis', 'Cache'],
  bullmq: ['BullMQ', 'Filas', 'Redis'],
  bull: ['Bull', 'Filas', 'Redis'],
  jest: ['Jest', 'Testes'],
  vitest: ['Vitest', 'Testes'],
  mocha: ['Mocha', 'Testes'],
  cypress: ['Cypress', 'E2E', 'Testes'],
  playwright: ['Playwright', 'E2E', 'Testes'],
  webpack: ['Webpack', 'Bundler'],
  vite: ['Vite', 'Bundler'],
  esbuild: ['esbuild', 'Bundler'],
  tailwindcss: ['Tailwind CSS', 'CSS'],
  '@tailwindcss/vite': ['Tailwind CSS', 'CSS'],
  typescript: ['TypeScript'],
  graphql: ['GraphQL', 'API'],
  '@apollo/server': ['Apollo', 'GraphQL', 'API'],
  'socket.io': ['WebSocket', 'Real-time'],
  axios: ['HTTP Client'],
  zod: ['Zod', 'Validação'],
  'class-validator': ['Class Validator', 'Validação'],
  docker: ['Docker', 'DevOps'],
  // PHP
  'laravel/framework': ['Laravel', 'PHP', 'Backend'],
  'symfony/symfony': ['Symfony', 'PHP', 'Backend'],
  'doctrine/orm': ['Doctrine ORM', 'PHP', 'Database'],
  'phpunit/phpunit': ['PHPUnit', 'PHP', 'Testes'],
  'predis/predis': ['Redis', 'PHP', 'Cache'],
  // Python
  django: ['Django', 'Python', 'Backend'],
  flask: ['Flask', 'Python', 'Backend'],
  fastapi: ['FastAPI', 'Python', 'Backend'],
  sqlalchemy: ['SQLAlchemy', 'Python', 'ORM', 'Database'],
  celery: ['Celery', 'Python', 'Filas'],
  pytest: ['Pytest', 'Python', 'Testes'],
};

const FILE_PATTERN_STACK = [
  { pattern: /docker-compose/i, stack: ['Docker', 'Docker Compose', 'DevOps'], complexity: 'medio' as ComplexityLevel },
  { pattern: /Dockerfile/i, stack: ['Docker', 'DevOps'], complexity: 'medio' as ComplexityLevel },
  { pattern: /\.github\/workflows/i, stack: ['GitHub Actions', 'CI/CD', 'DevOps'], complexity: 'medio' as ComplexityLevel },
  { pattern: /Jenkinsfile/i, stack: ['Jenkins', 'CI/CD', 'DevOps'], complexity: 'alto' as ComplexityLevel },
  { pattern: /\.circleci/i, stack: ['CircleCI', 'CI/CD', 'DevOps'], complexity: 'medio' as ComplexityLevel },
  { pattern: /terraform/i, stack: ['Terraform', 'IaC', 'DevOps'], complexity: 'alto' as ComplexityLevel },
  { pattern: /kubernetes|k8s/i, stack: ['Kubernetes', 'Orquestração', 'DevOps'], complexity: 'alto' as ComplexityLevel },
  { pattern: /migration/i, stack: ['Migrations', 'Database'], complexity: 'medio' as ComplexityLevel },
  { pattern: /\.test\.|\.spec\./i, stack: ['Testes Automatizados'], complexity: 'medio' as ComplexityLevel },
  { pattern: /swagger|openapi/i, stack: ['OpenAPI', 'Documentação API'], complexity: 'medio' as ComplexityLevel },
  { pattern: /nginx\.conf/i, stack: ['Nginx', 'Web Server'], complexity: 'medio' as ComplexityLevel },
  { pattern: /\.env\.example/i, stack: ['Environment Config'], complexity: 'baixo' as ComplexityLevel },
];

// ─── Main Collector Class ────────────────────────────────────────────

export class EvidenceCollector {
  private config: SKEConfig;
  private evidences: Evidence[] = [];
  private commitAnalyzer: CommitAnalyzer;

  constructor(config: SKEConfig) {
    this.config = config;
    this.commitAnalyzer = new CommitAnalyzer(config.github_username || '');
  }

  /**
   * Executa a coleta completa de todas as fontes configuradas.
   */
  async collect(): Promise<Evidence[]> {
    this.evidences = [];

    log.section('CAMADA 1 — EVIDENCE COLLECTOR');

    for (const scanPath of this.config.scan_paths) {
      log.step(`Escaneando: ${scanPath}`);

      if (!existsSync(scanPath)) {
        log.warn(`Caminho não encontrado: ${scanPath}`);
        continue;
      }

      await this.collectFromDirectory(scanPath);
    }

    // GitHub API (se configurado)
    if (this.config.github_token && this.config.github_username) {
      await this.collectFromGitHub();
    }

    log.ok(`Total de evidências coletadas: ${this.evidences.length}`);
    return this.evidences;
  }

  // ─── Directory Scanning ──────────────────────────────────────────

  private async collectFromDirectory(dir: string, depth: number = 0): Promise<void> {
    const MAX_SCAN_DEPTH = this.config.max_depth ?? 4;

    // Detectar se é raiz de projeto
    if (isProjectRoot(dir)) {
      const projectName = getProjectName(dir);
      log.step(`Projeto detectado: ${projectName}`);

      // Coletar de configs
      this.collectFromPackageJson(dir, projectName);
      this.collectFromComposerJson(dir, projectName);
      this.collectFromDockerCompose(dir, projectName);
      this.collectFromReadme(dir, projectName);
      this.collectFromGitHistory(dir, projectName);
      this.collectFromFileStructure(dir, projectName);
      this.collectFromCIConfigs(dir, projectName);
      this.collectFromMigrations(dir, projectName);
      this.collectFromTestFiles(dir, projectName);
    }

    // Escanear subdiretórios recursivamente até MAX_SCAN_DEPTH
    if (depth >= MAX_SCAN_DEPTH) return;

    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        if (this.config.ignore_patterns.includes(entry)) continue;
        if (entry.startsWith('.')) continue;

        const fullPath = join(dir, entry);
        try {
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            await this.collectFromDirectory(fullPath, depth + 1);
          }
        } catch {
          // Skip inaccessible dirs
        }
      }
    } catch {
      // Skip
    }
  }

  // ─── Package.json Analysis ───────────────────────────────────────

  private collectFromPackageJson(dir: string, projectName: string): void {
    const pkgPath = join(dir, 'package.json');
    const pkg = safeReadJson<Record<string, unknown>>(pkgPath);
    if (!pkg) return;

    const allDeps = {
      ...(pkg.dependencies as Record<string, string> || {}),
      ...(pkg.devDependencies as Record<string, string> || {}),
    };

    const detectedStack: string[] = [];
    const descriptions: string[] = [];

    for (const [dep, _version] of Object.entries(allDeps)) {
      const stackEntry = DEPENDENCY_STACK_MAP[dep];
      if (stackEntry) {
        detectedStack.push(...stackEntry);
        descriptions.push(`Usa ${dep}`);
      }
    }

    // Scripts revelam práticas
    const scripts = pkg.scripts as Record<string, string> | undefined;
    if (scripts) {
      if (scripts.test) {
        detectedStack.push('Testes Automatizados');
        descriptions.push(`Script de teste configurado: ${scripts.test}`);
      }
      if (scripts.lint || scripts['lint:fix']) {
        detectedStack.push('Linting');
        descriptions.push('Linting configurado');
      }
      if (scripts.build) {
        detectedStack.push('Build Pipeline');
        descriptions.push(`Build configurado: ${scripts.build}`);
      }
      if (scripts.dev || scripts.start) {
        descriptions.push('Ambiente de desenvolvimento configurado');
      }
    }

    const uniqueStack = [...new Set(detectedStack)];
    const complexity = this.assessDependencyComplexity(Object.keys(allDeps).length);

    if (uniqueStack.length > 0) {
      this.addEvidence({
        fonte: pkgPath,
        tipo: 'config',
        descricao: `Projeto Node.js/TypeScript com ${Object.keys(allDeps).length} dependências. Stack: ${uniqueStack.join(', ')}. ${descriptions.slice(0, 5).join('. ')}.`,
        stack_detectada: uniqueStack,
        nivel_complexidade: complexity,
        projeto: projectName,
      });
    }
  }

  // ─── Composer.json Analysis ──────────────────────────────────────

  private collectFromComposerJson(dir: string, projectName: string): void {
    const composerPath = join(dir, 'composer.json');
    const composer = safeReadJson<Record<string, unknown>>(composerPath);
    if (!composer) return;

    const require = composer.require as Record<string, string> || {};
    const requireDev = composer['require-dev'] as Record<string, string> || {};
    const allDeps = { ...require, ...requireDev };

    const detectedStack: string[] = ['PHP'];
    const descriptions: string[] = [];

    for (const dep of Object.keys(allDeps)) {
      const stackEntry = DEPENDENCY_STACK_MAP[dep];
      if (stackEntry) {
        detectedStack.push(...stackEntry);
      }

      // Detectar pacotes Laravel/Symfony específicos
      if (dep.startsWith('laravel/')) {
        detectedStack.push('Laravel');
        descriptions.push(`Pacote Laravel: ${dep}`);
      }
      if (dep.startsWith('symfony/')) {
        detectedStack.push('Symfony');
        descriptions.push(`Componente Symfony: ${dep}`);
      }
    }

    const uniqueStack = [...new Set(detectedStack)];
    const complexity = this.assessDependencyComplexity(Object.keys(allDeps).length);

    this.addEvidence({
      fonte: composerPath,
      tipo: 'config',
      descricao: `Projeto PHP com ${Object.keys(allDeps).length} dependências. Stack: ${uniqueStack.join(', ')}.`,
      stack_detectada: uniqueStack,
      nivel_complexidade: complexity,
      projeto: projectName,
    });
  }

  // ─── Docker Compose Analysis ─────────────────────────────────────

  private collectFromDockerCompose(dir: string, projectName: string): void {
    const candidates = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'];

    for (const candidate of candidates) {
      const filePath = join(dir, candidate);
      const content = safeReadFile(filePath);
      if (!content) continue;

      const stack: string[] = ['Docker', 'Docker Compose'];
      const services: string[] = [];

      // Detectar serviços pelo conteúdo YAML
      const serviceMatches = content.match(/^\s{2}\w[\w-]*:/gm);
      if (serviceMatches) {
        services.push(...serviceMatches.map(s => s.trim().replace(':', '')));
      }

      // Detectar imagens
      const imageMatches = content.match(/image:\s*(.+)/g);
      if (imageMatches) {
        for (const img of imageMatches) {
          const imageName = img.replace('image:', '').trim();
          if (/mysql|mariadb/i.test(imageName)) stack.push('MySQL', 'Database');
          if (/postgres/i.test(imageName)) stack.push('PostgreSQL', 'Database');
          if (/redis/i.test(imageName)) stack.push('Redis', 'Cache');
          if (/mongo/i.test(imageName)) stack.push('MongoDB', 'Database');
          if (/rabbitmq/i.test(imageName)) stack.push('RabbitMQ', 'Message Queue');
          if (/elasticsearch/i.test(imageName)) stack.push('Elasticsearch', 'Search');
          if (/nginx/i.test(imageName)) stack.push('Nginx', 'Web Server');
          if (/traefik/i.test(imageName)) stack.push('Traefik', 'Reverse Proxy');
        }
      }

      this.addEvidence({
        fonte: filePath,
        tipo: 'docker',
        descricao: `Orquestração Docker com ${services.length} serviços: ${services.join(', ')}. Infraestrutura containerizada.`,
        stack_detectada: [...new Set(stack)],
        nivel_complexidade: services.length > 3 ? 'alto' : 'medio',
        projeto: projectName,
      });
    }

    // Dockerfile standalone
    const dockerfilePath = join(dir, 'Dockerfile');
    const dockerfileContent = safeReadFile(dockerfilePath);
    if (dockerfileContent) {
      const stages = (dockerfileContent.match(/^FROM\s/gm) || []).length;
      const isMultistage = stages > 1;

      this.addEvidence({
        fonte: dockerfilePath,
        tipo: 'docker',
        descricao: `Dockerfile ${isMultistage ? 'multi-stage' : 'single-stage'} com ${stages} estágio(s). ${isMultistage ? 'Indica conhecimento de otimização de imagens.' : ''}`,
        stack_detectada: ['Docker', ...(isMultistage ? ['Multi-stage Build'] : [])],
        nivel_complexidade: isMultistage ? 'alto' : 'medio',
        projeto: projectName,
      });
    }
  }

  // ─── README Analysis ─────────────────────────────────────────────

  private collectFromReadme(dir: string, projectName: string): void {
    const candidates = ['README.md', 'readme.md', 'README.txt', 'README'];
    for (const candidate of candidates) {
      const filePath = join(dir, candidate);
      const content = safeReadFile(filePath);
      if (!content) continue;

      // Extrair informações factuais do README
      const lines = content.split('\n');
      const title = lines.find(l => l.startsWith('#'))?.replace(/^#+\s*/, '').trim();

      // Detectar menções a tecnologias
      const stack: string[] = [];
      const techMentions = [
        { regex: /react/i, tech: 'React' },
        { regex: /typescript/i, tech: 'TypeScript' },
        { regex: /node\.?js/i, tech: 'Node.js' },
        { regex: /docker/i, tech: 'Docker' },
        { regex: /kubernetes|k8s/i, tech: 'Kubernetes' },
        { regex: /laravel/i, tech: 'Laravel' },
        { regex: /php/i, tech: 'PHP' },
        { regex: /python/i, tech: 'Python' },
        { regex: /django/i, tech: 'Django' },
        { regex: /postgres/i, tech: 'PostgreSQL' },
        { regex: /mysql/i, tech: 'MySQL' },
        { regex: /redis/i, tech: 'Redis' },
        { regex: /graphql/i, tech: 'GraphQL' },
        { regex: /rest\s*api/i, tech: 'REST API' },
        { regex: /microservi/i, tech: 'Microservices' },
        { regex: /ci\s*\/?\s*cd/i, tech: 'CI/CD' },
        { regex: /terraform/i, tech: 'Terraform' },
        { regex: /aws/i, tech: 'AWS' },
        { regex: /gcp|google cloud/i, tech: 'GCP' },
        { regex: /azure/i, tech: 'Azure' },
      ];

      for (const { regex, tech } of techMentions) {
        if (regex.test(content)) stack.push(tech);
      }

      this.addEvidence({
        fonte: filePath,
        tipo: 'readme',
        descricao: `README do projeto "${title || projectName}". ${content.length > 2000 ? 'Documentação detalhada' : 'Documentação básica'} com ${lines.length} linhas.${stack.length > 0 ? ` Tecnologias mencionadas: ${stack.join(', ')}.` : ''}`,
        stack_detectada: stack,
        nivel_complexidade: 'baixo',
        projeto: projectName,
      });

      break; // Usar apenas o primeiro README encontrado
    }
  }

  // ─── Git History Analysis (v3.0 — Commit-level) ──────────────

  private collectFromGitHistory(dir: string, projectName: string): void {
    if (!existsSync(join(dir, '.git'))) return;

    try {
      // v3.0: Analisar commits individualmente via CommitAnalyzer
      const commitAnalyses = this.commitAnalyzer.analyzeRepository(dir, 200);

      if (commitAnalyses.length === 0) {
        log.warn(`Nenhum commit encontrado em: ${dir}`);
        return;
      }

      // Filtrar apenas commits do usuário (autoria real)
      const ownCommits = commitAnalyses.filter(c => c.is_own_commit);
      const totalCommits = commitAnalyses.length;

      log.step(`Git: ${totalCommits} commits totais, ${ownCommits.length} autorais em ${projectName}`);

      // Criar evidência de commit para CADA commit autoral
      // Isso garante que o agente analise autoria REAL por commit
      for (const commit of ownCommits) {
        // Ignorar commits que tocam apenas dependências/scaffold
        const authoralFiles = commit.arquivos_modificados.filter(f => !f.is_dependency && f.classificacao !== 'scaffold');
        if (authoralFiles.length === 0) continue;

        // Extrair domínios técnicos REAIS (do código modificado, não da stack do projeto)
        const dominios = commit.dominios.filter(d => d !== 'Outro');
        const stack = [...new Set(dominios)];

        // Determinar complexidade baseada na profundidade do commit
        const complexity: ComplexityLevel =
          commit.depth_level >= 4 ? 'alto' :
          commit.depth_level >= 3 ? 'medio' :
          commit.depth_level >= 2 ? 'medio' : 'baixo';

        // Descrição factual do commit
        const filesDesc = authoralFiles.slice(0, 5).map(f => f.caminho).join(', ');
        const moreFiles = authoralFiles.length > 5 ? ` e mais ${authoralFiles.length - 5}` : '';

        this.addEvidence({
          fonte: dir,
          tipo: 'commit',
          descricao: `Commit ${commit.hash.slice(0, 7)}: "${commit.mensagem}". ${authoralFiles.length} arquivo(s) autoral(is) modificado(s) (${filesDesc}${moreFiles}). +${commit.linhas_adicionadas}/-${commit.linhas_removidas} linhas. Profundidade: ${commit.depth_level}/4. Peso arquitetural: ${commit.peso_arquitetural.toFixed(1)}.`,
          stack_detectada: stack.length > 0 ? stack : ['Git'],
          nivel_complexidade: complexity,
          projeto: projectName,
        });
      }

      // Criar evidência resumo do repositório (para contexto, não para inferência de skill)
      const langStats = this.getGitLanguageStats(dir);

      this.addEvidence({
        fonte: dir,
        tipo: 'commit',
        descricao: `Resumo do repositório Git "${projectName}": ${totalCommits} commits totais, ${ownCommits.length} autorais (${((ownCommits.length / totalCommits) * 100).toFixed(0)}%). Profundidade média: ${ownCommits.length > 0 ? (ownCommits.reduce((s, c) => s + c.depth_level, 0) / ownCommits.length).toFixed(1) : '0'}/4. ${langStats.length > 0 ? `Linguagens: ${langStats.join(', ')}.` : ''}`,
        stack_detectada: ['Git', ...langStats],
        nivel_complexidade: totalCommits > 500 ? 'alto' : totalCommits > 100 ? 'medio' : 'baixo',
        projeto: projectName,
      });

      // Coletar padrões de commit (Conventional Commits, etc.)
      this.collectCommitPatterns(dir, projectName);

    } catch (err) {
      log.warn(`Falha ao analisar histórico Git de: ${dir} — ${err}`);
    }
  }

  private getGitLanguageStats(dir: string): string[] {
    try {
      const files = execSync(
        'git ls-files',
        { cwd: dir, encoding: 'utf-8', timeout: 10000 }
      ).trim().split('\n');

      const extCount: Record<string, number> = {};
      for (const file of files) {
        const ext = extname(file);
        if (ext) {
          extCount[ext] = (extCount[ext] || 0) + 1;
        }
      }

      const extToLang: Record<string, string> = {
        '.ts': 'TypeScript', '.tsx': 'TypeScript/React',
        '.js': 'JavaScript', '.jsx': 'JavaScript/React',
        '.php': 'PHP', '.py': 'Python',
        '.go': 'Go', '.rs': 'Rust',
        '.java': 'Java', '.kt': 'Kotlin',
        '.rb': 'Ruby', '.swift': 'Swift',
        '.cs': 'C#', '.cpp': 'C++',
        '.sql': 'SQL', '.sh': 'Shell',
        '.vue': 'Vue.js', '.svelte': 'Svelte',
      };

      return Object.entries(extCount)
        .filter(([ext, count]) => count > 2 && extToLang[ext])
        .sort((a, b) => b[1] - a[1])
        .map(([ext]) => extToLang[ext])
        .filter((v): v is string => !!v);
    } catch {
      return [];
    }
  }

  private collectCommitPatterns(dir: string, projectName: string): void {
    try {
      const commitLog = execSync(
        'git log --oneline -50 --no-color',
        { cwd: dir, encoding: 'utf-8', timeout: 10000 }
      ).trim();

      const patterns: string[] = [];
      const lines = commitLog.split('\n');

      // Detectar padrões de commit
      const hasConventionalCommits = lines.some(l => /^[\da-f]+\s+(feat|fix|chore|docs|refactor|test|ci|perf|style)\s*[(:]/i.test(l));
      if (hasConventionalCommits) patterns.push('Conventional Commits');

      const hasRefactoring = lines.some(l => /refactor/i.test(l));
      if (hasRefactoring) patterns.push('Refatoração');

      const hasTests = lines.some(l => /test|spec/i.test(l));
      if (hasTests) patterns.push('Testes');

      const hasCICD = lines.some(l => /ci|cd|deploy|pipeline/i.test(l));
      if (hasCICD) patterns.push('CI/CD');

      const hasPerf = lines.some(l => /perf|performance|optim/i.test(l));
      if (hasPerf) patterns.push('Performance');

      if (patterns.length > 0) {
        this.addEvidence({
          fonte: dir,
          tipo: 'commit',
          descricao: `Padrões de commit: ${patterns.join(', ')}. Analisados ${lines.length} commits recentes.`,
          stack_detectada: patterns,
          nivel_complexidade: 'medio',
          projeto: projectName,
        });
      }
    } catch {
      // Skip
    }
  }

  // ─── File Structure Analysis ─────────────────────────────────────

  private collectFromFileStructure(dir: string, projectName: string): void {
    try {
      const entries = readdirSync(dir);
      const structurePatterns: string[] = [];
      const stack: string[] = [];

      // Detectar padrões arquiteturais pela estrutura de pastas
      const dirPatterns: Array<{ dirs: string[]; pattern: string; stack: string[] }> = [
        { dirs: ['src', 'lib'], pattern: 'Separação src/lib', stack: ['Organização de Código'] },
        { dirs: ['controllers', 'models', 'views'], pattern: 'MVC', stack: ['MVC'] },
        { dirs: ['domain', 'application', 'infrastructure'], pattern: 'Clean Architecture / DDD', stack: ['Clean Architecture', 'DDD'] },
        { dirs: ['entities', 'use-cases', 'interfaces'], pattern: 'Clean Architecture', stack: ['Clean Architecture'] },
        { dirs: ['components', 'hooks', 'utils'], pattern: 'React patterns', stack: ['React', 'Componentização'] },
        { dirs: ['modules'], pattern: 'Modular architecture', stack: ['Arquitetura Modular'] },
        { dirs: ['services', 'repositories'], pattern: 'Service/Repository pattern', stack: ['Service Pattern', 'Repository Pattern'] },
        { dirs: ['middleware', 'routes'], pattern: 'Backend API pattern', stack: ['API Backend'] },
        { dirs: ['tests', '__tests__', 'spec'], pattern: 'Estrutura de testes', stack: ['Testes Automatizados'] },
        { dirs: ['migrations', 'seeds'], pattern: 'Database migrations', stack: ['Migrations', 'Database'] },
        { dirs: ['deploy', 'infra', 'terraform'], pattern: 'Infrastructure as Code', stack: ['IaC', 'DevOps'] },
        { dirs: ['docs', 'documentation'], pattern: 'Documentação técnica', stack: ['Documentação'] },
      ];

      for (const { dirs, pattern, stack: s } of dirPatterns) {
        if (dirs.some(d => entries.includes(d))) {
          structurePatterns.push(pattern);
          stack.push(...s);
        }
      }

      // Detectar arquivos de configuração especiais
      const configFiles = entries.filter(e =>
        /^\.?(eslint|prettier|stylelint|babel|webpack|jest|vitest|cypress|playwright)/i.test(e) ||
        e === 'tsconfig.json' || e === '.editorconfig'
      );

      if (configFiles.length > 0) {
        structurePatterns.push('Ferramental configurado');
        stack.push('Tooling');
      }

      // Detectar padrões por nome de arquivo (FILE_PATTERN_STACK)
      for (const entry of entries) {
        for (const { pattern, stack: s } of FILE_PATTERN_STACK) {
          if (pattern.test(entry)) {
            stack.push(...s);
          }
        }
      }

      if (structurePatterns.length > 0) {
        this.addEvidence({
          fonte: dir,
          tipo: 'arquivo',
          descricao: `Estrutura de projeto com padrões: ${structurePatterns.join(', ')}. ${configFiles.length} arquivos de configuração de ferramentas detectados.`,
          stack_detectada: [...new Set(stack)],
          nivel_complexidade: structurePatterns.length > 3 ? 'alto' : 'medio',
          projeto: projectName,
        });
      }
    } catch {
      // Skip
    }
  }

  // ─── CI/CD Config Analysis ───────────────────────────────────────

  private collectFromCIConfigs(dir: string, projectName: string): void {
    // GitHub Actions
    const workflowsDir = join(dir, '.github', 'workflows');
    if (existsSync(workflowsDir)) {
      try {
        const workflows = readdirSync(workflowsDir).filter(f => /\.ya?ml$/i.test(f));
        for (const workflow of workflows) {
          const content = safeReadFile(join(workflowsDir, workflow));
          if (!content) continue;

          const stack: string[] = ['GitHub Actions', 'CI/CD'];
          const steps: string[] = [];

          if (/test/i.test(content)) { stack.push('Testes em CI'); steps.push('testes'); }
          if (/deploy/i.test(content)) { stack.push('Deploy Automatizado'); steps.push('deploy'); }
          if (/lint/i.test(content)) { stack.push('Linting em CI'); steps.push('linting'); }
          if (/build/i.test(content)) { steps.push('build'); }
          if (/docker/i.test(content)) { stack.push('Docker em CI'); steps.push('docker'); }
          if (/cache/i.test(content)) { steps.push('cache de dependências'); }

          this.addEvidence({
            fonte: join(workflowsDir, workflow),
            tipo: 'ci',
            descricao: `GitHub Actions workflow "${workflow}". Steps: ${steps.join(', ')}.`,
            stack_detectada: [...new Set(stack)],
            nivel_complexidade: steps.length > 3 ? 'alto' : 'medio',
            projeto: projectName,
          });
        }
      } catch {
        // Skip
      }
    }
  }

  // ─── Migration Analysis ──────────────────────────────────────────

  private collectFromMigrations(dir: string, projectName: string): void {
    const migrationDirs = ['migrations', 'database/migrations', 'src/migrations', 'prisma/migrations'];

    for (const migDir of migrationDirs) {
      const fullPath = join(dir, migDir);
      if (!existsSync(fullPath)) continue;

      try {
        const files = readdirSync(fullPath).filter(f => !f.startsWith('.'));
        if (files.length === 0) continue;

        // Analisar conteúdo das migrations
        const stack: string[] = ['Migrations', 'Database'];
        const operations: string[] = [];

        for (const file of files.slice(-10)) { // Analisar últimas 10
          const content = safeReadFile(join(fullPath, file));
          if (!content) continue;

          if (/CREATE\s+TABLE/i.test(content)) operations.push('criação de tabelas');
          if (/ALTER\s+TABLE/i.test(content)) operations.push('alteração de tabelas');
          if (/CREATE\s+INDEX/i.test(content)) operations.push('criação de índices');
          if (/FOREIGN\s+KEY/i.test(content)) operations.push('chaves estrangeiras');
          if (/ADD\s+COLUMN/i.test(content)) operations.push('adição de colunas');
          if (/ENUM/i.test(content)) operations.push('uso de enums');
        }

        const uniqueOps = [...new Set(operations)];

        this.addEvidence({
          fonte: fullPath,
          tipo: 'migration',
          descricao: `${files.length} migrations de banco de dados. Operações: ${uniqueOps.join(', ') || 'não identificadas'}.`,
          stack_detectada: stack,
          nivel_complexidade: files.length > 20 ? 'alto' : files.length > 5 ? 'medio' : 'baixo',
          projeto: projectName,
        });
      } catch {
        // Skip
      }
    }

    // Prisma Schema
    const prismaSchema = join(dir, 'prisma', 'schema.prisma');
    const prismaContent = safeReadFile(prismaSchema);
    if (prismaContent) {
      const models = (prismaContent.match(/^model\s+\w+/gm) || []).length;
      const enums = (prismaContent.match(/^enum\s+\w+/gm) || []).length;
      const relations = (prismaContent.match(/@relation/g) || []).length;

      this.addEvidence({
        fonte: prismaSchema,
        tipo: 'config',
        descricao: `Prisma Schema com ${models} models, ${enums} enums, ${relations} relações. Modelagem de dados estruturada.`,
        stack_detectada: ['Prisma', 'ORM', 'Database', 'Schema Design'],
        nivel_complexidade: models > 10 ? 'alto' : models > 3 ? 'medio' : 'baixo',
        projeto: projectName,
      });
    }
  }

  // ─── Test Files Analysis ─────────────────────────────────────────

  private collectFromTestFiles(dir: string, projectName: string): void {
    const testFiles = walkDir(dir, {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.php', '.py'],
      maxDepth: 4,
    }).filter(f => /\.(test|spec)\./i.test(basename(f)) || /\/__tests__\//i.test(f));

    if (testFiles.length === 0) return;

    const stack: string[] = ['Testes Automatizados'];
    const testTypes: string[] = [];

    for (const file of testFiles.slice(0, 20)) { // Amostrar até 20
      const content = safeReadFile(file);
      if (!content) continue;

      if (/describe\s*\(|it\s*\(|test\s*\(/i.test(content)) testTypes.push('unit');
      if (/render\s*\(|screen\./i.test(content)) testTypes.push('component');
      if (/request\s*\(|supertest/i.test(content)) testTypes.push('integration');
      if (/cy\.|page\./i.test(content)) testTypes.push('e2e');
      if (/mock|jest\.fn|vi\.fn/i.test(content)) testTypes.push('mocking');
    }

    const uniqueTypes = [...new Set(testTypes)];

    this.addEvidence({
      fonte: dir,
      tipo: 'test',
      descricao: `${testFiles.length} arquivos de teste encontrados. Tipos: ${uniqueTypes.join(', ') || 'não classificados'}.`,
      stack_detectada: stack,
      nivel_complexidade: testFiles.length > 20 ? 'alto' : testFiles.length > 5 ? 'medio' : 'baixo',
      projeto: projectName,
    });
  }

  // ─── GitHub API ──────────────────────────────────────────────────

  private async collectFromGitHub(): Promise<void> {
    if (!this.config.github_token || !this.config.github_username) return;

    log.step('Coletando dados do GitHub API...');

    try {
      // Coletar todos os repos com paginação
      const allRepos: GitHubRepo[] = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const repos = await this.githubRequest<GitHubRepo[]>(
          `/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner,collaborator`
        );

        if (!repos || !Array.isArray(repos) || repos.length === 0) break;
        allRepos.push(...repos);

        if (repos.length < perPage) break;
        page++;

        // Rate-limit: aguardar 100ms entre páginas
        await new Promise(r => setTimeout(r, 100));
      }

      log.info(`${allRepos.length} repositórios encontrados no GitHub.`);

      for (const repo of allRepos) {
        const stack: string[] = [];
        if (repo.language) stack.push(repo.language);
        if (repo.topics) stack.push(...repo.topics);

        // Obter linguagens do repo (com rate-limit guard)
        try {
          const languages = await this.githubRequest<Record<string, number>>(
            `/repos/${repo.full_name}/languages`
          );
          if (languages && typeof languages === 'object' && !('message' in languages)) {
            stack.push(...Object.keys(languages));
          }
          // Rate-limit: 50ms entre chamadas de linguagens
          await new Promise(r => setTimeout(r, 50));
        } catch {
          // Skip — rate limit ou repo sem acesso
        }

        // Determinar complexidade baseada em tamanho e atividade
        const complexity: ComplexityLevel =
          repo.size > 50000 || (repo.stargazers_count > 10 && repo.forks_count > 5)
            ? 'alto'
            : repo.size > 5000 || repo.stargazers_count > 0
              ? 'medio'
              : 'baixo';

        // Descrição rica
        const parts: string[] = [
          `Repositório GitHub "${repo.name}"`,
          repo.description ? `: ${repo.description}` : '',
          `. ${repo.stargazers_count} stars, ${repo.forks_count} forks`,
          `. ${repo.private ? 'Privado' : 'Público'}`,
          repo.fork ? '. Fork de outro repo.' : '',
          repo.archived ? '. Arquivado.' : '',
          repo.license?.spdx_id ? `. Licença: ${repo.license.spdx_id}` : '',
        ];

        this.addEvidence({
          fonte: repo.html_url,
          tipo: 'github-api',
          descricao: parts.join(''),
          stack_detectada: [...new Set(stack)],
          nivel_complexidade: complexity,
          projeto: repo.name,
        });
      }

      log.ok(`${allRepos.length} repositórios coletados do GitHub.`);
    } catch (err) {
      const errStr = String(err);
      if (errStr.includes('rate limit') || errStr.includes('403')) {
        log.warn('GitHub API rate limit atingido. Dados parciais coletados.');
      } else {
        log.warn(`Falha ao acessar GitHub API: ${errStr}`);
      }
    }
  }

  private async githubRequest<T>(path: string): Promise<T> {
    const { default: https } = await import('node:https');

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path,
        headers: {
          'User-Agent': 'SelfKnowledgeEngine/2.0',
          Authorization: `Bearer ${this.config.github_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      };

      https.get(options, (res) => {
        // Handle rate limiting
        const remaining = res.headers['x-ratelimit-remaining'];
        if (remaining && parseInt(remaining as string, 10) < 10) {
          log.warn(`GitHub API rate limit baixo: ${remaining} requests restantes`);
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 403 || res.statusCode === 429) {
            reject(new Error(`GitHub API rate limit exceeded (${res.statusCode})`));
            return;
          }
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`GitHub API error ${res.statusCode}: ${data.slice(0, 200)}`));
            return;
          }
          try {
            resolve(JSON.parse(data) as T);
          } catch {
            reject(new Error(`GitHub API parse error: ${data.slice(0, 200)}`));
          }
        });
      }).on('error', reject);
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  private addEvidence(partial: Omit<Evidence, 'id' | 'coletado_em'>): void {
    const evidence: Evidence = {
      ...partial,
      id: generateEvidenceId(partial.fonte, partial.tipo, partial.descricao),
      coletado_em: now(),
    };
    this.evidences.push(evidence);
  }

  private assessDependencyComplexity(count: number): ComplexityLevel {
    if (count > 30) return 'alto';
    if (count > 10) return 'medio';
    return 'baixo';
  }
}

// ─── GitHub Types ────────────────────────────────────────────────────

interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  size: number;
  private: boolean;
  fork: boolean;
  archived: boolean;
  license: { spdx_id: string } | null;
}

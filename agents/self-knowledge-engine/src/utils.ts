/**
 * SelfKnowledgeEngine — Utilitários compartilhados
 */

import { createHash } from 'node:crypto';
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, basename, extname } from 'node:path';
import type { SKEConfig } from './types.js';

/**
 * Gera um hash determinístico para identificar evidências únicas.
 */
export function generateEvidenceId(fonte: string, tipo: string, descricao: string): string {
  const content = `${fonte}|${tipo}|${descricao}`;
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

/**
 * Lê um arquivo de texto com fallback seguro.
 */
export function safeReadFile(filePath: string): string | null {
  try {
    if (!existsSync(filePath)) return null;
    return readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Lê e parseia JSON com fallback.
 */
export function safeReadJson<T>(filePath: string): T | null {
  const raw = safeReadFile(filePath);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Percorre diretórios recursivamente com filtros.
 */
export function walkDir(
  dir: string,
  options: {
    extensions?: string[];
    ignore?: string[];
    maxDepth?: number;
    _currentDepth?: number;
  } = {}
): string[] {
  const {
    extensions = [],
    ignore = ['node_modules', '.git', 'vendor', 'dist', '.next', '__pycache__', '.cache'],
    maxDepth = 10,
    _currentDepth = 0,
  } = options;

  if (_currentDepth > maxDepth) return [];
  if (!existsSync(dir)) return [];

  const results: string[] = [];

  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (ignore.some(pattern => entry === pattern || entry.startsWith('.'))) continue;

      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          results.push(
            ...walkDir(fullPath, { extensions, ignore, maxDepth, _currentDepth: _currentDepth + 1 })
          );
        } else if (stat.isFile()) {
          if (extensions.length === 0 || extensions.includes(extname(entry))) {
            results.push(fullPath);
          }
        }
      } catch {
        // Skip inaccessible files
      }
    }
  } catch {
    // Skip inaccessible directories
  }

  return results;
}

/**
 * Detecta se um diretório é raiz de um projeto.
 */
export function isProjectRoot(dir: string): boolean {
  const markers = [
    'package.json',
    'composer.json',
    'Cargo.toml',
    'go.mod',
    'requirements.txt',
    'Pipfile',
    'pyproject.toml',
    'pom.xml',
    'build.gradle',
    'Makefile',
    '.git',
  ];
  return markers.some(marker => existsSync(join(dir, marker)));
}

/**
 * Extrai nome do projeto a partir do diretório.
 */
export function getProjectName(dir: string): string {
  // Tenta ler de package.json ou composer.json
  const pkg = safeReadJson<{ name?: string }>(join(dir, 'package.json'));
  if (pkg?.name) return pkg.name;

  const composer = safeReadJson<{ name?: string }>(join(dir, 'composer.json'));
  if (composer?.name) return composer.name;

  return basename(resolve(dir));
}

/**
 * Salva dados JSON em disco, criando diretórios se necessário.
 */
export function persistJson(filePath: string, data: unknown): void {
  const dir = join(filePath, '..');
  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Carrega a configuração do agente.
 */
export function loadConfig(configPath?: string): SKEConfig {
  const defaultConfig: SKEConfig = {
    scan_paths: [process.cwd()],
    output_dir: join(process.cwd(), '.context', 'self-knowledge'),
    file_extensions: [
      '.ts', '.tsx', '.js', '.jsx', '.json',
      '.php', '.py', '.go', '.rs', '.java',
      '.yml', '.yaml', '.toml', '.xml',
      '.sql', '.sh', '.bash',
      '.md', '.txt',
      '.dockerfile', '.env.example',
    ],
    ignore_patterns: [
      'node_modules', '.git', 'vendor', 'dist', '.next',
      '__pycache__', '.cache', 'coverage', '.nyc_output',
      'build', 'tmp', 'temp', 'venv', '.venv', 'env',
      'Downloads', 'google-cloud-sdk', '.local', '.npm',
      '.nvm', '.yarn', '.pnpm', 'backups_copilot', 'backups',
      '.docker', '.kube', '.terraform', '.gradle', '.m2',
      '.cargo', 'target', 'bin', '.rustup',
    ],
    max_depth: 4,
  };

  if (configPath) {
    const userConfig = safeReadJson<Partial<SKEConfig>>(configPath);
    if (userConfig) {
      return { ...defaultConfig, ...userConfig };
    }
  }

  // Tenta carregar de locais padrão
  const candidates = [
    join(process.cwd(), '.context', 'self-knowledge', 'config.json'),
    join(process.cwd(), 'ske.config.json'),
  ];

  for (const candidate of candidates) {
    const userConfig = safeReadJson<Partial<SKEConfig>>(candidate);
    if (userConfig) {
      return { ...defaultConfig, ...userConfig };
    }
  }

  return defaultConfig;
}

/**
 * Resolve configuração de GitHub a partir de env vars.
 * Prioridade: config explícito > env var > undefined
 */
export function resolveGitHubConfig(config: SKEConfig): SKEConfig {
  if (!config.github_token) {
    config.github_token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined;
  }
  if (!config.github_username) {
    config.github_username = process.env.GITHUB_USERNAME || process.env.GH_USER || undefined;
  }
  return config;
}

/**
 * Timestamp ISO atual.
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Logger simples com prefixo.
 */
export const log = {
  info: (msg: string) => console.log(`[SKE] ℹ  ${msg}`),
  ok: (msg: string) => console.log(`[SKE] ✅ ${msg}`),
  warn: (msg: string) => console.warn(`[SKE] ⚠️  ${msg}`),
  error: (msg: string) => console.error(`[SKE] ❌ ${msg}`),
  step: (msg: string) => console.log(`[SKE] 🔹 ${msg}`),
  section: (msg: string) => console.log(`\n${'═'.repeat(60)}\n  ${msg}\n${'═'.repeat(60)}`),
};

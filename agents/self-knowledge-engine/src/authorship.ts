/**
 * SelfKnowledgeEngine — Authorship Verification & Weight System (v2.1)
 *
 * Responsável por:
 * - Determinar se evidências são autorais ou de framework
 * - Calcular peso_base por tipo de evidência
 * - Calcular peso_final com ajustes de autoria/framework
 * - Detectar projetos de terceiros (forks, clones, frameworks)
 */

import { execSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Evidence, EvidenceOrigin } from './types.js';
import { log } from './utils.js';

// ─── Weight Configuration ────────────────────────────────────────────

/** Peso base por tipo de evidência */
const WEIGHT_BY_TYPE: Record<string, number> = {
  commit:     1.0,
  test:       1.0,
  arquivo:    0.9,
  migration:  0.9,
  ci:         0.8,
  docker:     0.7,
  config:     0.3,
  readme:     0.2,
  'github-api': 0.2,
};

/** Diretórios que indicam código de terceiros (não autoral) */
const FRAMEWORK_PATHS = [
  'node_modules',
  'vendor',
  'dist',
  'build',
  '.next',
  '__pycache__',
  '.cache',
  'coverage',
  '.nyc_output',
];

/** Projetos conhecidos que são forks/clones de frameworks */
const KNOWN_THIRD_PARTY = [
  'laravel/laravel',
  'audiocraft',
  'apigee/devportal-kickstart-project',
];

// ─── Main Authorship Processor ───────────────────────────────────────

export class AuthorshipVerifier {
  private username: string;
  private gitAuthors: Map<string, string[]> = new Map(); // dir → [authors]

  constructor(username?: string) {
    // Resolve username: config > env > git config > fallback
    this.username = username
      || process.env.GITHUB_USERNAME
      || process.env.GH_USER
      || this.getGitConfigUser()
      || '';
  }

  /**
   * Processa um array de evidências, adicionando campos de autoria e peso.
   * NÃO muta o array original — retorna cópias.
   */
  processEvidences(evidences: Evidence[]): Evidence[] {
    log.section('VERIFICAÇÃO DE AUTORIA');
    log.step(`Username configurado: "${this.username || '(não configurado)'}"`);

    const processed = evidences.map(ev => this.processOne(ev));

    // Estatísticas
    const autorais = processed.filter(e => e.autoria_verificada).length;
    const framework = processed.filter(e => e.framework_generated).length;
    const total = processed.length;

    log.ok(`Autoria verificada: ${autorais}/${total} (${((autorais / total) * 100).toFixed(1)}%)`);
    log.ok(`Framework/terceiro: ${framework}/${total} (${((framework / total) * 100).toFixed(1)}%)`);
    log.ok(`Peso total: ${processed.reduce((s, e) => s + (e.peso_final || 0), 0).toFixed(1)}`);

    return processed;
  }

  /**
   * Processa uma única evidência.
   */
  private processOne(ev: Evidence): Evidence {
    const result = { ...ev };

    // 1. Determinar origem
    result.origem = this.detectOrigin(ev);

    // 2. Determinar ownership
    result.repo_owner = this.detectRepoOwner(ev);

    // 3. Verificar autoria de commit
    result.commit_author = this.detectCommitAuthor(ev);

    // 4. Verificar se é framework-generated
    result.framework_generated = this.isFrameworkGenerated(ev);

    // 5. Verificar autoria
    result.autoria_verificada = this.isAuthorshipVerified(ev, result);

    // 6. Calcular peso_base
    result.peso_base = WEIGHT_BY_TYPE[ev.tipo] ?? 0.2;

    // 7. Calcular peso_final
    result.peso_final = this.calculateFinalWeight(result);

    return result;
  }

  // ─── Detection Methods ──────────────────────────────────────────

  private detectOrigin(ev: Evidence): EvidenceOrigin {
    if (ev.tipo === 'github-api') return 'github';
    if (ev.fonte.startsWith('http')) return 'github';
    return 'local';
  }

  private detectRepoOwner(ev: Evidence): string | null {
    // GitHub API evidence: parse da URL
    if (ev.fonte.startsWith('https://github.com/')) {
      const match = ev.fonte.match(/github\.com\/([^/]+)/);
      return match?.[1] || null;
    }

    // Local: tentar ler git remote
    const dir = this.getProjectDir(ev);
    if (!dir) return null;

    try {
      const remote = execSync('git remote get-url origin 2>/dev/null', {
        cwd: dir,
        encoding: 'utf-8',
        timeout: 5000,
      }).trim();

      const match = remote.match(/github\.com[:/]([^/]+)/);
      return match?.[1] || null;
    } catch {
      return null;
    }
  }

  private detectCommitAuthor(ev: Evidence): string | null {
    if (ev.tipo !== 'commit') return null;

    const dir = this.getProjectDir(ev);
    if (!dir || !existsSync(join(dir, '.git'))) return null;

    // Cache de autores
    if (this.gitAuthors.has(dir)) {
      const authors = this.gitAuthors.get(dir)!;
      return authors[0] || null;
    }

    try {
      const authorOutput = execSync(
        'git log --format="%an|%ae" -20 2>/dev/null | sort | uniq -c | sort -rn | head -5',
        { cwd: dir, encoding: 'utf-8', timeout: 5000 }
      ).trim();

      const authors = authorOutput
        .split('\n')
        .map(l => l.trim().replace(/^\d+\s+/, ''))
        .filter(Boolean);

      this.gitAuthors.set(dir, authors);
      return authors[0] || null;
    } catch {
      return null;
    }
  }

  private isFrameworkGenerated(ev: Evidence): boolean {
    const fonte = ev.fonte.toLowerCase();

    // 1. Arquivo em diretório de terceiros
    if (FRAMEWORK_PATHS.some(p => fonte.includes(`/${p}/`) || fonte.includes(`\\${p}\\`))) {
      return true;
    }

    // 2. Projeto conhecido como terceiro/fork
    const projeto = ev.projeto?.toLowerCase() || '';
    if (KNOWN_THIRD_PARTY.some(tp => projeto === tp.toLowerCase())) {
      return true;
    }

    // 3. README/config sem commit autoral → possivelmente framework-gerado
    if ((ev.tipo === 'readme' || ev.tipo === 'config') && !this.hasAuthoralCommit(ev)) {
      // Verificamos se o projeto TEM git history do usuário
      const dir = this.getProjectDir(ev);
      if (dir && existsSync(join(dir, '.git'))) {
        const isOwner = this.isUserTheMainAuthor(dir);
        if (!isOwner) return true;
      }
      // Se não tem .git, não podemos verificar — não marcamos como framework
    }

    return false;
  }

  private isAuthorshipVerified(ev: Evidence, processed: Partial<Evidence>): boolean {
    // Commit: verificar se o autor corresponde ao username
    if (ev.tipo === 'commit' && processed.commit_author) {
      const author = processed.commit_author.toLowerCase();
      const user = this.username.toLowerCase();
      if (!user) return false;

      // Comparar nome/email do commit com username configurado
      return author.includes(user) || user.includes(author.split('|')[0]);
    }

    // Para outros tipos: verificar se o projeto tem histórico git do usuário
    const dir = this.getProjectDir(ev);
    if (!dir) return false;

    if (existsSync(join(dir, '.git'))) {
      return this.isUserTheMainAuthor(dir);
    }

    return false;
  }

  private calculateFinalWeight(ev: Evidence): number {
    const pesoBase = ev.peso_base ?? 0.2;

    // Framework generated → peso zero
    if (ev.framework_generated) return 0;

    // Autoria verificada → peso base integral
    if (ev.autoria_verificada) return pesoBase;

    // Sem verificação de autoria → peso base * 0.3
    return pesoBase * 0.3;
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  private getProjectDir(ev: Evidence): string | null {
    const fonte = ev.fonte;

    // URL → sem diretório local
    if (fonte.startsWith('http')) return null;

    // Se for arquivo, pegar diretório
    if (existsSync(fonte)) {
      try {
        const stat = statSync(fonte);
        return stat.isDirectory() ? fonte : join(fonte, '..');
      } catch {
        return join(fonte, '..');
      }
    }

    return join(fonte, '..');
  }

  private hasAuthoralCommit(ev: Evidence): boolean {
    const dir = this.getProjectDir(ev);
    if (!dir || !existsSync(join(dir, '.git'))) return false;
    return this.isUserTheMainAuthor(dir);
  }

  private isUserTheMainAuthor(dir: string): boolean {
    if (!this.username) return false;

    // Cache
    const cacheKey = `__isOwner__${dir}`;
    if (this.gitAuthors.has(cacheKey)) {
      return this.gitAuthors.get(cacheKey)![0] === 'true';
    }

    try {
      const authorOutput = execSync(
        'git log --format="%an|%ae" -50 2>/dev/null',
        { cwd: dir, encoding: 'utf-8', timeout: 5000 }
      ).trim();

      const lines = authorOutput.split('\n').filter(Boolean);
      if (lines.length === 0) {
        this.gitAuthors.set(cacheKey, ['false']);
        return false;
      }

      const userLower = this.username.toLowerCase();
      const userCommits = lines.filter(l => l.toLowerCase().includes(userLower)).length;
      const ratio = userCommits / lines.length;

      // Considerar autoral se >= 30% dos commits são do usuário
      const isOwner = ratio >= 0.3;
      this.gitAuthors.set(cacheKey, [isOwner ? 'true' : 'false']);
      return isOwner;
    } catch {
      this.gitAuthors.set(cacheKey, ['false']);
      return false;
    }
  }

  private getGitConfigUser(): string {
    try {
      return execSync('git config user.name 2>/dev/null', {
        encoding: 'utf-8',
        timeout: 3000,
      }).trim();
    } catch {
      return '';
    }
  }
}

/**
 * Aplica pesos a evidências sem processar autoria (modo offline/unit test).
 * Útil quando não há acesso a git.
 */
export function applyWeightsOnly(evidences: Evidence[]): Evidence[] {
  return evidences.map(ev => {
    const peso_base = WEIGHT_BY_TYPE[ev.tipo] ?? 0.2;
    const framework_generated = ev.framework_generated ?? false;
    const autoria_verificada = ev.autoria_verificada ?? false;

    let peso_final: number;
    if (framework_generated) {
      peso_final = 0;
    } else if (autoria_verificada) {
      peso_final = peso_base;
    } else {
      peso_final = peso_base * 0.3;
    }

    return {
      ...ev,
      peso_base,
      peso_final,
    };
  });
}

export { WEIGHT_BY_TYPE, FRAMEWORK_PATHS, KNOWN_THIRD_PARTY };

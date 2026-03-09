/**
 * SelfKnowledgeEngine — Identity Resolution Engine
 *
 * Consolida as identidades DO USUÁRIO antes da análise de commits.
 *
 * Arquitetura em 3 fases:
 *
 *   Fase A — Seed Identity:
 *     Construir lista base a partir de: git config, github username/profile, tokens, env.
 *     Define o "universo provável do usuário".
 *
 *   Fase B — Expand Identity (filtro de relevância):
 *     Ao coletar autores via git log, incluir APENAS aqueles que tenham:
 *       - similaridade >= 0.80 com nome seed
 *       OU email contendo username seed
 *       OU email igual ao seed
 *     Autores externos são IGNORADOS completamente.
 *
 *   Fase C — Consolidar Clusters:
 *     Clusterizar apenas dentro do universo filtrado.
 *     Resultado esperado: 2-5 clusters reais (não 948).
 *
 * O sistema NÃO clusteriza todo mundo do git log.
 * Ele resolve identidades DO USUÁRIO.
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import type {
  IdentityProfile,
  IdentityCluster,
  PrimaryIdentity,
  NormalizedIdentity,
  IdentitySource,
  IdentityResolutionConfig,
} from './types.js';
import { log, now } from './utils.js';

// ─── Raw Identity Entry ─────────────────────────────────────────────

interface RawIdentity {
  nome: string;
  email: string;
  source: IdentitySource;
}

// ─── Normalização ───────────────────────────────────────────────────

/**
 * Normaliza uma string de identidade (nome ou email) para comparação.
 *
 * Regras:
 * - Lowercase
 * - Trim
 * - Remover pontos em nomes (não em emails)
 * - Remover caracteres especiais (exceto @, ., -, _)
 * - Gerar fingerprint hash
 */
export function normalizeIdentity(value: string, tipo: 'nome' | 'email'): NormalizedIdentity {
  const trimmed = value.trim();

  let normalized = trimmed.toLowerCase();

  if (tipo === 'nome') {
    // Remover pontos em nomes
    normalized = normalized.replace(/\./g, '');
    // Remover caracteres especiais exceto espaço, -, _
    normalized = normalized.replace(/[^a-z0-9\s\-_]/g, '');
  } else {
    // Email: remover caracteres especiais exceto @, ., -, _, +
    normalized = normalized.replace(/[^a-z0-9@.\-_+]/g, '');
  }

  // Colapsar espaços múltiplos
  normalized = normalized.replace(/\s+/g, ' ').trim();

  const fingerprint = createHash('sha256').update(normalized).digest('hex').slice(0, 12);

  return {
    original: trimmed,
    normalized,
    fingerprint,
    tipo,
  };
}

// ─── Similaridade de Strings ────────────────────────────────────────

/**
 * Calcula similaridade entre duas strings usando distância de Levenshtein normalizada.
 * Retorna valor entre 0.0 (totalmente diferente) e 1.0 (idênticas).
 */
export function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;

  const maxLen = Math.max(a.length, b.length);
  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLen;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
}

// ─── Identity Resolution Engine ─────────────────────────────────────

export class IdentityResolver {
  private config: IdentityResolutionConfig;
  /** Identidades seed (Fase A): git config + github + env */
  private seedIdentities: RawIdentity[] = [];
  /** Identidades expandidas (Fase B): seed + autores filtrados do git log */
  private expandedIdentities: RawIdentity[] = [];
  /** Contadores para auditoria */
  private totalAuthorsScanned = 0;
  private totalAuthorsFiltered = 0;

  /** Limiar de similaridade para considerar um autor como provável identidade do user */
  static readonly SIMILARITY_THRESHOLD = 0.80;

  constructor(config: IdentityResolutionConfig) {
    this.config = config;
  }

  /**
   * Executa resolução completa de identidades em 3 fases.
   * Retorna o IdentityProfile consolidado.
   */
  async resolve(): Promise<IdentityProfile> {
    log.section('IDENTITY RESOLUTION ENGINE');

    // ═══ Fase A — Seed Identity ═══
    log.step('Fase A: Construindo seed identity...');
    this.buildSeedIdentities();
    await this.collectSeedFromGitHub();
    log.ok(`Seed identities: ${this.seedIdentities.length} entradas de fontes confiáveis`);
    this.logSeedSummary();

    // ═══ Fase B — Expand Identity (filtered git log) ═══
    log.step('Fase B: Expandindo identidades via git log (com filtro)...');
    this.expandFromCommitHistory();
    log.ok(`Autores escaneados: ${this.totalAuthorsScanned} | Filtrados (relevantes): ${this.totalAuthorsFiltered}`);
    const ignored = this.totalAuthorsScanned - this.totalAuthorsFiltered;
    if (ignored > 0) {
      log.info(`${ignored} autor(es) externo(s) ignorado(s) (sem relação com seed).`);
    }

    // Mesclar seed + expanded
    const allIdentities = [...this.seedIdentities, ...this.expandedIdentities];

    // ═══ Fase C — Consolidar Clusters ═══
    log.step('Fase C: Clusterizando identidades filtradas...');
    const deduplicated = this.deduplicateRaw(allIdentities);
    log.step(`Após deduplicação: ${deduplicated.length} entradas únicas`);

    const clusters = this.clusterIdentities(deduplicated);
    log.ok(`Clusters formados: ${clusters.length}`);

    // Selecionar identidade primária
    const primary = this.selectPrimaryIdentity(clusters, deduplicated);

    // Montar perfil
    const profile: IdentityProfile = {
      versao: '2.0.0',
      gerado_em: now(),
      primary_identity: primary,
      aliases: clusters,
      total_clusters: clusters.length,
      total_authors_scanned: this.totalAuthorsScanned,
      total_authors_filtered: this.totalAuthorsFiltered,
    };

    return profile;
  }

  // ─── Fase A: Seed Identity ───────────────────────────────────────

  /**
   * Constrói a lista base de identidades a partir de fontes confiáveis:
   * git config, github_user, env vars.
   * Estas identidades definem o "universo provável do usuário".
   */
  buildSeedIdentities(): void {
    // 1. Git config
    const name = this.execGit('git config user.name 2>/dev/null');
    const email = this.execGit('git config user.email 2>/dev/null');

    if (name || email) {
      this.seedIdentities.push({
        nome: name || '',
        email: email || '',
        source: 'git-config',
      });
      log.info(`  Git config: nome="${name}", email="${email}"`);
    } else {
      log.warn('  Git config: nenhum user.name ou user.email configurado');
    }

    // 2. GitHub username (do config ou env)
    const githubUser = this.config.github_user;
    if (githubUser) {
      this.seedIdentities.push({
        nome: githubUser,
        email: '',
        source: 'github-api',
      });

      // GitHub noreply email
      const noreplyEmail = `${githubUser}@users.noreply.github.com`;
      this.seedIdentities.push({
        nome: githubUser,
        email: noreplyEmail,
        source: 'github-api',
      });
      log.info(`  GitHub user: "${githubUser}" (+ noreply email)`);
    }
  }

  /**
   * Coleta seed de GitHub API (perfil + emails autenticados).
   */
  private async collectSeedFromGitHub(): Promise<void> {
    const { github_user, github_token } = this.config;
    if (!github_user) return;

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'SelfKnowledgeEngine/2.0',
      };
      if (github_token) {
        headers['Authorization'] = `Bearer ${github_token}`;
      }

      const profileRes = await fetch(`https://api.github.com/users/${github_user}`, { headers });

      if (!profileRes.ok) {
        log.warn(`  GitHub API: falha ao buscar perfil (${profileRes.status})`);
        return;
      }

      const profileData = await profileRes.json() as {
        name?: string;
        email?: string;
        login?: string;
      };

      if (profileData.name) {
        this.seedIdentities.push({
          nome: profileData.name,
          email: profileData.email || '',
          source: 'github-api',
        });
      }

      if (profileData.email) {
        this.seedIdentities.push({
          nome: profileData.name || github_user,
          email: profileData.email,
          source: 'github-api',
        });
      }

      if (profileData.login && profileData.login !== github_user) {
        this.seedIdentities.push({
          nome: profileData.login,
          email: '',
          source: 'github-api',
        });
      }

      // Buscar emails autenticados (se token disponível)
      if (github_token) {
        const emailsRes = await fetch('https://api.github.com/user/emails', { headers });

        if (emailsRes.ok) {
          const emails = await emailsRes.json() as Array<{
            email: string;
            primary: boolean;
            verified: boolean;
          }>;

          for (const entry of emails) {
            if (entry.email) {
              this.seedIdentities.push({
                nome: profileData.name || github_user,
                email: entry.email,
                source: 'github-api',
              });
            }
          }

          log.info(`  GitHub API: ${emails.length} email(s) encontrado(s)`);
        }
      }

      log.info(`  GitHub API: perfil de "${github_user}" coletado`);
    } catch (err) {
      log.warn(`  GitHub API: erro na coleta — ${err}`);
    }
  }

  private logSeedSummary(): void {
    const names = new Set(this.seedIdentities.map(s => s.nome).filter(Boolean));
    const emails = new Set(this.seedIdentities.map(s => s.email).filter(Boolean));
    log.info(`  Seed: ${names.size} nome(s) únicos, ${emails.size} email(s) únicos`);
  }

  // ─── Fase B: Expand Identity (filtered git log) ──────────────────

  /**
   * Varre o git log dos projetos e aplica filtro de relevância.
   * APENAS autores com similaridade ao seed são incluídos.
   * Autores externos são completamente ignorados.
   */
  private expandFromCommitHistory(): void {
    const paths = this.getProjectPaths();
    if (paths.length === 0) {
      log.warn('  Nenhum caminho de projeto disponível para varrer git log.');
      return;
    }

    // Preparar seed para matching
    const seedNamesNorm = this.seedIdentities
      .map(s => normalizeIdentity(s.nome, 'nome').normalized)
      .filter(n => n.length > 0);
    const seedEmails = new Set(
      this.seedIdentities
        .map(s => s.email.toLowerCase().trim())
        .filter(e => e.length > 0)
    );
    const githubUser = this.config.github_user?.toLowerCase() || '';

    for (const dir of paths) {
      if (!existsSync(join(dir, '.git'))) continue;

      try {
        const output = execSync(
          'git log --format="%an|%ae" --all 2>/dev/null | sort -u',
          { cwd: dir, encoding: 'utf-8', timeout: 15000 },
        ).trim();

        if (!output) continue;

        for (const line of output.split('\n')) {
          const [name, email] = line.split('|');
          if (!name && !email) continue;

          this.totalAuthorsScanned++;

          // ── Filtro de Relevância ──
          if (this.isRelevantAuthor(name || '', email || '', seedNamesNorm, seedEmails, githubUser)) {
            this.expandedIdentities.push({
              nome: name || '',
              email: email || '',
              source: 'commit-history',
            });
            this.totalAuthorsFiltered++;
          }
          // Autores que não passam no filtro são IGNORADOS completamente
        }
      } catch {
        // Falha silenciosa — projeto pode não ter commits
      }
    }

    log.info(`  Git log varrido: ${paths.length} projeto(s)`);
  }

  /**
   * Verifica se um autor do git log é relevante (provável identidade do usuário).
   *
   * Regras de inclusão (qualquer uma satisfeita = relevante):
   * 1. Email é idêntico a um seed email
   * 2. Email contém o github_user como substring
   * 3. Nome normalizado tem similaridade >= 0.80 com algum nome seed
   * 4. Nome contém github_user como substring (ou vice-versa)
   */
  isRelevantAuthor(
    name: string,
    email: string,
    seedNamesNorm: string[],
    seedEmails: Set<string>,
    githubUser: string,
  ): boolean {
    const emailLower = email.toLowerCase().trim();
    const nameNorm = normalizeIdentity(name, 'nome').normalized;

    // Regra 1: email idêntico ao seed
    if (emailLower && seedEmails.has(emailLower)) {
      return true;
    }

    // Regra 2: email contém github_user
    if (emailLower && githubUser && emailLower.includes(githubUser)) {
      return true;
    }

    // Regra 3: nome com similaridade >= threshold com algum nome seed
    if (nameNorm) {
      for (const seedName of seedNamesNorm) {
        if (!seedName) continue;
        const sim = stringSimilarity(nameNorm, seedName);
        if (sim >= IdentityResolver.SIMILARITY_THRESHOLD) {
          return true;
        }
      }
    }

    // Regra 4: nome contém github_user ou vice-versa
    if (nameNorm && githubUser) {
      const nameNoSpaces = nameNorm.replace(/\s/g, '');
      if (nameNoSpaces.includes(githubUser) || githubUser.includes(nameNoSpaces)) {
        return true;
      }
    }

    return false;
  }

  // ─── Fase C: Clusterização + Seleção ──────────────────────────────

  /**
   * Retorna lista consolidada de emails e nomes para validação de autoria.
   * Usa apenas o primary_identity (que já contém os dados do cluster principal).
   * NÃO itera todos os aliases — esses incluem autores de terceiros.
   */
  static getConsolidatedIdentifiers(profile: IdentityProfile): {
    emails: string[];
    nomes: string[];
    usernames: string[];
  } {
    const emails = new Set<string>(profile.primary_identity.emails.map(e => e.toLowerCase()));
    const nomes = new Set<string>([profile.primary_identity.nome_canonico.toLowerCase()]);
    const usernames = new Set<string>(profile.primary_identity.usernames.map(u => u.toLowerCase()));

    // Adicionar nomes dos usernames como nomes também
    for (const u of profile.primary_identity.usernames) {
      nomes.add(u.toLowerCase());
    }

    return {
      emails: Array.from(emails),
      nomes: Array.from(nomes),
      usernames: Array.from(usernames),
    };
  }

  // ─── Deduplicação ────────────────────────────────────────────────

  private deduplicateRaw(identities: RawIdentity[]): RawIdentity[] {
    const seen = new Map<string, RawIdentity>();

    for (const identity of identities) {
      const nNome = normalizeIdentity(identity.nome, 'nome');
      const nEmail = normalizeIdentity(identity.email, 'email');
      const key = `${nNome.fingerprint}::${nEmail.fingerprint}`;

      if (!seen.has(key)) {
        seen.set(key, identity);
      } else {
        // Mesclar sources — manter o original mas lembrar que veio de múltiplas fontes
        const existing = seen.get(key)!;
        // Preferir a versão com mais dados (nome + email)
        if (identity.nome && identity.email && (!existing.nome || !existing.email)) {
          seen.set(key, identity);
        }
      }
    }

    return Array.from(seen.values());
  }

  // ─── Clusterização ───────────────────────────────────────────────

  /**
   * Agrupa identidades em clusters usando 3 regras:
   * 1. Emails iguais → mesmo cluster
   * 2. Nome similar > 0.85 → mesmo cluster
   * 3. Username bate com parte do email → mesmo cluster
   */
  clusterIdentities(identities: RawIdentity[]): IdentityCluster[] {
    // Union-Find para agrupar
    const parent: number[] = identities.map((_, i) => i);

    function find(i: number): number {
      while (parent[i] !== i) {
        parent[i] = parent[parent[i]]; // path compression
        i = parent[i];
      }
      return i;
    }

    function union(a: number, b: number): void {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent[ra] = rb;
    }

    // Regra 1: Emails iguais
    const emailIndex = new Map<string, number[]>();
    for (let i = 0; i < identities.length; i++) {
      const email = identities[i].email.toLowerCase().trim();
      if (!email) continue;
      if (!emailIndex.has(email)) emailIndex.set(email, []);
      emailIndex.get(email)!.push(i);
    }
    for (const indices of emailIndex.values()) {
      for (let j = 1; j < indices.length; j++) {
        union(indices[0], indices[j]);
      }
    }

    // Regra 2: Nomes similares > 0.85
    for (let i = 0; i < identities.length; i++) {
      const nomeI = normalizeIdentity(identities[i].nome, 'nome').normalized;
      if (!nomeI) continue;

      for (let j = i + 1; j < identities.length; j++) {
        const nomeJ = normalizeIdentity(identities[j].nome, 'nome').normalized;
        if (!nomeJ) continue;

        if (stringSimilarity(nomeI, nomeJ) > 0.85) {
          union(i, j);
        }
      }
    }

    // Regra 3: Username (github_user) bate com parte do email
    const githubUser = this.config.github_user?.toLowerCase();
    if (githubUser) {
      const userIndices: number[] = [];
      for (let i = 0; i < identities.length; i++) {
        const email = identities[i].email.toLowerCase();
        const nome = normalizeIdentity(identities[i].nome, 'nome').normalized;

        if (
          email.includes(githubUser) ||
          nome.includes(githubUser) ||
          githubUser.includes(nome.replace(/\s/g, ''))
        ) {
          userIndices.push(i);
        }
      }
      for (let j = 1; j < userIndices.length; j++) {
        union(userIndices[0], userIndices[j]);
      }
    }

    // Montar clusters
    const clusterMap = new Map<number, number[]>();
    for (let i = 0; i < identities.length; i++) {
      const root = find(i);
      if (!clusterMap.has(root)) clusterMap.set(root, []);
      clusterMap.get(root)!.push(i);
    }

    const clusters: IdentityCluster[] = [];
    let clusterIndex = 0;

    for (const indices of clusterMap.values()) {
      const nomes = new Set<string>();
      const emails = new Set<string>();
      const sources = new Set<IdentitySource>();

      for (const idx of indices) {
        const id = identities[idx];
        if (id.nome) nomes.add(id.nome);
        if (id.email) emails.add(id.email);
        sources.add(id.source);
      }

      // Calcular confiança do cluster
      const confidence = this.calculateClusterConfidence(
        Array.from(nomes),
        Array.from(emails),
        Array.from(sources),
      );

      clusters.push({
        cluster_id: `cluster-${String(clusterIndex++).padStart(3, '0')}`,
        nomes_detectados: Array.from(nomes),
        emails_detectados: Array.from(emails),
        sources: Array.from(sources),
        confidence,
      });
    }

    // Ordenar por confiança decrescente
    clusters.sort((a, b) => b.confidence - a.confidence);

    return clusters;
  }

  // ─── Seleção da Identidade Primária ──────────────────────────────

  private selectPrimaryIdentity(
    clusters: IdentityCluster[],
    deduplicated: RawIdentity[],
  ): PrimaryIdentity {
    // O cluster com maior confiança é o principal
    const primaryCluster = clusters[0];
    if (!primaryCluster) {
      return {
        nome_canonico: this.config.github_user || '',
        emails: [],
        usernames: this.config.github_user ? [this.config.github_user] : [],
      };
    }

    // Nome canônico: preferir git config, depois o mais frequente
    const gitConfigName = this.getGitConfigName();
    let nomeCanonicoFinal: string;

    if (gitConfigName && primaryCluster.nomes_detectados.some(
      n => normalizeIdentity(n, 'nome').normalized === normalizeIdentity(gitConfigName, 'nome').normalized
    )) {
      nomeCanonicoFinal = gitConfigName;
    } else {
      // Mais frequente entre as identidades brutas do cluster primário
      nomeCanonicoFinal = this.getMostFrequentName(deduplicated, primaryCluster);
    }

    // Coletar emails e usernames APENAS do cluster primário (não de terceiros)
    const allEmails = new Set<string>();
    const allUsernames = new Set<string>();

    for (const email of primaryCluster.emails_detectados) {
      if (email) allEmails.add(email);
    }

    // Usernames: github_user + nomes do cluster primário que parecem usernames
    if (this.config.github_user) {
      allUsernames.add(this.config.github_user);
    }
    for (const nome of primaryCluster.nomes_detectados) {
      if (!nome.includes(' ') && nome.length > 2) {
        allUsernames.add(nome);
      }
    }

    return {
      nome_canonico: nomeCanonicoFinal,
      emails: Array.from(allEmails),
      usernames: Array.from(allUsernames),
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  private calculateClusterConfidence(
    nomes: string[],
    emails: string[],
    sources: IdentitySource[],
  ): number {
    let score = 0;

    // Múltiplas fontes = maior confiança
    if (sources.includes('git-config')) score += 30;
    if (sources.includes('github-api')) score += 25;
    if (sources.includes('commit-history')) score += 20;
    if (sources.includes('git-local')) score += 15;

    // Ter nome E email = mais confiável
    if (nomes.length > 0 && emails.length > 0) score += 15;

    // Múltiplos emails convergindo = alta confiança
    if (emails.length >= 2) score += 10;

    return Math.min(score, 100);
  }

  private getProjectPaths(): string[] {
    // Se temos project_paths do discovery, usar esses
    if (this.config.project_paths && this.config.project_paths.length > 0) {
      return this.config.project_paths;
    }

    // Senão, buscar diretórios com .git no root_path (1 nível)
    const rootPath = this.config.root_path;
    if (!existsSync(rootPath)) return [];

    try {
      const output = execSync(
        `find "${rootPath}" -maxdepth 3 -name ".git" -type d 2>/dev/null | head -50`,
        { encoding: 'utf-8', timeout: 15000 },
      ).trim();

      if (!output) return [];

      return output.split('\n')
        .map(gitDir => join(gitDir, '..'))
        .filter(dir => existsSync(dir));
    } catch {
      return [];
    }
  }

  private getGitConfigName(): string {
    return this.execGit('git config user.name 2>/dev/null');
  }

  private getMostFrequentName(identities: RawIdentity[], cluster: IdentityCluster): string {
    const clusterNomes = new Set(cluster.nomes_detectados.map(n => n.toLowerCase()));
    const freq = new Map<string, number>();

    for (const id of identities) {
      if (!id.nome) continue;
      if (clusterNomes.has(id.nome.toLowerCase())) {
        const key = id.nome;
        freq.set(key, (freq.get(key) || 0) + 1);
      }
    }

    let best = cluster.nomes_detectados[0] || '';
    let bestCount = 0;

    for (const [name, count] of freq) {
      if (count > bestCount) {
        best = name;
        bestCount = count;
      }
    }

    return best;
  }

  private execGit(command: string): string {
    try {
      return execSync(command, {
        encoding: 'utf-8',
        timeout: 5000,
      }).trim();
    } catch {
      return '';
    }
  }
}

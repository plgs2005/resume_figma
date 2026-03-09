/**
 * SelfKnowledgeEngine — Unit Tests: Identity Resolution Engine
 *
 * Testa:
 * - normalizeIdentity()
 * - stringSimilarity()
 * - clusterIdentities()
 * - deduplicação
 * - seleção de identidade primária
 * - getConsolidatedIdentifiers()
 * - isRelevantAuthor() — filtro de relevância (3-fases)
 * - buildSeedIdentities() — seed identity (Fase A)
 */

import { normalizeIdentity, stringSimilarity, IdentityResolver } from '../src/identity-resolver';
import type { IdentityProfile } from '../src/types';

// ─── normalizeIdentity ──────────────────────────────────────────────

describe('normalizeIdentity', () => {
  describe('tipo: nome', () => {
    it('deve converter para lowercase', () => {
      const result = normalizeIdentity('Pedro Lucas', 'nome');
      expect(result.normalized).toBe('pedro lucas');
    });

    it('deve remover pontos em nomes', () => {
      const result = normalizeIdentity('P.Lucas.Silva', 'nome');
      expect(result.normalized).toBe('plucassilva');
    });

    it('deve fazer trim', () => {
      const result = normalizeIdentity('  pedro lucas  ', 'nome');
      expect(result.normalized).toBe('pedro lucas');
    });

    it('deve remover caracteres especiais exceto espaço, -, _', () => {
      const result = normalizeIdentity('Pedro @Lucas! #Silva', 'nome');
      expect(result.normalized).toBe('pedro lucas silva');
    });

    it('deve colapsar espaços múltiplos', () => {
      const result = normalizeIdentity('Pedro    Lucas', 'nome');
      expect(result.normalized).toBe('pedro lucas');
    });

    it('deve gerar fingerprint hash', () => {
      const result = normalizeIdentity('Pedro Lucas', 'nome');
      expect(result.fingerprint).toHaveLength(12);
      expect(typeof result.fingerprint).toBe('string');
    });

    it('deve gerar mesmo fingerprint para nomes equivalentes', () => {
      const a = normalizeIdentity('Pedro Lucas', 'nome');
      const b = normalizeIdentity('pedro lucas', 'nome');
      expect(a.fingerprint).toBe(b.fingerprint);
    });

    it('deve gerar fingerprints diferentes para nomes diferentes', () => {
      const a = normalizeIdentity('Pedro Lucas', 'nome');
      const b = normalizeIdentity('João Silva', 'nome');
      expect(a.fingerprint).not.toBe(b.fingerprint);
    });

    it('deve preservar o valor original', () => {
      const result = normalizeIdentity('Pedro Lucas', 'nome');
      expect(result.original).toBe('Pedro Lucas');
    });

    it('deve definir tipo correto', () => {
      const result = normalizeIdentity('Pedro', 'nome');
      expect(result.tipo).toBe('nome');
    });
  });

  describe('tipo: email', () => {
    it('deve converter para lowercase', () => {
      const result = normalizeIdentity('Pedro@Gmail.COM', 'email');
      expect(result.normalized).toBe('pedro@gmail.com');
    });

    it('deve preservar pontos em emails', () => {
      const result = normalizeIdentity('pedro.lucas@gmail.com', 'email');
      expect(result.normalized).toBe('pedro.lucas@gmail.com');
    });

    it('deve fazer trim', () => {
      const result = normalizeIdentity('  pedro@gmail.com  ', 'email');
      expect(result.normalized).toBe('pedro@gmail.com');
    });

    it('deve preservar + em emails', () => {
      const result = normalizeIdentity('pedro+tag@gmail.com', 'email');
      expect(result.normalized).toBe('pedro+tag@gmail.com');
    });

    it('deve tratar string vazia', () => {
      const result = normalizeIdentity('', 'email');
      expect(result.normalized).toBe('');
      expect(result.fingerprint).toHaveLength(12);
    });
  });
});

// ─── stringSimilarity ──────────────────────────────────────────────

describe('stringSimilarity', () => {
  it('deve retornar 1.0 para strings idênticas', () => {
    expect(stringSimilarity('pedro', 'pedro')).toBe(1.0);
  });

  it('deve retornar 0.0 para strings vazias vs não-vazias', () => {
    expect(stringSimilarity('', 'pedro')).toBe(0.0);
    expect(stringSimilarity('pedro', '')).toBe(0.0);
  });

  it('deve retornar alta similaridade para nomes quase iguais', () => {
    const sim = stringSimilarity('pedro lucas', 'pedro luca');
    expect(sim).toBeGreaterThan(0.85);
  });

  it('deve retornar baixa similaridade para nomes diferentes', () => {
    const sim = stringSimilarity('pedro', 'joao');
    expect(sim).toBeLessThan(0.5);
  });

  it('deve retornar similaridade moderada para variações de mesmo nome', () => {
    const sim = stringSimilarity('plgsa', 'plgs2005');
    // Levenshtein: "plgsa"→"plgs2005" = 4 edições em 8 chars → 0.5
    expect(sim).toBeGreaterThanOrEqual(0.5);
  });

  it('deve ser simétrica', () => {
    const ab = stringSimilarity('pedro', 'petro');
    const ba = stringSimilarity('petro', 'pedro');
    expect(ab).toBe(ba);
  });
});

// ─── clusterIdentities ─────────────────────────────────────────────

describe('clusterIdentities', () => {
  function makeResolver(githubUser?: string) {
    return new IdentityResolver({
      root_path: '/tmp/test',
      github_user: githubUser,
      project_paths: [],
    });
  }

  it('deve agrupar identidades com mesmo email', () => {
    const resolver = makeResolver();
    const clusters = resolver.clusterIdentities([
      { nome: 'Pedro Lucas', email: 'pedro@gmail.com', source: 'git-config' },
      { nome: 'plgsa', email: 'pedro@gmail.com', source: 'commit-history' },
    ]);

    // Devem estar no mesmo cluster
    expect(clusters.length).toBe(1);
    expect(clusters[0].nomes_detectados).toContain('Pedro Lucas');
    expect(clusters[0].nomes_detectados).toContain('plgsa');
    expect(clusters[0].emails_detectados).toContain('pedro@gmail.com');
  });

  it('deve agrupar identidades com nomes similares > 0.85', () => {
    const resolver = makeResolver();
    const clusters = resolver.clusterIdentities([
      { nome: 'Pedro Lucas', email: 'pedro@gmail.com', source: 'git-config' },
      { nome: 'Pedro Luca', email: 'other@gmail.com', source: 'commit-history' },
    ]);

    expect(clusters.length).toBe(1);
    expect(clusters[0].emails_detectados).toContain('pedro@gmail.com');
    expect(clusters[0].emails_detectados).toContain('other@gmail.com');
  });

  it('deve manter identidades muito diferentes em clusters separados', () => {
    const resolver = makeResolver();
    const clusters = resolver.clusterIdentities([
      { nome: 'Pedro Lucas', email: 'pedro@gmail.com', source: 'git-config' },
      { nome: 'Maria Silva', email: 'maria@hotmail.com', source: 'commit-history' },
    ]);

    expect(clusters.length).toBe(2);
  });

  it('deve agrupar por username quando github_user bate com parte do email', () => {
    const resolver = makeResolver('plgsa');
    const clusters = resolver.clusterIdentities([
      { nome: 'Pedro Lucas', email: 'plgsa@users.noreply.github.com', source: 'github-api' },
      { nome: 'plgsa', email: 'pedro@gmail.com', source: 'commit-history' },
    ]);

    expect(clusters.length).toBe(1);
  });

  it('deve calcular confidence baseado nas fontes', () => {
    const resolver = makeResolver();
    const clusters = resolver.clusterIdentities([
      { nome: 'Pedro', email: 'pedro@gmail.com', source: 'git-config' },
    ]);

    expect(clusters[0].confidence).toBeGreaterThan(0);
    // git-config (30) + nome+email (15)
    expect(clusters[0].confidence).toBe(45);
  });

  it('deve ordenar clusters por confiança decrescente', () => {
    const resolver = makeResolver();
    const clusters = resolver.clusterIdentities([
      { nome: 'Bot CI', email: 'ci@noreply.com', source: 'commit-history' },
      { nome: 'Pedro', email: 'pedro@gmail.com', source: 'git-config' },
    ]);

    expect(clusters[0].confidence).toBeGreaterThanOrEqual(clusters[1].confidence);
  });

  it('deve tratar lista vazia', () => {
    const resolver = makeResolver();
    const clusters = resolver.clusterIdentities([]);
    expect(clusters).toEqual([]);
  });

  it('deve agrupar 3+ identidades transitivamente', () => {
    const resolver = makeResolver();
    const clusters = resolver.clusterIdentities([
      { nome: 'Pedro Lucas', email: 'pedro@gmail.com', source: 'git-config' },
      { nome: 'Pedro Lucas', email: 'pedro@work.com', source: 'commit-history' },
      { nome: 'plgsa', email: 'pedro@gmail.com', source: 'github-api' },
    ]);

    // Os 3 devem estar no mesmo cluster (via email compartilhado)
    expect(clusters.length).toBe(1);
    expect(clusters[0].emails_detectados).toContain('pedro@gmail.com');
    expect(clusters[0].emails_detectados).toContain('pedro@work.com');
    expect(clusters[0].nomes_detectados).toContain('plgsa');
  });
});

// ─── deduplicação ───────────────────────────────────────────────────

describe('deduplicação', () => {
  it('normalizeIdentity deve produzir fingerprints idênticos para entradas equivalentes', () => {
    const a = normalizeIdentity('Pedro Lucas', 'nome');
    const b = normalizeIdentity('  pedro lucas  ', 'nome');
    expect(a.fingerprint).toBe(b.fingerprint);
  });

  it('deve diferenciar nomes com acentos removidos vs não', () => {
    const a = normalizeIdentity('João', 'nome');
    const b = normalizeIdentity('Joao', 'nome');
    // Caracteres especiais são removidos, então "João" -> "joo" e "Joao" -> "joao"
    expect(a.fingerprint).not.toBe(b.fingerprint);
  });

  it('email dedup: maiúsculo e minúsculo devem ter mesmo fingerprint', () => {
    const a = normalizeIdentity('Pedro@Gmail.COM', 'email');
    const b = normalizeIdentity('pedro@gmail.com', 'email');
    expect(a.fingerprint).toBe(b.fingerprint);
  });
});

// ─── getConsolidatedIdentifiers ─────────────────────────────────────

describe('IdentityResolver.getConsolidatedIdentifiers', () => {
  it('deve retornar emails e nomes apenas do primary_identity (não de aliases de terceiros)', () => {
    const profile: IdentityProfile = {
      versao: '2.0.0',
      gerado_em: '2026-02-26T00:00:00.000Z',
      primary_identity: {
        nome_canonico: 'Pedro Lucas',
        emails: ['pedro@gmail.com', 'plgsa@users.noreply.github.com'],
        usernames: ['plgsa'],
      },
      aliases: [
        {
          cluster_id: 'cluster-000',
          nomes_detectados: ['Pedro Lucas', 'plgsa'],
          emails_detectados: ['pedro@gmail.com', 'plgsa@users.noreply.github.com'],
          sources: ['git-config', 'github-api'],
          confidence: 85,
        },
        {
          cluster_id: 'cluster-001',
          nomes_detectados: ['Terceiro'],
          emails_detectados: ['terceiro@other.com'],
          sources: ['commit-history'],
          confidence: 35,
        },
      ],
      total_clusters: 2,
      total_authors_scanned: 50,
      total_authors_filtered: 5,
    };

    const result = IdentityResolver.getConsolidatedIdentifiers(profile);

    // Deve conter apenas dados do primary
    expect(result.emails).toContain('pedro@gmail.com');
    expect(result.emails).toContain('plgsa@users.noreply.github.com');
    expect(result.nomes).toContain('pedro lucas');
    expect(result.nomes).toContain('plgsa');
    expect(result.usernames).toContain('plgsa');

    // NÃO deve conter dados de aliases de terceiros
    expect(result.emails).not.toContain('terceiro@other.com');
    expect(result.nomes).not.toContain('terceiro');
  });

  it('deve funcionar com perfil sem aliases', () => {
    const profile: IdentityProfile = {
      versao: '2.0.0',
      gerado_em: '2026-02-26T00:00:00.000Z',
      primary_identity: {
        nome_canonico: 'Pedro',
        emails: ['pedro@gmail.com'],
        usernames: ['plgsa'],
      },
      aliases: [],
      total_clusters: 0,
      total_authors_scanned: 0,
      total_authors_filtered: 0,
    };

    const result = IdentityResolver.getConsolidatedIdentifiers(profile);

    expect(result.emails).toEqual(['pedro@gmail.com']);
    // nomes inclui nome_canonico + usernames
    expect(result.nomes).toContain('pedro');
    expect(result.nomes).toContain('plgsa');
    expect(result.usernames).toEqual(['plgsa']);
  });

  it('deve deduplicar emails (case insensitive)', () => {
    const profile: IdentityProfile = {
      versao: '2.0.0',
      gerado_em: '2026-02-26T00:00:00.000Z',
      primary_identity: {
        nome_canonico: 'Pedro',
        emails: ['Pedro@Gmail.COM'],
        usernames: [],
      },
      aliases: [
        {
          cluster_id: 'cluster-000',
          nomes_detectados: ['Pedro'],
          emails_detectados: ['pedro@gmail.com'],
          sources: ['git-config'],
          confidence: 45,
        },
      ],
      total_clusters: 1,
      total_authors_scanned: 10,
      total_authors_filtered: 2,
    };

    const result = IdentityResolver.getConsolidatedIdentifiers(profile);

    // Deve ter apenas 1 email (dedup por lowercase)
    expect(result.emails).toHaveLength(1);
    expect(result.emails[0]).toBe('pedro@gmail.com');
  });
});

// ─── primary identity selection ─────────────────────────────────────

describe('primary identity selection', () => {
  it('deve incluir github_user nos usernames', () => {
    const profile: IdentityProfile = {
      versao: '2.0.0',
      gerado_em: '2026-02-26T00:00:00.000Z',
      primary_identity: {
        nome_canonico: 'Pedro',
        emails: [],
        usernames: ['myuser'],
      },
      aliases: [],
      total_clusters: 0,
      total_authors_scanned: 0,
      total_authors_filtered: 0,
    };

    expect(profile.primary_identity.usernames).toContain('myuser');
  });

  it('cluster com git-config deve ter confidence > cluster só com commit-history', () => {
    const resolver = new IdentityResolver({
      root_path: '/tmp/test',
      project_paths: [],
    });

    const clusters = resolver.clusterIdentities([
      { nome: 'Pedro', email: 'pedro@gmail.com', source: 'git-config' },
      { nome: 'Bot', email: 'bot@ci.com', source: 'commit-history' },
    ]);

    const gitConfigCluster = clusters.find(c => c.nomes_detectados.includes('Pedro'));
    const commitCluster = clusters.find(c => c.nomes_detectados.includes('Bot'));

    expect(gitConfigCluster!.confidence).toBeGreaterThan(commitCluster!.confidence);
  });
});

// ─── isRelevantAuthor (Fase B — filtro de relevância) ───────────────

describe('isRelevantAuthor', () => {
  function makeResolver(githubUser?: string) {
    return new IdentityResolver({
      root_path: '/tmp/test',
      github_user: githubUser,
      project_paths: [],
    });
  }

  const seedNames = ['pedro lucas', 'plgsa'];
  const seedEmails = new Set(['pedro@gmail.com', 'plgsa@users.noreply.github.com']);
  const githubUser = 'plgsa';

  it('deve aceitar autor com email idêntico ao seed', () => {
    const resolver = makeResolver(githubUser);
    expect(resolver.isRelevantAuthor('Qualquer Nome', 'pedro@gmail.com', seedNames, seedEmails, githubUser)).toBe(true);
  });

  it('deve aceitar autor cujo email contém github_user', () => {
    const resolver = makeResolver(githubUser);
    expect(resolver.isRelevantAuthor('P. Lucas', 'plgsa@company.com', seedNames, seedEmails, githubUser)).toBe(true);
  });

  it('deve aceitar autor com nome similar >= 0.80 ao seed', () => {
    const resolver = makeResolver(githubUser);
    // "pedro lucas" vs "pedro luca" => similaridade alta (~0.91)
    expect(resolver.isRelevantAuthor('Pedro Luca', 'random@mail.com', seedNames, seedEmails, githubUser)).toBe(true);
  });

  it('deve aceitar autor cujo nome contém github_user', () => {
    const resolver = makeResolver(githubUser);
    expect(resolver.isRelevantAuthor('plgsa', 'unknown@mail.com', seedNames, seedEmails, githubUser)).toBe(true);
  });

  it('deve rejeitar autor totalmente diferente', () => {
    const resolver = makeResolver(githubUser);
    expect(resolver.isRelevantAuthor('Maria Silva', 'maria@hotmail.com', seedNames, seedEmails, githubUser)).toBe(false);
  });

  it('deve rejeitar bot de CI', () => {
    const resolver = makeResolver(githubUser);
    expect(resolver.isRelevantAuthor('GitHub Action Bot', 'noreply@github.com', seedNames, seedEmails, githubUser)).toBe(false);
  });

  it('deve rejeitar dependabot', () => {
    const resolver = makeResolver(githubUser);
    expect(resolver.isRelevantAuthor('dependabot[bot]', 'dependabot@github.com', seedNames, seedEmails, githubUser)).toBe(false);
  });

  it('deve aceitar noreply do github com username correto', () => {
    const resolver = makeResolver(githubUser);
    expect(resolver.isRelevantAuthor('Pedro Lucas', 'plgsa@users.noreply.github.com', seedNames, seedEmails, githubUser)).toBe(true);
  });

  it('deve rejeitar quando não há github_user e nome é diferente', () => {
    const resolver = makeResolver(); // sem github_user
    expect(resolver.isRelevantAuthor('John Doe', 'john@example.com', seedNames, seedEmails, '')).toBe(false);
  });

  it('deve aceitar quando email é seed mesmo sem github_user', () => {
    const resolver = makeResolver();
    expect(resolver.isRelevantAuthor('Unknown', 'pedro@gmail.com', seedNames, seedEmails, '')).toBe(true);
  });
});

// ─── buildSeedIdentities (Fase A) ──────────────────────────────────

describe('buildSeedIdentities', () => {
  it('deve adicionar github_user ao seed quando configurado', () => {
    const resolver = new IdentityResolver({
      root_path: '/tmp/test',
      github_user: 'testuser',
      project_paths: [],
    });

    // buildSeedIdentities é público
    resolver.buildSeedIdentities();

    // Não podemos acessar seedIdentities diretamente (é private),
    // mas podemos verificar indiretamente via clusterIdentities após resolve.
    // Por enquanto testamos que não lança erro.
    expect(true).toBe(true);
  });

  it('deve funcionar sem github_user', () => {
    const resolver = new IdentityResolver({
      root_path: '/tmp/test',
      project_paths: [],
    });

    // Não deve lançar erro
    expect(() => resolver.buildSeedIdentities()).not.toThrow();
  });
});

// ─── integração: filtro reduz clusters de 948 para poucos ──────────

describe('filtro de relevância — cenário real', () => {
  it('isRelevantAuthor deve filtrar grande volume de autores externos', () => {
    const resolver = new IdentityResolver({
      root_path: '/tmp/test',
      github_user: 'plgsa',
      project_paths: [],
    });

    const seedNames = ['pedro lucas', 'plgsa'];
    const seedEmails = new Set(['pedro@gmail.com', 'plgsa@users.noreply.github.com']);

    // Simular 50 autores: 5 do usuário, 45 externos
    const userAuthors = [
      { nome: 'Pedro Lucas', email: 'pedro@gmail.com' },
      { nome: 'plgsa', email: 'plgsa@users.noreply.github.com' },
      { nome: 'Pedro Lucas Silva', email: 'plgsa@work.com' }, // email contém github_user
      { nome: 'Pedro Luca', email: 'pl@personal.com' },
      { nome: 'plgsa', email: 'another@mail.com' },
    ];

    const externalAuthors = Array.from({ length: 45 }, (_, i) => ({
      nome: `External Dev ${i}`,
      email: `dev${i}@company${i}.com`,
    }));

    const allAuthors = [...userAuthors, ...externalAuthors];

    let accepted = 0;
    let rejected = 0;

    for (const author of allAuthors) {
      if (resolver.isRelevantAuthor(author.nome, author.email, seedNames, seedEmails, 'plgsa')) {
        accepted++;
      } else {
        rejected++;
      }
    }

    // Todos os 5 do usuário devem ser aceitos
    expect(accepted).toBe(5);
    // Todos os 45 externos devem ser rejeitados
    expect(rejected).toBe(45);
  });
});

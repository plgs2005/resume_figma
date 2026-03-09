/**
 * SelfKnowledgeEngine — Unit Tests: Project Discovery
 */

import { ProjectDiscovery } from '../src/project-discovery';
import type { DiscoveryConfig, ProjectsCatalog } from '../src/types';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('ProjectDiscovery', () => {
  const testRoot = join(tmpdir(), 'ske-test-discovery-' + Date.now());

  // Criar estrutura de projetos fake
  beforeAll(() => {
    mkdirSync(testRoot, { recursive: true });

    // Projeto 1: Node.js com git e docker
    const proj1 = join(testRoot, 'meu-projeto-node');
    mkdirSync(join(proj1, '.git'), { recursive: true });
    writeFileSync(join(proj1, 'package.json'), JSON.stringify({ name: 'meu-projeto-node' }));
    writeFileSync(join(proj1, 'Dockerfile'), 'FROM node:18');
    mkdirSync(join(proj1, 'src'), { recursive: true });
    writeFileSync(join(proj1, 'src', 'index.ts'), 'console.log("hello")');

    // Projeto 2: Python
    const proj2 = join(testRoot, 'meu-projeto-python');
    mkdirSync(join(proj2, '.git'), { recursive: true });
    writeFileSync(join(proj2, 'requirements.txt'), 'django==4.0\ncelery==5.0');
    writeFileSync(join(proj2, 'pyproject.toml'), '[tool.poetry]\nname = "meu-projeto-python"');

    // Projeto 3: Go
    const proj3 = join(testRoot, 'meu-api-go');
    mkdirSync(join(proj3, '.git'), { recursive: true });
    writeFileSync(join(proj3, 'go.mod'), 'module github.com/user/meu-api-go');

    // Diretório SEM indicadores (não deve ser detectado)
    const noProject = join(testRoot, 'random-folder');
    mkdirSync(noProject, { recursive: true });
    writeFileSync(join(noProject, 'readme.txt'), 'just a folder');

    // node_modules (deve ser ignorado)
    const nm = join(testRoot, 'node_modules', 'some-dep');
    mkdirSync(nm, { recursive: true });
    writeFileSync(join(nm, 'package.json'), JSON.stringify({ name: 'some-dep' }));
  });

  afterAll(() => {
    rmSync(testRoot, { recursive: true, force: true });
  });

  function createDiscovery(overrides?: Partial<DiscoveryConfig>): ProjectDiscovery {
    return new ProjectDiscovery({
      root_path: testRoot,
      max_selected: 20,
      max_depth: 4,
      ignore_patterns: [],
      ...overrides,
    });
  }

  // ─── Descoberta Local ──────────────────────────────────────────────

  describe('discoverLocal', () => {
    it('deve encontrar projetos com indicadores válidos', () => {
      const discovery = createDiscovery();
      const projects = discovery.discoverLocal();

      expect(projects.length).toBeGreaterThanOrEqual(3);

      const names = projects.map(p => p.nome);
      expect(names).toContain('meu-projeto-node');
      expect(names).toContain('meu-projeto-python');
    });

    it('NÃO deve incluir diretórios sem indicadores', () => {
      const discovery = createDiscovery();
      const projects = discovery.discoverLocal();

      const names = projects.map(p => p.nome);
      expect(names).not.toContain('random-folder');
    });

    it('NÃO deve incluir node_modules', () => {
      const discovery = createDiscovery();
      const projects = discovery.discoverLocal();

      const names = projects.map(p => p.nome);
      expect(names).not.toContain('some-dep');
    });

    it('deve preencher indicadores para cada projeto', () => {
      const discovery = createDiscovery();
      const projects = discovery.discoverLocal();

      const nodeProject = projects.find(p => p.nome === 'meu-projeto-node');
      expect(nodeProject).toBeDefined();
      expect(nodeProject!.indicadores.length).toBeGreaterThanOrEqual(2);

      const tipos = nodeProject!.indicadores.map(i => i.tipo);
      expect(tipos).toContain('.git');
      expect(tipos).toContain('package.json');
      expect(tipos).toContain('Dockerfile');
    });

    it('deve classificar todos como origem "local"', () => {
      const discovery = createDiscovery();
      const projects = discovery.discoverLocal();

      for (const p of projects) {
        expect(p.origem).toBe('local');
      }
    });

    it('deve lidar com path inexistente sem erro', () => {
      const discovery = createDiscovery({ root_path: '/tmp/inexistente-' + Date.now() });
      const projects = discovery.discoverLocal();
      expect(projects).toEqual([]);
    });
  });

  // ─── Scoring e Seleção ─────────────────────────────────────────────

  describe('scoreAndSelect', () => {
    it('deve calcular score de relevância para cada projeto', () => {
      const discovery = createDiscovery();
      const projects = discovery.discoverLocal();
      const scored = discovery.scoreAndSelect(projects);

      for (const p of scored) {
        expect(p.relevancia.total).toBeGreaterThanOrEqual(0);
        expect(typeof p.relevancia.commits_autorais).toBe('number');
        expect(typeof p.relevancia.tamanho).toBe('number');
        expect(typeof p.relevancia.infra).toBe('number');
        expect(typeof p.relevancia.atualizado_recentemente).toBe('number');
      }
    });

    it('deve ordenar por score descendente', () => {
      const discovery = createDiscovery();
      const projects = discovery.discoverLocal();
      const scored = discovery.scoreAndSelect(projects);

      for (let i = 1; i < scored.length; i++) {
        expect(scored[i - 1].relevancia.total).toBeGreaterThanOrEqual(scored[i].relevancia.total);
      }
    });

    it('deve selecionar até max_selected projetos', () => {
      const discovery = createDiscovery({ max_selected: 2 });
      const projects = discovery.discoverLocal();
      const scored = discovery.scoreAndSelect(projects);

      const selected = scored.filter(p => p.selected_for_analysis);
      expect(selected.length).toBeLessThanOrEqual(2);
    });

    it('projeto com Dockerfile deve ter score de infra > 0', () => {
      const discovery = createDiscovery();
      const projects = discovery.discoverLocal();
      const scored = discovery.scoreAndSelect(projects);

      const nodeProject = scored.find(p => p.nome === 'meu-projeto-node');
      expect(nodeProject).toBeDefined();
      expect(nodeProject!.relevancia.infra).toBeGreaterThan(0);
    });
  });

  // ─── Discovery Completo ────────────────────────────────────────────

  describe('discover (full)', () => {
    it('deve retornar um ProjectsCatalog válido', async () => {
      const discovery = createDiscovery();
      const catalog = await discovery.discover();

      expect(catalog.versao).toBe('1.0.0');
      expect(catalog.gerado_em).toBeDefined();
      expect(catalog.total_descobertos).toBeGreaterThanOrEqual(3);
      expect(catalog.projetos.length).toBe(catalog.total_descobertos);
      expect(Array.isArray(catalog.avisos)).toBe(true);
    });

    it('deve incluir aviso quando github_user não está configurado', async () => {
      const discovery = createDiscovery();
      const catalog = await discovery.discover();

      const hasWarning = catalog.avisos.some(a => a.includes('nenhum username'));
      expect(hasWarning).toBe(true);
    });
  });

  // ─── Util: getSelectedPaths ────────────────────────────────────────

  describe('getSelectedPaths', () => {
    it('deve retornar apenas paths locais selecionados', () => {
      const catalog: ProjectsCatalog = {
        versao: '1.0.0',
        gerado_em: new Date().toISOString(),
        total_descobertos: 3,
        total_selecionados: 2,
        projetos: [
          {
            id: '1', nome: 'proj-a', caminho: '/home/user/proj-a', origem: 'local',
            indicadores: [], relevancia: { total: 50, commits_autorais: 30, tamanho: 10, infra: 5, atualizado_recentemente: 5 },
            selected_for_analysis: true,
          },
          {
            id: '2', nome: 'proj-b', caminho: 'https://github.com/user/proj-b', origem: 'github',
            indicadores: [], relevancia: { total: 40, commits_autorais: 20, tamanho: 10, infra: 5, atualizado_recentemente: 5 },
            selected_for_analysis: true,
          },
          {
            id: '3', nome: 'proj-c', caminho: '/home/user/proj-c', origem: 'local',
            indicadores: [], relevancia: { total: 10, commits_autorais: 0, tamanho: 5, infra: 0, atualizado_recentemente: 5 },
            selected_for_analysis: false,
          },
        ],
        avisos: [],
      };

      const paths = ProjectDiscovery.getSelectedPaths(catalog);
      expect(paths).toEqual(['/home/user/proj-a']);
    });
  });
});

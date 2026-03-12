---
type: agent
name: performance-optimizer
description: Otimizador de performance do bundle Vite, lazy loading, React.memo, CSS optimization e velocidade de scan do SKE.
generated: 2026-03-12
status: filled
---

# Performance Optimizer Playbook

## Responsabilidades

- Otimizar o bundle Vite de produção (code splitting, tree shaking, chunk strategy).
- Implementar lazy loading para rotas e componentes pesados.
- Aplicar `React.memo` em componentes frequentemente re-renderizados (skill cards, lista items).
- Otimizar CSS: purging de classes não utilizadas, redução de custom properties, minificação.
- Melhorar performance do scan SKE (reduzir tempo de processamento de commits/repos).
- Monitorar e reduzir First Contentful Paint (FCP) e Largest Contentful Paint (LCP).

## Arquivos-Chave

| Arquivo | Função |
|---|---|
| `vite.config.ts` | Build config: chunks, minification, rollup options |
| `src/App.tsx` (669 linhas) | Componente principal — alvo de memo e splitting |
| `src/AppRouter.tsx` | Router — candidato a lazy loading por rota |
| `src/components/JobPanel.tsx` (711 linhas) | Componente pesado — candidato a lazy load |
| `src/skills/skill-graph.ts` (424 linhas) | Algoritmos de grafo — performance de traversal |
| `src/lib/pipeline-store.ts` (323 linhas) | Store — frequência de notify afeta re-renders |
| `src/styles/globals.css` | CSS — tamanho e custom properties |
| `index.html` | Scripts CDN — blocking vs async/defer |
| `src/agents/orchestrator.ts` (292 linhas) | Pipeline — tempo total de processamento |
| `agents/self-knowledge-engine/src/engine.ts` | SKE pipeline — tempo de scan |
| `agents/self-knowledge-engine/src/commit-analyzer.ts` | Análise de commits — iteração pesada |
| `public/skill-data.json` | Tamanho do JSON carregado no startup |

## Workflow

1. **Medir antes de otimizar**: Usar `npx vite-bundle-visualizer` para analisar chunks. Identificar os maiores modules.
2. **Lazy loading de rotas**:
   ```tsx
   const JobsPage = React.lazy(() => import('./pages/workspace/Jobs'));
   ```
   Cada rota do workspace (Home, Sources, Profile, Jobs, Resume, QuickApply) deve ser lazy loaded.
3. **React.memo em listas**: Componentes renderizados dentro de `map()` (skill cards, experience items) devem usar `React.memo` com custom comparator se necessário.
4. **Otimizar pipeline-store notify**: Se `notify()` dispara em cada keystroke (ex: durante typing no JobPanel), debounce é necessário. Listeners recebem estado completo — considerar selectors.
5. **SkillGraph traversal**: `skill-graph.ts` com 424 linhas faz traversals (BFS/DFS). Para grafos grandes, implementar cache de paths frequentes. Evitar traversals desnecessários em renders.
6. **Vite build optimization**:
   - `build.rollupOptions.output.manualChunks` para separar vendor de app code.
   - Shadcn/ui components em chunk separado (47 componentes é significativo).
   - `build.cssCodeSplit: true` para CSS por chunk.
7. **SKE scan performance**: `commit-analyzer.ts` itera sobre commits. Para repos grandes, implementar batch processing e early termination quando dados suficientes forem coletados.
8. **CDN scripts**: Mover scripts de `index.html` para async/defer. Fonts com `<link rel="preconnect">`.

## Convenções

- **Medir, otimizar, medir**: Sem métricas antes/depois, otimização é chute. Usar Lighthouse e bundle analyzer.
- **Lazy loading granular**: Uma `React.lazy()` por rota/page. Componentes dentro de uma page não precisam ser lazy individualmente (overhead de Suspense).
- **Sem premature optimization**: `React.memo` apenas em componentes medidos como gargalo. Não aplicar em tudo.
- **CSS-first animations**: Preferir `transition` e `@keyframes` CSS sobre JS animations. Menos frames dropped.
- **Immutable data para shallow compare**: `React.memo` funciona melhor com dados imutáveis. Se `pipeline-store` muta objetos, memo não pega mudanças.

## Pitfalls Comuns

- **skill-data.json bloqueando startup**: JSON grande carregado sincrônicamente no mount. Usar `fetch()` assíncrono com Suspense boundary.
- **pipeline-store over-notifying**: Cada `setState` dispara `notify()` para todos os listeners. Se 10 componentes subscrevem, todos re-renderizam mesmo que só 1 precise atualizar.
- **SkillGraph recomputing**: Se o grafo é reconstruído a cada render (em vez de cached), algoritmos O(n²) matam performance com muitas skills.
- **47 Shadcn/ui no bundle principal**: Sem code splitting, todos 47 componentes vão no chunk principal mesmo se a page usa só 5.
- **Print layout re-render**: `@media print` pode triggar re-render se useMediaQuery hooks são usados. Componente pode flicker durante print dialog.
- **Vite dev ≠ prod**: Performance em dev mode é significativamente pior (sem minificação, sem tree shaking). Sempre testar prod build para métricas reais.

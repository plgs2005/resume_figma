# AGENTS.md

## Dev environment tips
- Install dependencies with `npm install` before running scaffolds.
- Use `npm run dev` for the interactive TypeScript session that powers local experimentation.
- Run `npm run build` to refresh the CommonJS bundle in `dist/` before shipping changes.
- Store generated artefacts in `.context/` so reruns stay deterministic.

## Testing instructions
- Execute `npm run test` to run the Jest suite.
- Append `-- --watch` while iterating on a failing spec.
- Trigger `npm run build && npm run test` before opening a PR to mimic CI.
- Add or update tests alongside any generator or CLI changes.

## PR instructions
- Follow Conventional Commits (for example, `feat(scaffolding): add doc links`).
- Cross-link new scaffolds in `docs/README.md` and `agents/README.md` so future agents can find them.
- Attach sample CLI output or generated markdown when behaviour shifts.
- Confirm the built artefacts in `dist/` match the new source changes.

## Repository map
- `src/` — Application source code (React + TypeScript).
  - `src/App.tsx` — Main resume/CV component. Edit for content or layout changes.
  - `src/main.tsx` — React entry point (ReactDOM.createRoot). Rarely needs editing.
  - `src/vite-env.d.ts` — Vite type declarations. Edit to add global type augmentations.
  - `src/components/ui/` — 47 Shadcn/ui components. Add new UI primitives here.
  - `src/components/figma/` — Figma integration components (ImageWithFallback).
  - `src/styles/globals.css` — Tailwind v4 config, design tokens, global styles.
- `docs/` — Internal documentation and guidelines.
  - `docs/guidelines/` — Design system, development guide, technical docs.
  - `docs/ALIGNMENT_GUIDE.md`, `SETUP_LOCAL.md`, etc. — Setup and architecture guides.
- `agents/` — AI agent sub-projects (e.g., `self-knowledge-engine/`).
- `.context/` — Generated AI context artefacts (deterministic, regenerable).
- `scripts/` — Build and maintenance scripts (e.g., `fix-figma-imports.sh`).
- `public/` — Static assets served as-is by Vite.
- `index.html` — Vite HTML entry point. Edit to change meta tags or CDN scripts.
- `package.json` — Dependencies and npm scripts. Edit for dep changes.
- `Attributions.md` — Third-party licences. Update when adding dependencies.
- `CHANGELOG.md` — Version history. Update on every release.
- `README.md` — Project overview and quickstart guide.

## AI Context References
- Documentation index: `.context/docs/README.md`
- Agent playbooks: `.context/agents/README.md`
- Contributor guide: `CONTRIBUTING.md`

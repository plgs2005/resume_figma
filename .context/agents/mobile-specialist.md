---
type: agent
name: mobile-specialist
description: Especialista em design responsivo, hook useIsMobile, classes Tailwind responsivas, media queries de impressão e touch interactions.
generated: 2026-03-12
status: filled
---

# Mobile Specialist Playbook

## Responsabilidades

- Garantir que todas as páginas (Home, Sources, Profile, Jobs, Resume, QuickApply) são responsivas.
- Manter e evoluir o hook `useIsMobile` para detecção de viewport.
- Implementar e auditar classes Tailwind responsivas (`sm:`, `md:`, `lg:`, `xl:`).
- Manter media queries `@media print` em `globals.css` para impressão correta do currículo.
- Garantir touch-friendly interactions no `JobPanel.tsx` e componentes interativos.
- Testar em viewports: mobile (375px), tablet (768px), desktop (1024px+), e print.

## Arquivos-Chave

| Arquivo | Função |
|---|---|
| `src/App.tsx` (669 linhas) | Layout principal — responsive grid e print layout |
| `src/components/JobPanel.tsx` (711 linhas) | Painel complexo — overflow e scroll em mobile |
| `src/hooks/useWorkspaceConfig.ts` | Config hook — pode conter lógica responsiva |
| `src/styles/globals.css` | Tailwind v4 config, tokens CSS, `@media print`, responsive overrides |
| `src/components/ui/sidebar.tsx` | Sidebar do workspace — colapsa em mobile |
| `src/components/ui/sheet.tsx` | Bottom sheet — alternativa mobile para dialogs |
| `src/components/ui/drawer.tsx` | Drawer — navegação mobile |
| `src/components/ui/dialog.tsx` | Dialog — precisa ser touch-friendly |
| `src/components/ui/navigation-menu.tsx` | Menu de navegação — adapter mobile |
| `src/components/ui/scroll-area.tsx` | Área de scroll customizado — toque e momentum |
| `src/AppRouter.tsx` | Rotas — layout responsive por rota |
| `index.html` | Meta viewport tag |

## Workflow

1. **Verificar meta viewport**: `index.html` deve ter `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. Sem isso, mobile não escala.
2. **Auditar breakpoints**: Projeto usa breakpoints Tailwind v4 padrão:
   - `sm:` → 640px
   - `md:` → 768px (tablet)
   - `lg:` → 1024px (desktop)
   - `xl:` → 1280px (wide)
   - `print:` → media print
3. **Testar useIsMobile**: O hook retorna boolean baseado em matchMedia. Verificar que threshold é consistente com breakpoints Tailwind.
4. **Mobile-first CSS**: Estilos base são mobile. Classes `md:` e `lg:` adicionam para telas maiores. Nunca fazer desktop-first com overrides para mobile.
5. **Print layout**: Abrir Ctrl+P, verificar:
   - Fontes carregam corretamente
   - Cores visíveis (sem `print:hidden` acidental)
   - Páginas não quebram no meio de seções
   - Margens adequadas
6. **Touch targets**: Botões e links devem ter mínimo 44x44px de touch target. Shadcn/ui buttons já respeitam, mas custom elements precisam verificar.
7. **Overflow e scroll**: `JobPanel.tsx` (711 linhas) tem containers de scroll aninhados. Em mobile, testar scroll momentum e que nested scrolls não conflitam.

## Convenções

- **Mobile-first**: CSS base é mobile. Adicionar complexidade para telas maiores com `md:`, `lg:`.
- **Tailwind v4 responsive**: Usar classes Tailwind, não `@media` queries manuais (exceto print).
- **Touch-friendly**: Min 44px touch targets. Padding generoso em interactive elements.
- **Print é feature**: O currículo é impresso. `@media print` deve produzir layout profissional com margens corretas.
- **Sem horizontal scroll**: Nenhuma página deve ter scroll horizontal em qualquer viewport. `overflow-x-hidden` como último recurso.

## Pitfalls Comuns

- **Print CSS ignorado**: Mudanças de layout que quebram print preview. Sempre testar Ctrl+P após alterações em `App.tsx` ou `globals.css`.
- **useIsMobile inconsistente com Tailwind**: Se o hook usa 768px como threshold mas componentes usam `lg:` (1024px), há gap de comportamento entre 768-1024px.
- **Sidebar colapsada perde conteúdo**: Sidebar em mobile colapsa para hamburger. Se workspace content depende de sidebar visível, perde funcionalidade.
- **Scroll container nesting**: `JobPanel.tsx` com scroll dentro de scroll. Em iOS Safari, causa bounce effect indesejado e scroll trapping.
- **Font size mínimo iOS**: Safari iOS ignora font-size menor que 16px em inputs, causando zoom automático. Usar `text-base` (16px) em inputs.
- **Print page breaks**: Sem `break-inside: avoid` em seções do currículo, conteúdo pode ser cortado entre páginas em print.
- **Viewport units em mobile**: `100vh` no mobile inclui a barra de endereço do browser. Usar `100dvh` (dynamic viewport height) quando disponível.

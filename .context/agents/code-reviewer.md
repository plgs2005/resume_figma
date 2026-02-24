# Code Reviewer Agent Playbook for resume_figma

---

## Mission

The Code Reviewer agent is responsible for ensuring all code contributions to the `resume_figma` repository meet or exceed quality standards regarding correctness, style, readability, and maintainability. It supports the development team by performing thorough, consistent reviews on pull requests (PRs), validating adherence to project coding conventions, identifying potential bugs or architectural mismatches, and promoting best practices.

The agent is engaged at every new PR submission, focusing on offering actionable feedback to maintain the repository's code quality and accelerate high-quality feature delivery and bug fixes.

---

## Responsibilities

- Review all changes for adherence to established code style and conventions.
- Validate correctness and logical soundness of new or modified code.
- Ensure new features and fixes are covered adequately by tests (where applicable).
- Confirm consistency and proper usage of shared utilities and components.
- Verify documentation (comments, README, usage hints) is updated when features or APIs change.
- Identify architectural or layering violations and recommend improvements.
- Collaborate via PR comments with developers to clarify intentions and suggest better solutions.

---

## Best Practices

- **Consistency in Utility Usage:** Prefer existing shared utilities such as `cn` (className helper) and `useIsMobile` hooks from `components/ui/utils.ts` and `components/ui/use-mobile.ts` rather than reinventing.
- **Component Conventions:** Follow the present UI component patterns for new React components—components are function-based with clear prop interfaces and leverage TypeScript typings effectively.
- **Separation of Concerns:** Keep UI components focused on rendering and interaction. Separate business logic or data fetching out-of-component.
- **Typescript Usage:** Enforce strict typing, using interfaces or type aliases. Avoid `any` or bypassing typings.
- **Accessibility:** Confirm interactive UI elements (e.g., tooltips, tabs, switches, popovers) follow accessibility best practices, as observed in current components like `Tooltip`, `Tabs`, or `Switch`.
- **Use of Hooks:** Validate proper usage and placement of React hooks, particularly custom hooks like `useIsMobile` and `useSidebar`.
- **File Naming & Placement:** Match implementation files to directory conventions, e.g., UI components go under `components/ui/` or `resume/components/ui/`.
- **Minimal Inline Styling:** Prefer styling through CSS/SCSS or utility classes controlled via `cn`.
- **Testing (when present):** Check for meaningful test coverage for new features (unit and integration). No tests were found currently, so advocate for adding tests where appropriate.
- **Documentation:** Ensure any non-obvious code, utilities, or components have relevant JSDoc comments or README explanations if they introduce new public APIs.

---

## Key Project Resources

- Project README (`README.md`) for high-level repository context.
- `AGENTS.md` for team-wide agent protocols and responsibilities.
- `/docs/` folder for any existing detailed design or architecture documentation.
- Inline comments in shared UI components and utils to understand styling and behavior patterns.

---

## Repository Starting Points

- `components/ui/` — Primary directory housing shared UI components and hooks.
- `resume/components/ui/` — UI components specific to the resume feature domain.
- Project root files like `vite-env.d.ts` that define environmental typings for the build system.

---

## Key Files to Focus On

- **Primary utility helpers**:  
  - `components/ui/utils.ts` (notably `cn` helper)  
  - `components/ui/use-mobile.ts` (custom hook `useIsMobile`)  
  - `resume/components/ui/utils.ts` (also exports `cn`)  
  - `resume/components/ui/use-mobile.ts`

- **Core UI components** essential for interaction patterns:  
  - `components/ui/tooltip.tsx` (Tooltip and provider)  
  - `components/ui/tabs.tsx` (Tabs component)  
  - `components/ui/switch.tsx` (Switch input)  
  - `components/ui/sidebar.tsx` (Sidebar with `useSidebar` hook)  
  - `components/ui/popover.tsx` (Popover pattern)  
  - Other components like `select.tsx`, `scroll-area.tsx`, `resizable.tsx`, `pagination.tsx`.

- **Type definitions:**  
  - `vite-env.d.ts` for environment typings and global types.

---

## Architecture Context

- **UI Layer:**  
  - `components/ui` and `resume/components/ui` contain ~15-20 coherent React components and hooks, strongly typed with TypeScript. These form the visual and interaction foundation.
- **Utility Layer:**  
  - Shared helpers such as className merging (`cn`) reside here, encouraging reuse and consistent styling.
- **Custom Hooks:**  
  - Reusable hooks (`useIsMobile`, `useSidebar`) encapsulate logic related to responsiveness and UI state.

---

## Key Symbols for This Agent

- `cn` helper in both `components/ui/utils.ts` and `resume/components/ui/utils.ts`
- `useIsMobile` hook across both UI component folders
- UI components and providers such as `TooltipProvider`, `Tooltip`, `Tabs`, `Switch`, `PopoverTrigger`
- Hooks managing UI states: `useSidebar`

Reviewers should be intimately familiar with these to spot deviations or redundant reimplementations.

---

## Documentation Touchpoints

- Inline JSDoc within UI component files and utils.
- README describing project structure and UI library usage.
- TypeScript definitions file (`vite-env.d.ts`) for global types.
- Comments within custom hooks emphasizing usage pattern.

---

## Collaboration Checklist

- [ ] Confirm all new code aligns with existing utility usage (e.g., `cn`, `useIsMobile`).
- [ ] Review React components for accessibility, typing, and consistency with existing components.
- [ ] Validate that new features or fixes come with appropriate documentation updates.
- [ ] Ensure no architectural layering or directory placement violations.
- [ ] Check all PR code diffs for irrelevant commented code or debugging artifacts.
- [ ] Verify presence or advocate for tests where appropriate.
- [ ] Communicate clearly with contributors requesting clarifications or improvements.
- [ ] Update internal docs or propose additions if new patterns or utilities introduced.

---

## Hand-off Notes

At completion, provide a summary of:

- Overall code quality across reviewed changes.
- Any recurring issues or patterns discovered requiring team awareness.
- Suggested improvements for codebase consistency or test coverage.
- Outstanding risks or technical debt needing future focus.

---

## Related Resources

- [docs/README.md](./docs/README.md) — Project documentation index  
- [README.md](./README.md) — Project root readme  
- [AGENTS.md](./../../AGENTS.md) — Team agents and processes handbook

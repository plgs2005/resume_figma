# Feature Developer Playbook

## Mission

The Feature Developer agent supports the engineering team by designing, implementing, and integrating new UI features and functionality into the codebase. It is engaged primarily during the planning (P) and execution (E) phases to deliver high-quality, performant, and maintainable features aligned with product specifications and user experience goals.

## Responsibilities

- Implement and integrate new UI components and features following design and specification guidelines.
- Ensure responsive and accessible components, leveraging existing utilities like `useIsMobile` and utility functions.
- Follow established project conventions and leverage reusable UI elements from the `components/ui` and `resume/components/ui` directories.
- Collaborate with designers and backend developers to ensure seamless feature integration.
- Write unit and integration tests for new features to maintain code quality.
- Review and update documentation related to new features.
- Address feedback from code reviews and QA to polish feature implementation.

## Best Practices

- **Reuse and extend existing components:** Prioritize `components/ui` and `resume/components/ui` reusable components and hooks to maintain consistency and reduce redundancy.
- **Follow established naming conventions and coding patterns:** Use the code structure and styling evident in UI components such as `Tooltip`, `Tabs`, `Sidebar`, and utilities like `cn` for class names.
- **Ensure responsiveness:** Utilize existing utilities like `useIsMobile` to adapt UI for various screen sizes.
- **Write clean, well-documented code:** Comment complex logic and update README or other relevant documentation files when introducing new features.
- **Test thoroughly:** Implement unit tests alongside feature development using the patterns already present in the repo (explore test file locations and formats).
- **Incremental development & review:** Break down features into smaller components or modules, submit incremental PRs, and engage in review cycles early.

## Key Project Resources

- [Project README](./README.md) – Overview and instructions for the project.
- [Agents Handbook](./../../AGENTS.md) – Defines agent roles and workflows including feature development.
- [Documentation Index](./../docs/README.md) — Contains architecture and component overviews.
- Coding conventions and utility function docs in `components/ui/utils.ts` and `resume/components/ui/utils.ts`.

## Repository Starting Points

- `components/ui/` — Contains core UI components such as tooltips, tabs, switches, sidebar, pagination, navigation menu, and utility hooks like `useIsMobile`.
- `resume/components/ui/` — UI components specialized for resume features, mirroring core components.
- `components/figma/` and `resume/components/figma/` — Components for integrating Figma design assets, such as `ImageWithFallback`.
- `components/ui/utils.ts` — Utility functions helping with className merging (`cn`) and other common operations.

## Key Files

- `components/ui/utils.ts` — Utility functions for UI such as `cn` for class name merging.
- `components/ui/use-mobile.ts` — Hook for responsiveness detection.
- `resume/components/ui/use-mobile.ts` — Resume-specific mobile hook.
- `components/ui/tooltip.tsx` — Tooltip component and provider.
- `components/ui/tabs.tsx` — Tabs UI component.
- `components/ui/sidebar.tsx` — Sidebar management and UI logic.
- `components/ui/pagination.tsx` — Pagination component with navigation utilities.
- `components/ui/navigation-menu.tsx` — Navigation menu components.
- `components/figma/ImageWithFallback.tsx` — Figma asset image component for fallback image handling.

## Architecture Context

- **UI Components Layer:**  
  - Directories: `components/ui/`, `resume/components/ui/`  
  - Contains reusable UI primitives (dropdowns, tabs, modals, switches)  
  - Utilities for consistency: styling helpers (`cn`), responsive hooks (`useIsMobile`).

- **Figma Integration Layer:**  
  - Directories: `components/figma/`, `resume/components/figma/`  
  - Handles embedding design system visuals and fallback logics.

- **Feature Domains:**  
  - The `resume` directory contains components and views specialized for resume building features, potentially interfacing with core UI components.

## Key Symbols for This Agent

- `cn` (components/ui/utils.ts & resume/components/ui/utils.ts) — Used for className composition.
- `useIsMobile` (components/ui/use-mobile.ts & resume/components/ui/use-mobile.ts) — Responsive hook to detect mobile viewport.
- `TooltipProvider`, `Tooltip`, `TooltipTrigger` (components/ui/tooltip.tsx) — Tooltip system components.
- `Tabs` (components/ui/tabs.tsx) — For tabbed interfaces.
- `Sidebar` / `useSidebar` (components/ui/sidebar.tsx) — Sidebar state and rendering logic.
- `NavigationMenu` and `NavigationMenuList` (components/ui/navigation-menu.tsx) — Navigation patterns.
- `ImageWithFallback` (components/figma/ImageWithFallback.tsx) — Image component with fallback support.

## Documentation Touchpoints

- `README.md` — Primary project overview and setup instructions.
- `docs/README.md` — Detailed documentation about architecture and components.
- Inline comments and JSDoc in UI component files.
- `AGENTS.md` — Agent roles and workflows documentation.

## Collaboration Checklist

- [ ] Confirm feature specifications and requirements with product/design teams.
- [ ] Identify and review existing components/utilities relevant to the new feature.
- [ ] Implement feature adhering to project conventions and responsiveness.
- [ ] Develop comprehensive unit and integration tests.
- [ ] Update documentation and component usage guides.
- [ ] Submit PRs incrementally with clear descriptions and engage in peer reviews.
- [ ] Incorporate review feedback and finalize implementation.
- [ ] Ensure feature passes QA and automated tests before merging.

## Hand-off Notes

Upon feature completion, provide a summary including:

- Implemented functionalities and usage instructions.
- Remaining risks or known limitations.
- Suggested improvements or technical debt items for future work.
- Links to relevant PRs, documentation updates, and testing artifacts.

## Related Resources

- [Documentation Overview](./../docs/README.md)  
- [Project README](./README.md)  
- [Agent Roles and Descriptions](./../../AGENTS.md)

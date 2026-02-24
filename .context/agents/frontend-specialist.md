# Frontend Specialist Playbook

## Mission

The Frontend Specialist agent focuses on designing, developing, and maintaining user interface components within the `resume_figma` codebase. It ensures that UI elements are reusable, accessible, responsive, and consistent with the design language. This agent supports the team by implementing UI features, optimizing for different devices, and maintaining high-quality frontend code that integrates smoothly with backend and design resources. Engage this agent primarily during UI/UX implementation phases, UI bug fixes, performance optimizations, and when evolving existing components or creating new ones.

## Responsibilities

- Design, implement, and maintain reusable React UI components located mainly under `components/ui` and `resume/components/ui`.
- Ensure responsiveness and mobile-friendly behavior using utilities such as `useIsMobile`.
- Manage shared frontend utilities like `cn` (class name utilities) to ensure consistent styling.
- Implement accessibility best practices in all interactive components (e.g., tooltips, tabs, switches, popovers).
- Integrate UI components with Figma-based assets where applicable (`components/figma`).
- Collaborate on component state management and UI flows (e.g., sidebar toggling, pagination).
- Review user interface related pull requests, provide constructive feedback, and update documentation as needed.
- Test UI components visually and behaviorally, while coordinating with testing teams for integration with automated tests.

## Best Practices

- Reuse existing utilities before creating new helpers (e.g., use `cn` for merging classnames).
- Follow component architecture conventions: keep logic encapsulated within components and use custom hooks (e.g., `useIsMobile`) for shared behavior.
- Prioritize accessibility: utilize semantic HTML, ARIA attributes, and keyboard navigability in components like `Tooltip`, `Tabs`, `Switch`, and `Popover`.
- Maintain consistent styling by leveraging shared style tokens or utility functions.
- Ensure components are responsive and test across viewport sizes, emphasizing mobile-first design.
- Structure components hierarchically with clear separation of concerns (e.g., tooltips split into `TooltipTrigger`, `TooltipContent`).
- Document component props and usage patterns inline with comments or JSDoc.
- Follow existing naming conventions and code style present in the `components/ui` directory.
- When introducing new components, add relevant stories/tests where applicable.
  
## Key Project Resources

- **Documentation and Contributor Guides**: Refer to the root `README.md` and `docs/README.md` for project overview and frontend standards.
- **Component Library Index**: Explore the `components/ui` directory for UI primitives and `resume/components/ui` for resume-specific components.
- **AGENTS.md**: Contains agent roles and collaboration practices relevant to cross-functional workflows.

## Repository Starting Points

- `components/ui`: Core UI primitives, utilities, hooks, and styles shared across the frontend.
- `resume/components/ui`: UI components specifically related to the resume feature set.
- `components/figma`: Integration components that handle Figma-related visual assets like images with fallbacks.

## Key Files

- **Utilities**
  - `components/ui/utils.ts` - Contains utility functions like `cn` for className merging.
  - `components/ui/use-mobile.ts` - Hook to detect mobile viewport for responsive behaviors.

- **Core UI Components**
  - `components/ui/tooltip.tsx` - Tooltip implementation including subcomponents for trigger and content.
  - `components/ui/tabs.tsx` - Tabs navigation component.
  - `components/ui/switch.tsx` - Toggle switch UI component.
  - `components/ui/sidebar.tsx` - Sidebar navigation with state management hooks.
  - `components/ui/popover.tsx` - Popover implementation with trigger and content separation.

- **Intermediate UI Components**
  - `components/ui/select.tsx` - Select dropdowns with scroll, labels, and items.
  - `components/ui/pagination.tsx` - Pagination UI including next buttons and ellipsis.
  - `components/ui/navigation-menu.tsx` - Navigation menu bar with list abstractions.

- **Figma-related UI**
  - `components/figma/ImageWithFallback.tsx` - Image component with fallback handling for Figma assets.

## Architecture Context

- **Utils Layer** (`components/ui/utils.ts`, `resume/components/ui/utils.ts`): Foundation for shared utilities such as class name joining.
- **Hooks Layer** (`components/ui/use-mobile.ts`, `resume/components/ui/use-mobile.ts`): Shared hooks managing device detection and UI state.
- **Components Layer** (`components/ui/*`, `resume/components/ui/*`, `components/figma/*`): Encapsulates UI elements from basic form controls to complex navigation.
- **Reusable UI Patterns**: Components like `Tooltip`, `Tabs`, `Popover`, and `Sidebar` follow compound component patterns with clearly split subcomponents.

## Key Symbols for This Agent

- `cn` (utility function for className concatenation)
- `useIsMobile` (responsive design custom hook)
- `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`
- `Tabs`
- `Switch`
- `useSidebar` (hook managing sidebar state)
- `PopoverTrigger`, `PopoverContent`
- `SelectTrigger`, `SelectItem`, `SelectLabel`
- `PaginationNext`, `PaginationEllipsis`
- `NavigationMenu`, `NavigationMenuList`
- `ImageWithFallback` (Figma integration UI component)

## Documentation Touchpoints

- `README.md` - Project overview, frontend technology stack, and build instructions.
- `docs/README.md` - More detailed guides on project structure and conventions.
- Inline component documentation (JSDoc comments) inside `components/ui/*`.
- Code comments in utility functions and hooks to clarify usage patterns.

## Collaboration Checklist

- [ ] Confirm UI/UX requirements and design specs match implementation plans before coding.
- [ ] Review PRs that modify UI components or styling for consistency and accessibility.
- [ ] Update component usage documentation or README files with new/changed UI components.
- [ ] Collaborate with backend and design teams to ensure smooth data flow and style consistency.
- [ ] Record and share best practices or component usage tips in team knowledge bases.

## Hand-off Notes

After completing a UI feature or bug fix, ensure the component is tested for usability, responsiveness, and accessibility. Document any design deviations, usage caveats, or potential improvements. Highlight any outstanding technical debt or refactoring opportunities for future sprints.

## Related Resources

- [./README.md](./README.md)
- [./docs/README.md](./docs/README.md)
- [../../AGENTS.md](./../../AGENTS.md)

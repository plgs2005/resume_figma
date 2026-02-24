# Mobile Specialist Agent Playbook

## Mission

The Mobile Specialist agent supports the development, maintenance, and enhancement of mobile-friendly user interface components and cross-platform mobile interaction patterns within the codebase. This agent is engaged primarily to implement responsive features, optimize mobile user experience, and ensure seamless mobile device support across all UI segments, focusing on both adaptive design and mobile-specific utilities.

## Responsibilities

- Develop and maintain mobile-responsive UI components and hooks leveraging existing mobile detection utilities.
- Optimize and debug mobile-specific performance and user interaction issues.
- Collaborate with UI/UX designers to translate mobile design requirements into functional components.
- Integrate mobile detection utilities (`useIsMobile`) to control conditional rendering and style application.
- Enhance mobile accessibility and touch interactions across components.
- Contribute to the shared utilities layer by creating and refining mobile-specific helpers.
- Participate in mobile test case creation and validation for reliable deployment on various mobile devices.

## Best Practices

- Leverage `useIsMobile` hook from `components/ui/use-mobile.ts` or `resume/components/ui/use-mobile.ts` to detect mobile environments consistently.
- Utilize the shared `cn` utility function for className concatenation to maintain styling consistency and reduce redundancy.
- Prefer composition of atomic UI components that easily adapt or extend for mobile views, e.g., Tabs, Sheet, Tooltip.
- Maintain a clear separation between desktop and mobile logic via hooks and conditional rendering to keep code maintainable.
- Use provided UI components in `components/ui` directory for reusable building blocks instead of creating new mobile UI patterns from scratch.
- Ensure touch-friendly interaction design: appropriate hit target sizes, gestures, and avoid hover-only interactions.
- Optimize loading performance on mobile by utilizing fallback images (`ImageWithFallback`) and configuring adaptive chart rendering (`ChartConfig`).
- Validate mobile UI changes with both unit tests and manual device testing, prioritizing critical user flows.

## Key Project Resources

- [Project README](./README.md) — Overview of the project
- [Agent Handbook](../../AGENTS.md) — Guidelines for all project agents
- [Mobile UI/UX Design Principles (Internal)] — Reference to mobile design philosophy within the team (location TBD)
- Shared utilities documentation in `components/ui/utils.ts` and `resume/components/ui/utils.ts`

## Repository Starting Points

- `components/ui/` — Core UI components and utilities with mobile detection hooks
- `resume/components/ui/` — UI components specifically for resume-related interfaces, many with mobile adaptations
- `components/figma/` & `resume/components/figma/` — Figma-driven components like `ImageWithFallback`, potentially used for responsive media

## Key Files

- `components/ui/use-mobile.ts` — Mobile detection hook implementation (`useIsMobile`)
- `resume/components/ui/use-mobile.ts` — Resume-specific mobile detection hook variant
- `components/ui/utils.ts` — Shared UI utilities including `cn` for class name management
- `components/ui/tooltip.tsx` — Mobile-friendly tooltip components with `TooltipProvider`
- `components/ui/tabs.tsx` — Tabs component, used in responsive navigation or UI segmentation
- `components/ui/sheet.tsx` — Slide-in overlay component for mobile menus or dialogs
- `components/figma/ImageWithFallback.tsx` — Responsive fallback image component handling mobile image loading gracefully
- `components/ui/chart.tsx` — Chart configuration supporting adaptive rendering on mobile screens

## Architecture Context

- **Utils Layer** (`components/ui`, `resume/components/ui`): Houses essential utilities such as the `cn` helper for dynamic classnames and the `useIsMobile` hook that abstracts device detection logic. These utilities are foundational for building responsive components.
- **Components Layer** (`components/ui`, `resume/components/ui`, `components/figma`, `resume/components/figma`): Contains UI building blocks designed with mobile adaptability. Key components provide touch-enabled interaction patterns like tooltips, overlays, tabs, and charts.
- Mobile support is integrated via hooks and utilities rather than separate mobile-only components, enabling unified UI logic with responsive behavior.

## Key Symbols for This Agent

- `useIsMobile` — Hook detecting mobile device context, controlling conditional UI adaptations.
- `cn` — Utility function used throughout for consolidating and conditional class names.
- `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` — Mobile-optimized tooltip system supporting touch interaction.
- `SheetOverlay` — Slide-in panel for mobile navigation or contextual menus.
- `ImageWithFallback` — Component that ensures images load gracefully on mobile devices with fallback sources.
- `ChartConfig` — Configurations enabling charts to adapt to screen size constraints in mobile views.

## Documentation Touchpoints

- Inline code comments for `useIsMobile` and relevant component files.
- Component usage examples in storybook or test files (if present).
- Common UI/UX guidelines referenced in the main README or internal documentation.
- Conventions for class naming and styles in `utils.ts` documentation.

## Collaboration Checklist

- [ ] Confirm mobile UI requirements and constraints with design and product teams.
- [ ] Review pull requests focusing on mobile responsiveness and usability.
- [ ] Update and maintain documentation related to mobile utilities and components.
- [ ] Capture lessons learned from mobile feature implementation for future efficiency.
- [ ] Ensure accessibility compliance on mobile devices is considered and tested.

## Hand-off Notes

Upon task completion, provide detailed notes on applied mobile patterns, any discovered device compatibility caveats, and suggestions for further mobile experience improvements. Clearly document changes to utilities or component APIs affecting mobile behavior to maintain team alignment.

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)

---

This playbook aims to empower the Mobile Specialist agent with actionable knowledge and structured workflows to enhance mobile experience across the repository’s UI ecosystem efficiently.

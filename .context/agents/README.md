# Feature Developer Playbook

## Overview

This playbook guides feature developers working on the `resume_figma` codebase to efficiently implement new features with high quality and consistency. It provides a clear understanding of the relevant files and code areas, step-by-step workflows for feature development, coding best practices derived from the codebase, and key files to reference.

---

## 1. Areas and Files of Focus

### Primary Layers and Directories
- **UI Components and Views** (core feature layer):
  - `components/ui/`
  - `resume/components/ui/`
  - `components/figma/`
  - `resume/components/figma/`

These directories contain the main building blocks for UI features such as reusable components, hooks, and specialized UI utilities.

### Key UI Components to Reference
- Hooks:
  - `useIsMobile` (in both `components/ui/use-mobile.ts` and `resume/components/ui/use-mobile.ts`): Responsive behavior
- Utility and Style Helpers:
  - `cn` function (className utility) from utils files (`components/ui/utils.ts`, `resume/components/ui/utils.ts`)
- Core UI Widgets:
  - `Tooltip` (`components/ui/tooltip.tsx`)
  - `Tabs` (`components/ui/tabs.tsx`)
  - `Switch` (`components/ui/switch.tsx`)
  - `Sidebar` (`components/ui/sidebar.tsx`)
  - `Sheet`, `Separator`, `Select`, `ScrollArea`, `Resizable`, `RadioGroup`, `Popover`, `Pagination`, `NavigationMenu`, `Menubar`, `Label`, `Input` components inside `components/ui/`

### Supporting Files and Utilities
- `components/ui/utils.ts` and `resume/components/ui/utils.ts`: General utilities (e.g., className concatenation)
- `components/figma/ImageWithFallback.tsx`: Image component with error fallback logic (useful for media display features)
- All UI primitives mentioned above for implementing consistent interaction patterns

---

## 2. Feature Development Workflow

### Step 1: Understand the Feature Requirements
- Clarify functionality, UI behavior, and data flow with product/design teams.
- Identify affected UI components and layers.
- Map new UI elements to existing reusable components if possible.

### Step 2: Explore Relevant Components
- Review existing components related to the feature.
- Check `useIsMobile` hook for responsiveness needs.
- Understand utilities like `cn` for styling and consistent className management.
- Look at sibling components for similar features to follow stylistic and behavioral patterns.

### Step 3: Scaffold New Components or Extend Existing Ones
- Create components under appropriate directories (`components/ui` or `resume/components/ui` depending on scope).
- Use existing base components (e.g., `Tabs`, `Tooltip`) to build feature UI.
- Leverage hooks (e.g., `useIsMobile`) to handle adaptive UI logic.

### Step 4: Styling and CSS
- Apply utility-first CSS approach using `cn` helper for conditional class names.
- Follow visual consistency patterns from existing components.
- Avoid inline styles and prefer reusable classNames or styled components in the codebase.

### Step 5: Implement State and Interaction Logic
- Use React hooks for component state.
- Follow event handling conventions visible in existing components.
- For complex UI states (e.g., sidebars, modals), refer to component files like `sidebar.tsx`, `sheet.tsx`.

### Step 6: Testing and Validation
- Write or update unit tests for new components/features.
- Test responsiveness using the `useIsMobile` hook.
- Perform manual interaction tests in multiple viewports and scenarios.

### Step 7: Documentation and Code Comments
- Document new components with prop descriptions and usage examples in code comments.
- Reference related UI components or hooks for easier onboarding.
- Add or update README or handbook notes if feature impacts overall architecture or UX patterns.

---

## 3. Best Practices

- **Reuse Components & Hooks:** Maximize reuse by leveraging existing UI components and hooks rather than creating duplicates.
- **Consistency:** Follow current UI and interaction paradigms established in the `components/ui` layer to maintain a cohesive user experience.
- **Utility Functions:** Use the `cn` utility for all conditional styling needs to keep className syntax clean and readable.
- **Responsiveness:** Always consider mobile behavior by using the `useIsMobile` hook to conditionally render or adjust layout.
- **Component Isolation:** Keep components focused and modular; separate presentational and logic concerns where possible.
- **Type Safety:** Adhere to existing type conventions and ensure new components have appropriate types/interfaces.
- **Error Handling:** Use fallback UI patterns seen in `ImageWithFallback` for robustness.
- **Accessibility:** Follow accessible UI patterns used in core components (e.g., aria attributes in `Tooltip`, `Tabs`).
- **Testing:** Cover new components with unit tests and ensure new UI behaviors are verified.
- **Documentation:** Maintain clear inline documentation and update agent handbook or project docs as needed.

---

## 4. Key Files and Their Purpose

| File | Description |
|-------|-------------|
| `components/ui/utils.ts` | Utility functions, including `cn` helper for classNames management |
| `components/ui/use-mobile.ts` | Custom hook to detect mobile viewport for responsive logic |
| `resume/components/ui/utils.ts` | Possibly project-specific UI utilities mirroring `components/ui/utils.ts` |
| `components/ui/tooltip.tsx` | Tooltip Provider and components, reusable for hover/tool-tip info display |
| `components/ui/tabs.tsx` | Tab navigation component for feature sub-navigation |
| `components/ui/switch.tsx` | Toggle switch component for boolean options |
| `components/ui/sidebar.tsx` | Sidebar component managing side navigation or options panel |
| `components/ui/sheet.tsx` | Modal-like slide-over panel UI component |
| `components/ui/separator.tsx` | UI separator line component for grouping |
| `components/ui/select.tsx` | Dropdown/select input component with rich keyboard navigation |
| `components/ui/scroll-area.tsx` | Scrollable container with styled scrollbars |
| `components/ui/resizable.tsx` | Panels with resize functionality for dynamic layout |
| `components/ui/radio-group.tsx` | Radio button group for exclusive selection |
| `components/ui/popover.tsx` | Popover and trigger UI patterns for contextual overlays |
| `components/ui/pagination.tsx` | Pagination navigation components |
| `components/ui/navigation-menu.tsx` | Navigation menu components |
| `components/ui/menubar.tsx` | Menubar UI components for horizontal menus |
| `components/ui/label.tsx` | Form input label component |
| `components/ui/input.tsx` | Input field components |

---

## 5. Summary

Feature developers should focus primarily on the `components/ui` and `resume/components/ui` directories, using and extending existing UI components and hooks to deliver new features following the established styling, state management, and interaction patterns.

Careful adherence to reusability, responsiveness, accessibility, and robust testing will ensure high-quality and maintainable feature implementation. Always document new work clearly and update project documentation as necessary.

---

*End of Feature Developer Playbook*

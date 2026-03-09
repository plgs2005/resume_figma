## Glossary & Domain Concepts

This glossary encapsulates fundamental project-specific terminology, domain entities, and key concepts used throughout the resume_figma project. These terms represent core abstractions, UI elements, and domain logic relevant to developers, designers, and product stakeholders involved in the development and maintenance of this system.

- **Resume**: A structured digital representation of a user's professional profile, including work experience, skills, education, and projects. The core focus of the project is generating and managing resumes with a strong integration to Figma design components.
- **Figma Component**: Reusable UI elements imported or manipulated within the project that align with Figma design system standards, enabling visual consistency and streamlined user experience.
- **UI Component**: Modular, reusable React components encapsulating user interface elements (buttons, inputs, sliders, tabs) focused on accessibility and responsiveness.
- **ChartConfig**: Configuration object defining chart properties such as type, data series, and styles, crucial for visual data representation within the UI.
- **Tooltip**: UI overlay component providing contextual help or additional information when a user hovers or focuses on elements.
- **Carousel**: Interactive UI element for cycling through a list or collection of items (e.g., project samples, images) with slide animations and pagination controls.
- **Sidebar**: Navigation panel displayed typically on the side of the interface offering access to various application sections or features.
- **Persona**: Represents typical user roles interacting with the system, guiding design and feature prioritization—e.g., job seekers utilizing resumes, recruiters reviewing profiles.
- **Type Definitions**: Typed contracts for props, state, and other data structures used throughout the TypeScript codebase to ensure type safety and developer clarity.
- **Enumerations**: Sets of named constants used to represent discrete sets of options or modes within the system, improving code readability and reducing bugs.

## Type Definitions

The project extensively uses TypeScript for type safety and maintainability. Below is a list of key exported type definitions and interfaces along with links to their source locations:

- [`ChartConfig`](components/ui/chart.tsx#L11)  
  Defines configuration options for charts displayed in UI components.
- [`CarouselApi`](components/ui/carousel.tsx#L12)  
  Interface representing API methods for carousel interaction and control.
- [`CarouselOptions`](components/ui/carousel.tsx#L14)  
  Options for customizing carousel behavior and appearance.
- [`CarouselProps`](components/ui/carousel.tsx#L17)  
  Props accepted by the carousel component to render slides and configure settings.
- [`SidebarContextProps`](components/ui/sidebar.tsx#L35)  
  Defines the context shape for sidebar state and actions management.
- [`FormFieldContextValue`](components/ui/form.tsx#L21)  
  Context interface for individual form fields within form components.
- [`FormItemContextValue`](components/ui/form.tsx#L68)  
  Context shape used for handling form item validation and state.

*Note: For full paths and detailed definitions, refer to the source files in the repository under `src/components/ui/` and `src/components/ui/` directories.*

## Enumerations

Enumerations are used across the codebase to represent fixed, discrete values with semantic meaning:

- `PaginationDirection` (likely in `src/components/ui/pagination.tsx`)  
  Defines directions for pagination controls such as `Next`, `Previous`.
- `SelectItemState` (likely in `src/components/ui/select.tsx`)  
  States for select dropdown items like `Selected`, `Disabled`.
- `CarouselPluginType` (in `src/components/ui/carousel.tsx`)  
  Enumerates types of plugins applicable to carousel behavior and extensions.

*For exact enum names, locations, and complete value lists, consult the source files indicated.*

## Core Terms

These terms appear frequently in the codebase and are critical to understanding project concepts and workflows:

- **ChartConfig**  
  *Relevance*: Enables customized chart configurations used in data visualization across resumes or dashboard components.  
  *Codebase*: `src/components/ui/chart.tsx`, `src/components/ui/chart.tsx`
- **useIsMobile**  
  *Relevance*: React hook that detects mobile viewport for responsive rendering decisions.  
  *Codebase*: `src/components/ui/use-mobile.ts`, `src/components/ui/use-mobile.ts`
- **TooltipProvider**  
  *Relevance*: Context provider facilitating tooltip display logic, ensuring consistent behavior throughout UI components.  
  *Codebase*: `src/components/ui/tooltip.tsx`
- **SidesPanelGroup**  
  *Relevance*: UI pattern for resizable panels, helping organize workspace layouts dynamically.  
  *Codebase*: `src/components/ui/resizable.tsx`
- **DropdownMenu**  
  *Relevance*: Core navigation and selection UI component enabling hierarchical menu structures.  
  *Codebase*: `src/components/ui/dropdown-menu.tsx`

## Acronyms & Abbreviations

- **API**: Application Programming Interface – defines communication contracts used across frontend and backend.  
- **UI**: User Interface – the visual elements and interactive components users engage with.  
- **Figma**: Collaborative interface design tool leveraged to source and integrate design assets.  
- **OTP**: One-Time Password – a secure verification method used in authentication flows (related to InputOTP component).

## Personas / Actors

The resume_figma project caters primarily to two user personas:

- **Job Seeker**  
  Goals: Create, customize, and export professional resumes aligned with modern design standards.  
  Pain Points: Difficulty designing resumes, lack of customizable templates, inconsistent export formats.  
  Key Workflows: Profile creation, data entry, layout adjustment, resume export.
- **Recruiter / Hiring Manager**  
  Goals: Efficiently review standardized and visually clear resumes submitted through the platform.  
  Pain Points: Inconsistent document formats, missing critical information.  
  Key Workflows: Resume receipt, filtering, comparison via integrated visualization tools.

## Domain Rules & Invariants

- **Resume Formatting Consistency**: Resumes generated must adhere to pre-defined layout rules derived from Figma design tokens ensuring consistent typography, spacing, and color usage.
- **Data Validation**: User inputs for resume fields are validated against type definitions such as strings, dates, and enumerations to prevent invalid submissions.
- **Responsive Behavior**: The UI adapts responsively based on device type detected by the `useIsMobile` hook to maintain usability across desktop and mobile platforms.
- **Component Reusability**: Core UI components follow strict interface contracts allowing them to be composed and reused across different workspace sections without behavioral regressions.
- **Localization Aware**: While primarily English, text components support future localization, ensuring formatting and layout can accommodate length variations.

## Related Resources

- [project-overview.md](./project-overview.md)  
  Provides a high-level summary of the project, architecture principles, and design rationale which complement this glossary documentation.

---

This glossary document serves as an essential resource for onboarding developers and stakeholders by clarifying linguistic conventions, key technical constructs, and systemic constraints inherent to the resume_figma project.

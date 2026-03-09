## Project Overview

The Resume Figma project streamlines the creation and management of visually appealing, customizable resumes through a seamless integration with Figma's design environment. It empowers designers, developers, and job seekers to efficiently build, preview, and export professional resumes, bridging the gap between design and practical resume generation.

## Codebase Reference

> **Detailed Analysis**: For complete symbol counts, architecture layers, and dependency graphs, see [`codebase-map.json`](./codebase-map.json).

## Quick Facts

- Root: `/home/plgsa/resume_figma`
- Languages: TypeScript (approximately 150 files)
- Entry: `src/main.tsx`
- Full analysis: [`codebase-map.json`](./codebase-map.json)

## Entry Points

- [`src/main.tsx`](../src/main.tsx#L1) — Application bootstrap and React root component entry.
- [`src/cli.ts`](../src/cli.ts#L1) — Command-line interface utilities and commands (if exists).
- [`src/components/ui/index.ts`](../components/ui/index.ts#L1) — Main exports for UI components and utilities.

## Key Exports

Please refer to [`codebase-map.json`](./codebase-map.json) for a comprehensive list of key exports including critical utility functions like `cn` (class name helper), hooks such as `useIsMobile`, and components including `ChartConfig` and `ImageWithFallback`.

## File Structure & Code Organization

- `src/` — Core application source code, including React application entry and Figma integration logic.
- `src/components/ui/` — Reusable UI components and utility functions shared across the project.
- `src/components/figma/` — Components and utilities dealing directly with Figma API and design aspects.
- `docs/` — Project documentation files.
- `tests/` — Automated tests and fixture data.

## Technology Stack Summary

This project primarily uses **TypeScript** for type-safe frontend and utility development, running on the **Node.js** platform and leveraging **React** for building interactive UI components. The build and development process uses modern tooling with bundlers such as **Vite** and TypeScript compilers, complemented by linting and formatting with **ESLint** and **Prettier** to ensure code quality and consistency.

## Core Framework Stack

The frontend architecture relies heavily on **React** with a component-driven design. State management and hooks (e.g., `useIsMobile`) are used for responsiveness and UI logic. The integration layer interfaces closely with the **Figma API**, facilitating real-time document manipulation aligned with design system principles.

## UI & Interaction Libraries

UI components adopt a modular and accessible design, incorporating reusable elements like tooltips, tabs, switches, and dropdowns, built from scratch within `src/components/ui/`. The library emphasizes responsive behavior, theming consistency, and accessibility, providing a foundation for both desktop and mobile interactions. Keyboard navigation and ARIA support are implicitly supported via composable UI primitives.

## Development Tools Overview

Development is streamlined with a set of NPM scripts covering tasks such as dependency installation, local development server, and builds. The environment is configured for fast iteration using **Vite**'s hot module replacement. Additional documentation on setup and workflows is available in the linked `tooling.md` and `development-workflow.md` guides.

## Getting Started Checklist

1. Clone the repository and navigate to `/home/plgsa/resume_figma`.
2. Install dependencies with `npm install`.
3. Start the development server by running `npm run dev`.
4. Explore the UI by opening the app in a browser as indicated by the server output.
5. Review the `development-workflow.md` document to understand contribution guidelines and day-to-day practices.
6. Run automated tests via `npm test` to verify setup.

## Next Steps

This project is positioned as a cutting-edge tool for resume design and export, catering primarily to designers and developers looking to accelerate resume creation workflows. Key stakeholders include the core development team and product managers. For deep dives on product features and future enhancements, refer to the product specifications and roadmap documents stored externally.

## Related Resources

- [architecture.md](./architecture.md)
- [development-workflow.md](./development-workflow.md)
- [tooling.md](./tooling.md)
- [codebase-map.json](./codebase-map.json)

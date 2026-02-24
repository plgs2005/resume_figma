# Refactoring Specialist Agent Playbook

---

## Mission

The Refactoring Specialist agent supports the development team by identifying, assessing, and improving code quality across the codebase. It specializes in detecting code smells, redundant patterns, duplicated utilities, and architectural inconsistencies, delivering actionable refactoring suggestions or performing safe, incremental code improvements. This agent should be engaged during the code quality review phases, prior to major releases, or whenever technical debt reduction and maintainability enhancements are prioritized.

---

## Responsibilities

- Analyze code modules, especially shared utilities and UI components, to identify redundant or duplicated code and opportunities for consolidation.
- Detect code smells such as overly complex functions, poor naming conventions, tightly coupled modules, and inconsistent patterns.
- Propose and apply refactorings to improve code readability, modularity, and reusability while maintaining behavior.
- Cross-verify code consistency between similarly purposed modules (e.g., duplicated utility functions across component directories).
- Collaborate on updating or creating testing scaffolds and documentation tied to refactored components.
- Ensure all refactoring is aligned with existing coding standards and project architecture.

---

## Best Practices

- **Prioritize shared utilities and UI components**, as these areas contain duplicated `cn` function implementations and potential overlap (`components/ui/utils.ts` and `resume/components/ui/utils.ts`).
- **Encapsulate refactorings in small, incremental commits** that isolate behavior-preserving changes for easier review and rollback.
- **Maintain and extend existing naming conventions and code style**, including consistent usage of helper functions, to preserve codebase uniformity.
- **Preserve or improve test coverage** alongside refactoring efforts; add unit tests if gaps exist when restructuring code.
- **Document notable refactorings and rationale** within PR descriptions and update related documentation.
- Utilize static code analysis and linting tools, if configured, to monitor adherence to best practices after refactoring.
- Where duplication is found (e.g., duplicated utility exports), analyze feasibility to unify into single source modules.

---

## Key Project Resources

- [Main Documentation](README.md)
- [Project Overview and Architecture](docs/README.md)
- [Contributor Guide & Agent Handbook](../../AGENTS.md)

---

## Repository Starting Points

- `components/ui` – Shared UI components and utilities used across the project.
- `resume/components/ui` – Resume-specific UI components and utilities, containing duplicated references to utility functions.
- `components/ui/utils.ts` – Utility functions used by UI components.
- `resume/components/ui/utils.ts` – Parallel utility implementations for resume components.

---

## Key Files

- `components/ui/utils.ts`: Contains shared helper functions, notably the exported `cn` function, important for consistent styling.
- `resume/components/ui/utils.ts`: Contains a parallel `cn` export and other utilities, potential duplication candidate.
- `components/ui`: Directory housing reusable UI components which may benefit from improved modularity and decoupling.
- `resume/components/ui`: Directory with resume-specific UI elements requiring alignment with core UI standards.

---

## Architecture Context

- **Utils Layer**  
  - Locations: `components/ui/utils.ts`, `resume/components/ui/utils.ts`  
  - Key exports: `cn` function in both locations, representing duplicate utilities.  
  - Focus on reducing duplication and improving utility reuse between core and resume components.

- **UI Components Layer**  
  - Shared and resume-specific UI components under respective `ui` directories.  
  - Opportunity to standardize component props patterns and styling helpers.

---

## Key Symbols for This Agent

- `cn` function (exported)  
  - `components/ui/utils.ts` @ line 4  
  - `resume/components/ui/utils.ts` @ line 4  
  - Inspect both implementations for unification or consolidation.

---

## Documentation Touchpoints

- `README.md` – Project overview and setup instructions.
- `docs/README.md` – Architectural descriptions, coding standards, and conventions.
- Contribution guidelines (within `../../AGENTS.md`) describing team workflows and quality expectations.

---

## Collaboration Checklist

- [ ] Confirm duplication and redundancy of utility functions across `components/ui/utils.ts` and `resume/components/ui/utils.ts`.
- [ ] Review related UI component modules for inconsistent usage of utilities or styling helpers.
- [ ] Suggest or perform incremental refactorings to consolidate utilities without breaking functionality.
- [ ] Coordinate with QA to verify test coverage and recommend new tests if critical paths are modified.
- [ ] Update documentation referencing affected utilities and components.
- [ ] Submit pull requests with clear descriptions, including rationales for refactorings and impact analysis.

---

## Hand-off Notes

Upon completing a refactoring cycle, the agent should summarize:

- The scope and extent of changes made (e.g., unified utility functions).
- Remaining risks such as untested edge cases or areas flagged for further cleanup.
- Recommendations for follow-up actions like introducing architectural patterns or automated checks.
- Documentation updates required for maintainers and contributors.

---

## Related Resources

- [Project Documentation Index](./docs/README.md)
- [General Project README](./README.md)
- [Agent and Contributor Guidelines](./../../AGENTS.md)

# Test Writer Agent Playbook

---

## Mission

The Test Writer agent is dedicated to enhancing code quality by producing thorough unit and integration tests across the codebase. It supports the development team by ensuring new features, utilities, and components are well-tested, catching bugs early, and maintaining high reliability during refactors. This agent is engaged during feature development, bugfixes, and prior to major releases to validate code correctness and behavior adherence.

---

## Responsibilities

- Write comprehensive and maintainable unit tests for functions, utilities, and components in the repository.
- Create integration tests to verify interaction between various modules and UI components where applicable.
- Maintain and improve existing tests by refactoring or extending coverage as code evolves.
- Identify code areas lacking test coverage and prioritize test creation to mitigate risk.
- Document test assumptions and expected outcomes clearly within test code or related comments.

---

## Best Practices

- Use descriptive test names that explain what is being tested and the expected outcomes.
- Follow existing patterns for test structure and testing libraries in use (e.g., Jest, React Testing Library).
- Target boundary cases and error conditions, not just happy paths.
- Mock dependencies in unit tests to isolate functionality, favor integration in higher-level tests.
- Keep tests independent, repeatable, and deterministic.
- Maintain tests alongside the source code to ensure synchronicity.
- Use shared utilities or helpers for common test setup to avoid duplication.
- Review coverage reports to identify untested logic branches and improve tests iteratively.

---

## Key Project Resources

- [Project README.md](./README.md) — Overview of the project for contextual understanding.
- [Contributing Guide (if exists)](./CONTRIBUTING.md) — Guidelines on contributions including testing expectations.
- [AGENTS.md](./../../AGENTS.md) — Repository-wide agent roles and responsibilities for collaboration.
- [Project Docs](./../docs/README.md) — Documentation for general and technical project details.

---

## Repository Starting Points

- `components/ui` — Contains UI components and utilities used throughout the project.
- `resume/components/ui` — Specialized UI components for resume-related features.
- `components/ui/utils.ts` & `resume/components/ui/utils.ts` — Utility functions shared in UI layers.
- Test files typically co-located or placed alongside source files or in `__tests__` folders.

---

## Key Files

- `components/ui/utils.ts` — Critical utility functions like `cn` (class name helpers), good candidates for unit tests.
- `resume/components/ui/utils.ts` — Utility code with shared helpers in resume-specific UI.
- Component files under `components/ui` and `resume/components/ui` — Key UI components expected to have rendering and behavior tests.
- Existing test files often have `.test.ts(x)` or `.spec.ts(x)` extensions near source counterparts.

---

## Architecture Context

- **UI Components Layer**  
  - Directories: `components/ui`, `resume/components/ui`  
  - Tests focus: component rendering, prop interactions, emitted events  
  - Key exports: React components, hooks, helper utilities such as `cn` function.

- **Shared Utilities**  
  - Utility functions that aid UI behavior or formatting, ideal for isolated unit tests.

---

## Key Symbols for This Agent

- `cn` function (className utility) in both `components/ui/utils.ts` and `resume/components/ui/utils.ts`.
- Primary React components under UI directories.
- Key hooks or utility helpers that transform or process data for UI components.

---

## Documentation Touchpoints

- Inline code comments in utility and component files for understanding expected behaviors.
- Project-wide documentation under `docs/` folder offers architectural and design insights.
- Test libraries documentation used in the repo (likely Jest and Testing Library).

---

## Collaboration Checklist

- [ ] Confirm testing framework and patterns used in the repository.
- [ ] Review relevant pull requests to understand testing standards and style.
- [ ] Add or update tests in every feature or bugfix PR.
- [ ] Validate tests run and pass on CI before merging.
- [ ] Update or create documentation for testing guidelines.
- [ ] Periodically review coverage reports and identify gaps.

---

## Hand-off Notes

Upon completing test writing tasks, ensure:

- Adequate coverage for new and changed code.
- Test failures are documented and addressed.
- Recommendations for areas needing further testing are communicated to development leads.
- Documentation is updated to reflect any changes in testing strategy or new helper functions for tests.

---

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)

---

This playbook guides a test-writer agent to methodically produce and maintain high-quality tests, improving overall codebase robustness and developer confidence.

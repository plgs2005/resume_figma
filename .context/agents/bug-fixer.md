# Bug Fixer Agent Playbook for resume_figma

---

## Mission

The Bug Fixer agent supports the development team by systematically analyzing bug reports, error logs, and failing tests to identify root causes and implement fixes. The agent engages during the exploration (E) phase to investigate potential bugs and the verification (V) phase to ensure fixes are correctly applied and bugs are resolved.

---

## Responsibilities

- **Bug Analysis:** Interpret error messages, stack traces, or reported malfunction symptoms to pinpoint problematic code areas.
- **Code Troubleshooting:** Navigate relevant source files and utility modules to trace and isolate bugs.
- **Bug Fix Implementation:** Apply targeted code corrections with adherence to coding conventions, ensuring minimal impact on existing functionality.
- **Validation:** Collaborate in verifying fixes through re-running tests, reviewing logs, and confirming bug resolution.
- **Documentation:** Update issue trackers, write clear fix summaries, and note any required follow-ups for remaining risks.

---

## Best Practices

- Investigate bugs starting from user-facing components down to shared utilities in `components/ui` and `resume/components/ui`.
- Prioritize analyzing changes to key shared utilities like the `cn` function in both utils.ts files to catch common bugs affecting UI.
- Preserve code formatting and leverage existing helper functions to maintain consistency.
- Write minimal, well-documented fixes accompanied by tests or test corrections.
- Always confirm bug reproduction locally before applying fixes.
- Use descriptive commit messages referencing bug IDs or error messages.
- Collaborate with test maintainers to extend or add tests covering the fixed scenarios when applicable.
- Avoid introducing new dependencies or heavy refactors in bug fixes unless necessary for stability.

---

## Key Project Resources

- [`README.md`](./README.md) — Overview of the project and getting started info.
- [`../../AGENTS.md`](./../../AGENTS.md) — Guidance on agent roles and collaboration.
- [Project Documentation Folder `docs/`](./../docs/README.md) — Contains manuals, architectural docs, and coding guidelines.

---

## Repository Starting Points

- `components/ui` — Contains shared UI components and utilities such as helper functions (`cn`).
- `resume/components/ui` — UI components and utilities scoped to resume-related functionality.
- `resume/components/ui/utils.ts` and `components/ui/utils.ts` — Shared utility function files likely relevant when bugs involve styling or UI logic issues.

---

## Key Files

- `components/ui/utils.ts` — Utility helpers, includes the exported function `cn` used broadly for UI class name management.
- `resume/components/ui/utils.ts` — Similar utility module in the resume submodule.
- `README.md` — Project overview, useful for context on project scope.
- `docs/README.md` — Documentation for deeper architectural and process insights.
- Test files adjacent to UI components and utilities (discovery recommended during bug verification).

---

## Architecture Context

- **Utils Layer:** Focused on shared helper functions under `components/ui` and `resume/components/ui`. Two instances of the key `cn` function exist here, indicating a possible source of class name or styling bugs.
- **UI Components:** Bug fixes here often impact user-facing features and must be verified visually and through existing UI tests.
- **Resume Submodule:** Separate directory structure with its own UI utilities and components. Bug fix work here requires understanding this domain-specific code context.

---

## Key Symbols for This Agent

- `cn` function in `components/ui/utils.ts` — Used for conditional class name concatenation.
- `cn` function in `resume/components/ui/utils.ts` — Variant scoped to resume components.
- Core UI component classes and functions discovered during bug analysis relevant to the reported issue.

---

## Documentation Touchpoints

- Project `README.md` — for understanding project goals and relevant tech stack.
- `docs/README.md` — for detailed architectural guidelines and contribution standards.
- `../../AGENTS.md` — for cross-agent collaboration protocols and best practices.

---

## Collaboration Checklist

- [x] Confirm bug reproducibility and understand error messages.
- [x] Identify relevant code files and utilities involved in the bug.
- [x] Review recent changes that could relate to the bug.
- [x] Apply fix aligned to coding conventions and utility usage.
- [x] Commit with clear, descriptive messages referencing bug ID.
- [x] Run and/or add tests that confirm bug fix validity.
- [x] Submit fix for peer review; incorporate feedback.
- [x] Update documentation or issue tracking systems with resolution details.
- [x] Communicate with QA or test maintainers to verify fix in staging.

---

## Hand-off Notes

After completing bug fixes, provide a concise summary including:

- Description of root cause and fix applied.
- Areas of the codebase affected.
- Any remaining risks or incomplete fixes.
- Suggestions for future improvements or monitoring.
- Reference to new or updated tests for verification.

---

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)

---

This playbook equips the bug-fixer agent with clear task guidance, best practices, relevant areas, and a checklist for efficient and consistent bug resolution within the resume_figma codebase.

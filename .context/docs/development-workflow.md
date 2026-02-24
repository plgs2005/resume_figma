## Development Workflow

The day-to-day engineering process in this repository revolves around maintaining high code quality, ensuring feature completeness, and promoting smooth collaboration among the development team. Engineers typically follow this process:

1. **Planning & Issue Tracking**  
   New features, bug fixes, or improvements are tracked using the project’s issue tracker. Each piece of work begins with an issue or ticket that details the scope and acceptance criteria.

2. **Branch Creation**  
   Developers create a feature branch off the main development branch following the branching conventions outlined below (see Branching & Releases).

3. **Development & Local Testing**  
   Code is written in incremental commits with clear, concise messages. Developers run the local development environment to verify functionality. Unit and component tests should be added or updated as appropriate.

4. **Code Review & Collaboration**  
   Upon completion, developers create a pull request. Peers review the changes according to the code review expectations detailed below. Feedback is addressed promptly to maintain rapid iteration.

5. **Continuous Integration & Automated Testing**  
   Once the pull request passes reviews, automated CI checks and tests run to prevent regressions.

6. **Merge & Deploy**  
   Approved pull requests are merged into the main branch. Deployments follow the release cadence and procedures described below.

Through this workflow, the repository ensures code quality, stability, and continuous delivery of new features.

## Branching & Releases

- **Branching Model:** This repository uses a trunk-based development approach with a primary `main` branch. Feature development occurs on short-lived branches branched off `main`.
- **Feature branches:** Named as `feat/<issue-number>-short-description` or `fix/<issue-number>-short-description`.
- **Release Cadence:** Releases are deployed continuously from `main` after successful merges and passing CI pipelines. There are no long-lived release branches.
- **Tagging Conventions:**  
  - Semantic version tags (e.g., `v1.2.3`) are applied on main branch commits used for releases.
  - Pre-release tags (e.g., `v1.3.0-beta.1`) may be used for beta releases if applicable.

This setup encourages incremental delivery and fast feedback cycles.

## Local Development

To set up a local development environment and build the project, use the following commands:

- Install dependencies:  
  ```bash
  npm install
  ```
- Run the development server locally with hot-reloading:  
  ```bash
  npm run dev
  ```
- Build the project for production distribution:  
  ```bash
  npm run build
  ```
- Run tests (unit and integration):  
  ```bash
  npm test
  ```

These commands can be run from the repository root directory.

## Code Review Expectations

Code reviews are a critical part of maintaining code quality and shared understanding. When reviewing or submitting pull requests, please follow these guidelines:

- **Correctness:** Verify that the changes address the problem as described and do not introduce bugs.
- **Readability:** Ensure the code is clear and consistent with the project’s style and design patterns.
- **Testing:** Confirm appropriate tests are included or updated, and that they pass.
- **Documentation:** Check for updates to relevant documentation if behavior or APIs change.
- **Security & Performance:** Watch for potential security issues or performance regressions.
- **Approval Requirements:** At least one approval from a team member experienced with the affected area is required before merging.

For guidance on collaborating with automation agents and handling automated suggestions, please refer to the [AGENTS.md](./AGENTS.md) document.

## Onboarding Tasks

For new developers joining the project, the following onboarding tasks are recommended:

- Review this development workflow documentation.
- Familiarize yourself with the project's structure, especially key UI components and utility modules.
- Start by picking issues labeled **"good first issue"** or **"starter"** in the issue tracker.
- Set up your local environment following the **Local Development** section above.
- Consult internal runbooks and dashboards for deployment and operational processes (contact your team lead for access).
- Join developer meetings and pair programming sessions to accelerate learning.

This gradual onboarding ensures a smooth ramp-up while contributing valuable fixes and features early.

## Related Resources

- [testing-strategy.md](./testing-strategy.md) — Covers tests architecture, coverage expectations, and running tests.
- [tooling.md](./tooling.md) — Describes development tools, linters, and build system setup.

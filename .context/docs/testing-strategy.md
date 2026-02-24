# Testing Strategy

Maintaining high quality throughout the codebase is achieved by adopting a rigorous testing strategy that covers different layers of the application, automated testing pipelines, and enforceable quality gates. Our approach emphasizes early detection of defects, prevention of regressions, and ensuring that new contributions meet established standards.

We leverage automated testing frameworks integrated with continuous integration (CI) workflows to run tests on every commit and pull request. This guarantees that code changes are continuously validated across unit, integration, and end-to-end levels. Additionally, linting and formatting tools help maintain code consistency, reducing technical debt and improving readability.

By requiring minimum test coverage thresholds and enforcing quality gates before merges, we keep technical quality high and reduce the risk of bugs reaching production. This structured approach encourages clear, maintainable, and reliable software development.

# Test Types

- **Unit**:
  - Framework: [Jest](https://jestjs.io/)
  - Description: Tests individual functions or components in isolation to ensure expected behavior.
  - File naming convention: `*.test.ts`, `*.test.tsx`
  - Tooling: Jest runner with built-in mocking and assertion capabilities.
  
- **Integration**:
  - Framework: [Jest](https://jestjs.io/) combined with libraries like React Testing Library for UI component interaction tests.
  - Description: Verify the interaction between multiple components or modules, such as API integration, form submission workflows, and component composition scenarios.
  - File naming convention: `*.integration.test.ts`, `*.integration.test.tsx`
  - Tooling: Jest with React Testing Library to simulate user interactions and test real data flows.
  
- **E2E (End-to-End)**:
  - Framework: [Cypress](https://www.cypress.io/) or equivalent
  - Description: Tests simulate real user scenarios against a running instance of the application, covering critical workflows like user authentication, navigation, and complex UI flows.
  - File naming convention: Organized under `/e2e` or `/cypress/integration/` directories following Cypress conventions.
  - Tooling: Cypress test runner with browser automation, video recording, and time-travel debugging.

# Running Tests

- Run all tests (unit + integration):
  ```bash
  npm run test
  ```
- Run tests in watch mode (re-run tests on file changes):
  ```bash
  npm run test -- --watch
  ```
- Generate and view test coverage report:
  ```bash
  npm run test -- --coverage
  ```
- Run E2E tests locally (example with Cypress):
  ```bash
  npm run e2e
  ```
- Open E2E test runner UI interactively:
  ```bash
  npm run e2e:open
  ```

# Quality Gates

- **Coverage thresholds**:
  - Minimum 80% line coverage across the overall codebase.
  - At least 75% coverage on branches and functions to ensure critical execution paths are tested.
- **Linting and formatting**:
  - Code must pass ESLint checks with zero errors.
  - Code must comply with Prettier formatting rules.
- **Pull requests**:
  - All tests must pass before merging.
  - Code reviews enforce testing scope and quality.
  - No new warnings or errors in test or build logs.
- **Flaky tests**:
  - Tests identified as flaky must be either fixed or quarantined before merging.
- **CI enforcement**:
  - Quality gates are integrated into the CI pipeline to block merges failing any criteria.

# Troubleshooting

Some test suites occasionally experience flakiness due to timing issues with async operations or external API dependencies. When encountering intermittent test failures:

- Retry the tests to confirm whether the failure is consistent.
- Ensure the latest dependencies and environment setup are used.
- Check for environment quirk explanations in CI logs, such as network delays or resource constraints.
- Utilize Jest’s `--runInBand` to run tests serially if concurrency causes conflicts.
- Mock external APIs to reduce dependencies on unreliable network conditions.
- Report persistent flaky tests to the team for investigation and remediation.

Long-running tests, especially in E2E suites, can be optimized by limiting browser sessions or targeting focused scenarios. Developers should use test filtering and selective runs to maintain rapid feedback loops during development.

# Related Resources

- [Development Workflow](./development-workflow.md) – Describes branch strategy, commit process, and CI/CD pipeline details.

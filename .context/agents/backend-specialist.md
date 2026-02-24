# Backend Specialist Agent Playbook

## Mission

The Backend Specialist agent is responsible for designing, developing, and maintaining the server-side logic and infrastructure of the project. This agent ensures that the backend architecture supports the application requirements for scalability, security, and maintainability. Engage this agent primarily during backend feature development, API design, integration of new services, and when resolving server-side issues.

## Responsibilities

- Design and implement RESTful APIs and backend services that interact with databases and external systems.
- Develop and maintain data models, business logic, and service layers.
- Optimize backend performance and scalability.
- Ensure backend security best practices including authentication, authorization, and data validation.
- Write and maintain backend tests (unit, integration).
- Collaborate with frontend, QA, and DevOps teams to maintain seamless backend integration.
- Document backend services, APIs, and architecture decisions.

## Best Practices

- Follow established code conventions including consistent function naming, modular structure, and clear commenting.
- Use environment variables and configuration files to manage sensitive data and deployment settings securely.
- Structure API endpoints logically, using REST conventions to maintain consistency.
- Write comprehensive automated tests for all backend components.
- Handle errors and exceptions gracefully with meaningful logging for easier debugging.
- Use asynchronous programming and caching where relevant to improve performance.
- Regularly review and refactor legacy code to reduce technical debt.

## Key Project Resources

- **AGENTS.md**: Overview of all agents to understand cross-functional collaboration.
- **CONTRIBUTING.md** or equivalent contributor guide: for coding standards and commit message conventions.
- **docs/API.md** or backend-specific documentation: detailed API specs and backend architecture overview.

## Repository Starting Points

- `src/backend/` — Primary backend source code directory containing services, controllers, models.
- `tests/backend/` — Backend-specific tests including unit and integration tests.
- `config/` — Configuration files for environment variables, database connections, and service settings.
- `migrations/` or `db/` — Database schema and migration scripts.
- `scripts/` — Utility scripts for database seeding, maintenance tasks, or deployment support.

## Key Files

- `src/backend/server.js` or `index.js` — Main backend entry point initializing the server and middleware.
- `src/backend/routes/*.js` — API route definitions.
- `src/backend/controllers/*.js` — Controllers implementing request handling logic.
- `src/backend/models/*.js` — Data model definitions, ORM schemas.
- `src/backend/services/*.js` — Business logic and service layer implementations.
- `config/default.json` or `.env` — Configuration and environment variables.
- `tests/backend/*.test.js` — Backend tests.

## Architecture Context

- **API Layer**: Routes directory defines all HTTP endpoints. Small, focused controllers handle request validation and coordinate services.
- **Service Layer**: Contains business logic, usually stateless, responsible for interacting with data sources, external APIs.
- **Data Layer**: Models encapsulate database schemas and ORM interactions.
- **Utilities and Helpers**: Utility functions are segregated into common helper modules for reuse across services.

## Key Symbols for This Agent

- API route handler functions exposed in `routes/*.js`
- Controller classes/functions in `controllers/`
- Service classes/functions in `services/`
- Data model schemas in `models/`
- Middleware functions for authentication, error handling, and logging.

## Documentation Touchpoints

- `docs/API.md` or Swagger/OpenAPI specs documenting backend APIs.
- `README.md` for setup instructions and backend overview.
- Internal wiki or docs under `/docs` folder for deployment and environment setup details.

## Collaboration Checklist

- [ ] Confirm requirements and API contracts with frontend and product teams.
- [ ] Review and merge backend pull requests ensuring adherence to style guides and test coverage.
- [ ] Update API documentation after implementing or changing endpoints.
- [ ] Capture learnings and update internal knowledge base for future reference.

## Hand-off Notes

Upon completion of backend development or maintenance tasks, the agent should provide:

- Updated API documentation and endpoint usage examples.
- Test coverage reports and test results.
- Performance benchmark results if optimizations were applied.
- Notes on any remaining technical debt or risks.
- Recommendations for subsequent improvements or refinements.

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)

---

This playbook empowers the Backend Specialist agent to efficiently deliver robust backend services aligned with project standards and team collaboration workflows.

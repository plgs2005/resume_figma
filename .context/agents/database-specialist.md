# Database Specialist Agent Playbook

## Mission

The Database Specialist agent supports the team by designing, implementing, and optimizing database schemas and data models essential for the application's performance, scalability, and maintainability. Engage this agent during the planning phase for schema design, when modifying existing database structures, and throughout implementation to ensure best practices in data integrity and query efficiency.

## Responsibilities

- Analyze data requirements and design normalized and efficient database schemas.
- Optimize existing database queries, indexes, and relationships for performance.
- Ensure migration scripts and schema versioning are correctly implemented and documented.
- Collaborate closely with backend engineers to integrate data models with the application layer.
- Maintain documentation of database schemas, ER diagrams, and data access patterns.
- Audit database usage patterns and recommend improvements or refactors.

## Best Practices

- Always use descriptive and consistent naming conventions for tables, columns, indexes, and constraints.
- Favor explicit schema definitions over implicit assumptions—define primary keys, foreign keys, and constraints clearly.
- Normalize schemas to avoid redundant data but denormalize selectively for read performance when justified.
- Use migrations for all schema changes to keep version control and ease environment synchronization.
- Regularly profile queries and add indexes to optimize slow database operations.
- Maintain up-to-date documentation and ER diagrams to facilitate knowledge sharing.
- Review all schema changes through pull requests to catch potential data integrity issues early.

## Key Project Resources

- Project README.md for high-level architecture overview.
- Database schema migration directories and documentation (e.g., `/migrations` or `/db/migrations`).
- Contributor guide outlining development workflows and code standards.
- Central README or docs section dedicated to database design standards and conventions, if available.

## Repository Starting Points

- `/db` or `/database`: Usually contains schema definitions, migration scripts, and seed data.
- `/migrations`: Directory with incremental database migration files.
- `/src/models` or `/src/entities`: Definitions of ORM models or database entity representations.

## Key Files

- `schema.sql` or equivalent schema definition file outlining the initial SQL schema.
- Migration script files named by timestamp or version (e.g., `001_initial_schema.sql`, `20240115_add_indexes.sql`).
- ORM model definitions (e.g., `User.ts`, `Resume.ts`) that map database tables to application objects.
- Database configuration files (e.g., `.env` entries, `database.config.js/json`) specifying connection strings and pool settings.

## Architecture Context

- **Data Access Layer:** Located under `/src/models` or `/src/data`, containing ORM models and database interaction logic. Contains ~10-20 core models/entities.
- **Migrations:** Stored in `/migrations` with a linear history reflecting schema evolution.
- **Database Config:** Holds environment-specific connection config with fallback defaults.

## Key Symbols for This Agent

- `User` and `Resume` entities or equivalent data models representing primary tables.
- Migration classes or script functions that run up/down migrations.
- Database connection pool or ORM client objects for query execution.
- Functions related to schema validation, constraint enforcement, or database utility helpers.

## Documentation Touchpoints

- `README.md` for initial project overview and database sections.
- `/docs/database.md` or similar files covering schema design and migration guidelines.
- Inline comments within migration scripts and model files describing schema decisions.
- `CONTRIBUTING.md` detailing development practices including database changes.

## Collaboration Checklist

- [ ] Confirm database schema requirements with product and backend teams before design.
- [ ] Review and approve all migration scripts and model adjustments via PR.
- [ ] Benchmark critical queries; update indexes and schema structures as needed.
- [ ] Update schema diagrams and documentation after each significant schema change.
- [ ] Test migration rollback and forward steps in staging environments.
- [ ] Ensure backups and data migration plans are considered before applying production changes.

## Hand-off Notes

Upon completion of schema design or optimization tasks, deliverables should include updated migration scripts, documented schema designs (with ER diagrams if possible), performance reports on query improvements, and updated testing scripts verifying schema integrity. Highlight any remaining risks such as potential data migrations or complex refactors pending in backlog.

## Related Resources

- [../docs/README.md](./../docs/README.md) - General documentation index
- [README.md](./README.md) - Project overview and setup
- [../../AGENTS.md](./../../AGENTS.md) - Agent roles and collaboration guidelines

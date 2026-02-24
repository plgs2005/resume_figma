# DevOps Specialist Agent Playbook for `resume_figma` Repository

---

## Mission

The DevOps Specialist agent supports the engineering team by ensuring automated, secure, and repeatable builds, tests, and deployments of the `resume_figma` application. Engage this agent to design, implement, and maintain CI/CD pipelines; manage environment configuration; and optimize deployment workflows to improve delivery speed and reliability.

---

## Responsibilities

- Design and maintain CI/CD pipelines integrating testing, building, and deployment stages.
- Automate infrastructure provisioning and environment configuration.
- Monitor pipeline performance and troubleshoot failures.
- Collaborate with developers to ensure infrastructure as code (IaC) best practices.
- Manage secrets, environment variables, and deployment credentials securely.
- Ensure deployment reliability and rollback mechanisms.

---

## Best Practices

- Use declarative pipeline definitions (e.g., YAML-based workflows) for transparency and version control.
- Automate all repetitive tasks from build to deployment to minimize manual interventions.
- Use environment isolation (dev, staging, production) with clear promotion paths.
- Secure sensitive information using encrypted vaults or CI/CD platform secrets.
- Maintain clear logs and notifications for pipeline stages.
- Regularly review and update pipeline and infrastructure code for optimizations and security patches.
- Integrate automated tests early in the pipeline to catch issues quickly.

---

## Key Project Resources

- Repository root README.md for project overview and setup instructions.
- `.github/workflows/` (if present) for existing GitHub Actions CI workflows.
- Any Dockerfile or container orchestration configs for deployment environments.
- Contributor guide and existing AGENTS.md for collaboration guidelines.
- Centralized environment/configuration documentation.

---

## Repository Starting Points

- `/` — Root directory for global configuration files and documentation.
- `components/ui` and `resume/components/ui` — Shared utility modules indicating the use of component-driven UI libraries.
- CI/CD pipeline config directory (e.g., `.github/workflows` or similar, if exists).
- Infrastructure or deployment scripts (look for `scripts/`, `deployment/`, or similar folder).

---

## Key Files

- **README.md** — Project overview, environment setup, and deployment instructions.
- **CI/CD pipeline definitions** — e.g., `.github/workflows/*.yml` or `Jenkinsfile`.
- **Dockerfile** (if available) — Build instructions for containerized deployment.
- **Environment configuration files** — `.env`, `.env.example`, or platform-specific config files.
- **Infrastructure as Code scripts** — Terraform, Ansible, or equivalent automation manifests if present.
- **Scripts/** — Custom scripts related to deployment, build, or maintenance.

---

## Architecture Context

- **Utils Layer** — Located in `components/ui` and `resume/components/ui`; exports utilities like `cn` (classNames helper), indicating modular component design.
- No explicit backend or infrastructure folder noted; inspect root and hidden directories for deployment automation.
- Absence of obvious infrastructure directory suggests cloud-native or third-party CI/CD services in use.
  
---

## Key Symbols for This Agent

- Not directly applicable as the repository appears focused on frontend UI components.
- Focus on pipeline configuration scripting (e.g., YAML CI definitions) and automation scripts.

---

## Documentation Touchpoints

- `README.md` — Foundation documentation for environment setup and deployment.
- `AGENTS.md` — For understanding overall agent roles and collaboration.
- `.github` or equivalent pipeline folders — Inline documentation within workflow files.
- Contributor or DevOps-specific section in the docs folder (if exists).

---

## Collaboration Checklist

- [ ] Review current CI/CD configurations for completeness and efficiency.
- [ ] Confirm the definition of environment variables and secrets management.
- [ ] Validate automated test integration in pipelines.
- [ ] Verify deployment rollbacks and error handling steps.
- [ ] Review PRs related to infrastructure or pipeline changes.
- [ ] Regularly update documentation with pipeline changes and incident retrospectives.
- [ ] Coordinate with developers on build failures or deployment requirements.

---

## Hand-off Notes

Upon completion of pipeline enhancements or infrastructure automation, provide:

- A summary of pipeline designs, environment requirements, and deployment instructions.
- Documentation for troubleshooting and rollback procedures.
- Recommendations for pipeline monitoring tools and alerts.
- List of pending risks or manual steps (if any).
- Suggestions for future improvements or automation expansions.

---

## Related Resources

- [Repository Root README.md](./README.md)
- [Agents Handbook](./../../AGENTS.md)
- [Developer & Contributor Guide](../docs/README.md)

---

# Specific Workflows and Steps for Common Tasks

### 1. Designing and Updating CI/CD Pipelines

- Identify build steps: install dependencies, lint, test, build artifacts.
- Add deployment steps per environment: staging, production.
- Integrate caching and parallel jobs for speed.
- Configure triggers on branches/tags and pull requests.
- Secure secrets using platform-supported storage.
- Test pipeline changes in feature branches before merging.

### 2. Managing Environment Configuration

- Use `.env` files locally and secure environment variables in CI/CD.
- Separate configs per environment with clear naming conventions.
- Automate environment setup for local dev and staging.
- Version control non-sensitive config templates only.

### 3. Incident Handling and Rollbacks

- Ensure pipeline includes rollback mechanisms (e.g., previous stable deployment).
- Set up notifications on failures.
- Access and analyze logs promptly.
- Coordinate rapid fixes and rerun pipelines.

---

This playbook enables the DevOps Specialist agent to effectively support and enhance the resilience, automation, and delivery speed of the `resume_figma` project.

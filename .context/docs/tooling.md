# Tooling & Productivity Guide

This guide outlines the essential tooling, automation, editor configurations, and productivity tips to help developers efficiently contribute to the **resume_figma** project. Following these guidelines ensures a smooth development experience with consistent code quality and effective collaboration.

## Required Tooling

To develop, test, and maintain the project, you need the following tools installed:

- **Node.js**
  - **Version:** >=18.x
  - **Purpose:** Provides the runtime for building and running JavaScript/TypeScript code, including package management.
  - **Installation:** Download from [https://nodejs.org/](https://nodejs.org/) or use a version manager like `nvm`.

- **pnpm**
  - **Version:** Latest stable
  - **Purpose:** Fast, efficient package manager used to install dependencies and run scripts.
  - **Installation:**  
    ```bash
    npm install -g pnpm
    ```
  - Use `pnpm install` to set up project dependencies.

- **TypeScript**
  - **Version:** As specified by `package.json` (typically the latest stable)
  - **Purpose:** To catch type errors early and enable advanced code intelligence.
  - Installed automatically via pnpm.

- **Vite**
  - **Version:** As specified in `package.json`
  - **Purpose:** The frontend build tool providing fast development server and efficient bundling.
  - Installed automatically via pnpm.

- **ESLint**
  - **Version:** Aligned with project config
  - **Purpose:** Ensures consistent code style and enforces best practices.
  - Used with project-configured rules.

- **Prettier**
  - **Version:** Latest recommended by project
  - **Purpose:** Code formatter to maintain a consistent code style.
  - Configured via project settings.

- **Git**
  - **Version:** Latest stable
  - **Purpose:** Version control and collaboration.
  - Installed from [https://git-scm.com/](https://git-scm.com/).

## Recommended Automation

Automation in the project improves code quality and developer efficiency with minimal manual intervention:

- **Pre-commit Hooks**
  - Implemented via [Husky](https://typicode.github.io/husky/#/).
  - Automatically runs linting and formatting checks before commits to prevent bad code from entering the repository.

- **Linting and Formatting**
  - Run linting via:
    ```bash
    pnpm lint
    ```
  - Format code using:
    ```bash
    pnpm format
    ```
  - Both commands can also be configured to watch file changes during development.

- **Type Checking**
  - Run type checks using:
    ```bash
    pnpm type-check
    ```
  - Ensures type safety throughout the project.

- **Development Server**
  - Start a fast-refresh enabled server with:
    ```bash
    pnpm dev
    ```
  - Enables immediate feedback and live reload when editing components or UI.

- **Code Generators / Scaffolding**
  - While no dedicated code generators are currently defined, scripts for adding UI components or utilities should follow the project conventions seen in `components/ui` and `resume/components/ui`.

## IDE / Editor Setup

Using these editor plugins and configurations enhances development speed and reduces errors:

- **VS Code Extensions**
  - **ESLint:** Highlights lint issues in real-time.
  - **Prettier - Code Formatter:** Formats code on save.
  - **TypeScript and JavaScript Language Features:** Provides autocomplete and inline error detection.
  - **GitLens:** Enhances Git integration.
  - **Tailwind CSS IntelliSense:** Provides class name suggestions if Tailwind CSS is used.

- **Workspace Settings**
  - Configure VS Code to format on save:
    ```json
    {
      "editor.formatOnSave": true,
      "eslint.validate": [ "javascript", "typescript", "typescriptreact" ],
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
      }
    }
    ```
- **Snippets and Templates**
  - Create code snippets for common UI components (e.g., `Input`, `Label`, `Select`) to speed up typical component scaffolding.
  - Follow component structure and style conventions as found in `components/ui` for consistency.

## Productivity Tips

Maximize your efficiency by adopting these development practices:

- **Terminal Aliases**
  - Define shortcuts for common commands in your shell config (e.g., `.bashrc`, `.zshrc`):
    ```bash
    alias rsdev="pnpm dev"
    alias rslint="pnpm lint"
    alias rsformat="pnpm format"
    alias rstype="pnpm type-check"
    ```
  - Save keystrokes and reduce context switching.

- **Containerized Development**
  - While not yet defined, consider using Docker or similar containers to standardize development environments and dependencies.
  
- **Local Emulators and Hot Reload**
  - Leverage Vite’s hot reload capability for instant feedback while working on UI components.
  - Use editor-integrated terminals to run scripts without leaving VS Code.

- **Shared Dotfiles**
  - Sync your dotfiles (aliases, editor config, git config) with the team repo to standardize developer environment and tooling preferences.

## Related Resources

For additional workflow and process details, visit:

- [development-workflow.md](./development-workflow.md)

---

This guide will evolve as the project grows. Please contribute back any tooling improvements or automation scripts that improve team productivity!

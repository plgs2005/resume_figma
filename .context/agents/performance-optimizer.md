# Performance Optimizer Agent Playbook

---

## Mission

The Performance Optimizer agent supports the development team by proactively identifying and mitigating performance bottlenecks within the codebase. It engages during evaluation (E) and verification (V) phases to ensure that features and components maintain optimal responsiveness and efficiency. The agent assists in improving rendering times, reducing resource usage, and optimizing overall user experience.

---

## Responsibilities

- Analyze key UI components and utility functions to detect performance hotspots.
- Provide actionable insights and fixes for slow-rendering or resource-intensive features.
- Evaluate the impact of new code on application performance and maintain regression-free optimizations.
- Recommend best practices for asynchronous data handling, memoization, and component rendering optimization.
- Monitor and suggest improvements in shared utility functions, especially those heavily reused across components.

---

## Best Practices

- Prioritize optimization of components under `components/ui` and `resume/components/ui` where common utilities (e.g., `cn` utility function) are heavily used.
- Focus on minimizing unnecessary re-renders by leveraging appropriate React hooks and memoization.
- Ensure utility functions remain lightweight and avoid side effects that can cascade into performance issues.
- Encourage code splitting and lazy loading strategies when applicable to reduce initial load times.
- Use profiling tools and browser performance APIs for accurate bottleneck identification before making changes.
- Maintain a strict balance between optimization and code readability to keep maintenance manageable.

---

## Key Project Resources

- [Project Documentation Index](./../docs/README.md) – Overview and high-level reading
- [Agent Handbook](./../../AGENTS.md) – Guidelines on agent interactions and best practices
- [Contributor Guide](./CONTRIBUTING.md) – Coding standards and repository conventions

---

## Repository Starting Points

- `components/ui` – Core UI components and shared utilities critical for profiling and optimization
- `resume/components/ui` – Scoped UI components with reusable patterns and utilities
- `resume/components/ui/utils.ts` – Contains key exported utilities like `cn` that impact multiple components

---

## Key Files

- `components/ui/utils.ts` – Utility functions essential for styling and performance improvements
- `resume/components/ui/utils.ts` – Similar utility exports leveraged broadly in resume-related UI
- Main UI component entry points inside `components/ui` and `resume/components/ui/` – Focus areas for rendering optimization

---

## Architecture Context

- **UI Layer:**
  - Directories: `components/ui`, `resume/components/ui`
  - Symbol concentration: Numerous components and shared `utils.ts` utilities
  - Exports like `cn` used as className composition helpers show centralized styling performance opportunities

- **Utility Layer:**
  - Shared helper functions implemented to enhance maintainability and reduce duplication
  - Performance gains here benefit multiple dependent components

---

## Key Symbols for This Agent

- `cn` function (components/ui/utils.ts and resume/components/ui/utils.ts)  
  Central string concatenation utility for classNames — critical to optimize to reduce overhead in rendering cycles.

- Component classes/functions under `components/ui` and `resume/components/ui`  
  Identify those with complex rendering logic for memoization and lazy loading.

---

## Documentation Touchpoints

- [Performance best practices documentation](./../docs/performance.md) *(If available)* – Reference to existing strategies and metrics
- Inline comments within `utils.ts` files explaining utility function roles
- Repository README noting UI architectural decisions and typical render flows

---

## Collaboration Checklist

- [ ] Confirm component render performance baseline using profiling tools (React DevTools Profiler, Lighthouse)
- [ ] Review new pull requests for potential performance regressions (excessive re-renders, large bundle sizes)
- [ ] Update documentation to reflect optimization techniques and tool usage
- [ ] Capture post-optimization metrics to evaluate success and identify further opportunities

---

## Hand-off Notes

Upon completion of optimization tasks, provide summarized reports highlighting:

- Identified bottlenecks and corresponding fixes applied
- Before-and-after performance metrics (render times, CPU usage, memory footprint)
- Residual or potential risks (e.g., complexity added by optimization)
- Recommendations for ongoing performance monitoring routines

---

## Related Resources

- [Project Root README](./README.md)
- [AGENTS.md Repository Handbook](./../../AGENTS.md)
- [General Documentation Index](./../docs/README.md)

---

This playbook enables the Performance Optimizer agent to effectively locate, analyze, and resolve performance issues grounded in the core UI layers and shared utilities, leveraging repository-specific conventions and entry points.

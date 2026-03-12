/**
 * Skill Normalizer — Normaliza nomes de skills para forma canônica.
 *
 * Problema: a mesma skill pode aparecer com nomes diferentes
 * dependendo da fonte (GitHub, LinkedIn, PDF, manual):
 *   "TypeScript", "typescript", "TS", "TypeScript/React"
 *   "Node.js", "NodeJS", "node"
 *   "CI/CD", "CI/CD Pipeline", "Continuous Integration"
 *
 * Este módulo mapeia variantes para um nome canônico único.
 */

// ── Mapa de aliases → canônico ───────────────────────────────────────

const CANONICAL_MAP: Record<string, string> = {
    // JavaScript ecosystem
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ecmascript": "JavaScript",
    "es6": "JavaScript",
    "es2015": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "typescript/react": "TypeScript",
    "tsx": "TypeScript",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "deno": "Deno",
    "bun": "Bun",

    // Frontend frameworks
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "react native": "React Native",
    "react-native": "React Native",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "angularjs": "Angular",
    "svelte": "Svelte",
    "sveltekit": "SvelteKit",
    "next": "Next.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "nuxt": "Nuxt.js",
    "nuxtjs": "Nuxt.js",
    "nuxt.js": "Nuxt.js",

    // Backend frameworks
    "express": "Express.js",
    "expressjs": "Express.js",
    "express.js": "Express.js",
    "fastify": "Fastify",
    "nest": "NestJS",
    "nestjs": "NestJS",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "laravel": "Laravel",
    "symfony": "Symfony",
    "spring": "Spring",
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",
    "rails": "Ruby on Rails",
    "ruby on rails": "Ruby on Rails",
    "ror": "Ruby on Rails",
    "asp.net": "ASP.NET",
    "aspnet": "ASP.NET",

    // Languages
    "python": "Python",
    "py": "Python",
    "python3": "Python",
    "java": "Java",
    "php": "PHP",
    "ruby": "Ruby",
    "go": "Go",
    "golang": "Go",
    "rust": "Rust",
    "c#": "C#",
    "csharp": "C#",
    "c++": "C++",
    "cpp": "C++",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "dart": "Dart",
    "scala": "Scala",
    "elixir": "Elixir",
    "shell": "Shell",
    "bash": "Shell",
    "sh": "Shell",
    "zsh": "Shell",
    "sql": "SQL",

    // Databases
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "dynamodb": "DynamoDB",
    "bigquery": "BigQuery",
    "sqlite": "SQLite",

    // DevOps / Cloud
    "docker": "Docker",
    "docker compose": "Docker Compose",
    "docker-compose": "Docker Compose",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "GCP",
    "google cloud": "GCP",
    "google cloud platform": "GCP",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "terraform": "Terraform",
    "jenkins": "Jenkins",
    "github actions": "GitHub Actions",
    "circleci": "CircleCI",
    "gitlab ci": "GitLab CI",

    // CI/CD variants
    "ci/cd": "CI/CD",
    "ci/cd pipeline": "CI/CD",
    "continuous integration": "CI/CD",
    "continuous delivery": "CI/CD",
    "continuous deployment": "CI/CD",

    // Testing
    "jest": "Jest",
    "vitest": "Vitest",
    "pytest": "Pytest",
    "phpunit": "PHPUnit",
    "junit": "JUnit",
    "playwright": "Playwright",
    "cypress": "Cypress",
    "e2e": "E2E Testing",
    "end-to-end": "E2E Testing",
    "testes automatizados": "Automated Testing",
    "testes": "Testing",
    "testes em ci": "CI Testing",

    // CSS / UI
    "css": "CSS",
    "css3": "CSS",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "material ui": "Material UI",
    "mui": "Material UI",
    "figma": "Figma",

    // APIs
    "rest": "REST API",
    "rest api": "REST API",
    "restful": "REST API",
    "apis restful": "REST API",
    "graphql": "GraphQL",
    "grpc": "gRPC",
    "websocket": "WebSocket",
    "websockets": "WebSocket",

    // Tools
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "vite": "Vite",
    "webpack": "Webpack",
    "rollup": "Rollup",
    "esbuild": "esbuild",
    "nginx": "Nginx",
    "apache": "Apache",

    // API Management
    "apigee": "Apigee",
    "apigee edge": "Apigee",
    "apigee x": "Apigee X",
    "kong": "Kong",

    // Messaging
    "kafka": "Apache Kafka",
    "rabbitmq": "RabbitMQ",
    "sqs": "AWS SQS",
    "pub/sub": "Pub/Sub",
};

// ── Funções públicas ─────────────────────────────────────────────────

/**
 * Normaliza o nome de uma skill para forma canônica.
 * Retorna o nome original (trimmed e title-cased) se não houver mapeamento.
 */
export function normalizeSkillName(raw: string): string {
    const key = raw.trim().toLowerCase();
    return CANONICAL_MAP[key] ?? titleCase(raw.trim());
}

/**
 * Normaliza uma lista de skills, removendo duplicatas após normalização.
 */
export function normalizeSkillList(skills: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const skill of skills) {
        const normalized = normalizeSkillName(skill);
        if (!seen.has(normalized)) {
            seen.add(normalized);
            result.push(normalized);
        }
    }

    return result;
}

/**
 * Verifica se duas skills são equivalentes após normalização.
 */
export function areSkillsEquivalent(a: string, b: string): boolean {
    return normalizeSkillName(a) === normalizeSkillName(b);
}

/**
 * Adiciona um alias customizado ao mapa de normalização.
 * Útil para extensões runtime.
 */
export function addSkillAlias(alias: string, canonical: string): void {
    CANONICAL_MAP[alias.toLowerCase()] = canonical;
}

/**
 * Retorna todos os aliases conhecidos para um nome canônico.
 */
export function getSkillAliases(canonical: string): string[] {
    return Object.entries(CANONICAL_MAP)
        .filter(([, value]) => value === canonical)
        .map(([key]) => key);
}

// ── Helpers ──────────────────────────────────────────────────────────

function titleCase(str: string): string {
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

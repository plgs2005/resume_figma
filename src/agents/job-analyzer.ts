/**
 * Job Analyzer Agent — Parseia descrições de vagas e extrai requisitos.
 *
 * Versão client-side leve baseada no parseJobDescription() do SKE answer-engine,
 * adaptada para rodar no browser com os dados do public/skill-data.json.
 *
 * Pipeline: texto da vaga → parse → match com SKE → JobMatch
 */

import type { JobMatch } from "../types/resume";
import type { SKEData } from "../lib/ske-bridge";
import { findSkill, getSKEData } from "../lib/ske-bridge";
import {
  extractDimensions,
  detectsLeadership,
  type LensDimension,
} from "./lens";

/* ── Tipos internos ── */

export interface JobRequirement {
  nome: string;
  obrigatorio: boolean;
}

export interface ParsedJob {
  titulo: string;
  empresa?: string;
  requisitos: JobRequirement[];
  texto_original: string;
}

export interface JobAnalysis {
  parsed: ParsedJob;
  match: JobMatch;
  /** Skills do SKE que atendem requisitos */
  skills_encontradas: string[];
  /** Requisitos sem correspondência no SKE */
  gaps: string[];
  /** Sugestões de melhoria para o currículo */
  sugestoes: string[];
  /** Dimensões contextuais da vaga (lens) */
  dimensions: LensDimension;
}

/* ── Patterns de detecção de tecnologias ── */

const TECH_PATTERNS: Array<{ regex: RegExp; nome: string }> = [
  // Frontend
  { regex: /\breact\b/i, nome: "React" },
  { regex: /\btypescript\b/i, nome: "TypeScript" },
  { regex: /\bjavascript\b/i, nome: "JavaScript" },
  { regex: /\bvue\.?js?\b/i, nome: "Vue.js" },
  { regex: /\bangular\b/i, nome: "Angular" },
  { regex: /\bnext\.?js\b/i, nome: "Next.js" },
  { regex: /\btailwind/i, nome: "Tailwind CSS" },
  { regex: /\bbootstrap\b/i, nome: "Bootstrap" },

  // Backend
  { regex: /\bnode\.?js\b/i, nome: "Node.js" },
  { regex: /\bphp\b/i, nome: "PHP" },
  { regex: /\blaravel\b/i, nome: "Laravel" },
  { regex: /\bdrupal\b/i, nome: "Drupal" },
  { regex: /\bsymfony\b/i, nome: "Symfony" },
  { regex: /\bjava\b(?!script)/i, nome: "Java" },
  { regex: /\bspring\b/i, nome: "Spring" },
  { regex: /\bkotlin\b/i, nome: "Kotlin" },
  { regex: /\bpython\b/i, nome: "Python" },
  { regex: /\bdjango\b/i, nome: "Django" },
  { regex: /\bfastapi\b/i, nome: "FastAPI" },
  { regex: /\bgo\b(?!ogle)/i, nome: "Go" },
  { regex: /\bc#|csharp|\.net\b/i, nome: "C#/.NET" },
  { regex: /\bruby\b/i, nome: "Ruby" },
  { regex: /\brails\b/i, nome: "Ruby on Rails" },
  { regex: /\brust\b/i, nome: "Rust" },
  { regex: /\bnestjs\b/i, nome: "NestJS" },
  { regex: /\bexpress\b/i, nome: "Express.js" },

  // APIs & Integration
  { regex: /\bapigee\b/i, nome: "Apigee" },
  { regex: /\bapi\s*gateway/i, nome: "API Gateway" },
  { regex: /\bopenapi|swagger/i, nome: "OpenAPI" },
  { regex: /\bgraphql\b/i, nome: "GraphQL" },
  { regex: /\brest\s*(?:api|ful)/i, nome: "REST API" },
  { regex: /\bmicroservi/i, nome: "Microsserviços" },
  { regex: /\boauth\b/i, nome: "OAuth2" },
  { regex: /\bjwt\b/i, nome: "JWT" },
  { regex: /\bmtls\b/i, nome: "mTLS" },

  // Databases
  { regex: /\bmysql\b/i, nome: "MySQL" },
  { regex: /\bpostgres/i, nome: "PostgreSQL" },
  { regex: /\bmongodb\b/i, nome: "MongoDB" },
  { regex: /\bredis\b/i, nome: "Redis" },
  { regex: /\belasticsearch\b/i, nome: "Elasticsearch" },
  { regex: /\bbigquery\b/i, nome: "BigQuery" },

  // Cloud & DevOps
  { regex: /\bdocker\b/i, nome: "Docker" },
  { regex: /\bkubernetes\b|k8s/i, nome: "Kubernetes" },
  { regex: /\baws\b/i, nome: "AWS" },
  { regex: /\bgcp\b|google cloud/i, nome: "GCP" },
  { regex: /\bazure\b/i, nome: "Azure" },
  { regex: /\bterraform\b/i, nome: "Terraform" },
  { regex: /\bjenkins\b/i, nome: "Jenkins" },
  { regex: /\bci\s*\/?\s*cd\b/i, nome: "CI/CD" },
  { regex: /\bgithub\s*actions/i, nome: "GitHub Actions" },

  // Messaging
  { regex: /\bkafka\b/i, nome: "Kafka" },
  { regex: /\brabbitmq\b/i, nome: "RabbitMQ" },

  // Testing
  { regex: /\btdd\b/i, nome: "TDD" },
  { regex: /\btestes?\s*(unitário|integração|e2e|automatizado)/i, nome: "Testes Automatizados" },
  { regex: /\bjest\b/i, nome: "Jest" },

  // Methodology
  { regex: /\bagile\b|scrum|kanban/i, nome: "Agile/Scrum" },
  { regex: /\bgit\b(?!hub)/i, nome: "Git" },
];

/* ── Parser ── */

/**
 * Parseia texto livre de descrição de vaga em requisitos estruturados.
 * Detecta seções obrigatórias vs desejáveis e extrai tecnologias.
 */
export function parseJobDescription(
  text: string,
  titulo?: string,
  empresa?: string,
): ParsedJob {
  const requisitos: JobRequirement[] = [];
  const lines = text.split("\n");
  let isRequiredSection = true;
  const seenTechs = new Set<string>();

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Detectar seções
    if (
      /obrigat[oó]ri|requisit|indispens[aá]vel|necess[aá]ri|required|must\s+have/i.test(
        lower,
      )
    ) {
      isRequiredSection = true;
    }
    if (
      /desej[aá]vel|diferencial|nice\s+to\s+have|bonus|plus|prefer/i.test(
        lower,
      )
    ) {
      isRequiredSection = false;
    }

    for (const { regex, nome } of TECH_PATTERNS) {
      if (regex.test(line) && !seenTechs.has(nome)) {
        seenTechs.add(nome);
        requisitos.push({
          nome,
          obrigatorio: isRequiredSection,
        });
      }
    }
  }

  return {
    titulo: titulo || extractJobTitle(text),
    empresa,
    requisitos,
    texto_original: text,
  };
}

/**
 * Extrai o título da vaga do texto (heurística: primeira linha não vazia ou curta).
 */
function extractJobTitle(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const firstLine = lines[0] || "Vaga sem título";

  // Se a primeira linha parece um título (curta e sem pontuação final)
  if (firstLine.length < 80 && !firstLine.endsWith(".")) {
    return firstLine;
  }

  return "Vaga sem título identificado";
}

/* ── Matcher ── */

/**
 * Analisa uma vaga contra os dados do SKE e gera um JobMatch + análise completa.
 */
export function analyzeJob(
  text: string,
  titulo?: string,
  empresa?: string,
  skeData?: SKEData | null,
): JobAnalysis {
  const ske = skeData || getSKEData();
  const parsed = parseJobDescription(text, titulo, empresa);

  // Extrair dimensões contextuais via Lens
  const dimensions = extractDimensions(text, titulo);

  const skillsEncontradas: string[] = [];
  const gaps: string[] = [];
  const keywordsMatch: string[] = [];
  const keywordsGap: string[] = [];
  const sugestoes: string[] = [];

  for (const req of parsed.requisitos) {
    const match = findSkill(req.nome, ske);

    if (match && match.encontrado) {
      skillsEncontradas.push(req.nome);
      keywordsMatch.push(req.nome);
    } else {
      gaps.push(req.nome);
      keywordsGap.push(req.nome);

      if (req.obrigatorio) {
        sugestoes.push(
          `Requisito OBRIGATÓRIO não atendido: ${req.nome}. Considere evidenciar experiência indireta ou teórica.`,
        );
      } else {
        sugestoes.push(
          `Diferencial não atendido: ${req.nome}. Pode omitir ou mencionar conhecimento teórico.`,
        );
      }
    }
  }

  // Calcular aderência
  const totalReqs = parsed.requisitos.length;
  const matchedReqs = skillsEncontradas.length;
  const obrigatoriosTotal = parsed.requisitos.filter(
    (r) => r.obrigatorio,
  ).length;
  const obrigatoriosAtendidos = parsed.requisitos.filter(
    (r) => r.obrigatorio && keywordsMatch.includes(r.nome),
  ).length;

  const aderencia =
    totalReqs > 0
      ? Math.round(
          (obrigatoriosAtendidos / Math.max(obrigatoriosTotal, 1)) * 60 +
            (matchedReqs / totalReqs) * 40,
        )
      : 0;

  // Gerar sugestões estratégicas
  if (aderencia >= 80) {
    sugestoes.unshift(
      "✅ Alta aderência! Destaque as keywords correspondentes no resumo profissional.",
    );
  } else if (aderencia >= 50) {
    sugestoes.unshift(
      "⚠️ Aderência moderada. Priorize destacar experiências com as tecnologias exigidas.",
    );
  } else {
    sugestoes.unshift(
      "❌ Baixa aderência. Avalie se vale candidatar-se ou invista em aprendizado das gaps.",
    );
  }

  // Sugestões baseadas no Lens
  if (dimensions.lideranca && detectsLeadership(text)) {
    sugestoes.push(
      "🎯 Vaga pede liderança técnica. Destaque experiências como líder/coordenador.",
    );
  }

  if (dimensions.temas_negocio.length > 0) {
    sugestoes.push(
      `🏢 Temas de negócio identificados: ${dimensions.temas_negocio.join(", ")}. Relacione experiências nesses domínios.`,
    );
  }

  // Injetar tecnologias detectadas nas dimensões
  dimensions.tecnologias = skillsEncontradas;

  const jobMatch: JobMatch = {
    titulo_vaga: parsed.titulo,
    empresa_vaga: parsed.empresa,
    aderencia,
    keywords_match: keywordsMatch,
    keywords_gap: keywordsGap,
    sugestoes,
  };

  return {
    parsed,
    match: jobMatch,
    skills_encontradas: skillsEncontradas,
    gaps,
    sugestoes,
    dimensions,
  };
}

/**
 * Versão resumida: analisa e retorna apenas o JobMatch para o schema do currículo.
 */
export function quickAnalyze(
  text: string,
  titulo?: string,
  empresa?: string,
): JobMatch {
  return analyzeJob(text, titulo, empresa).match;
}

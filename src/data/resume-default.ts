/**
 * Dados padrão do currículo — conteúdo extraído do App.tsx original.
 *
 * Texto com marcadores **bold** é renderizado pelo componente <Markup />.
 * Os agentes podem gerar versões alternativas (tailored) seguindo o mesmo schema.
 */
import type { ResumeData } from "../types/resume";

export const defaultResumeData: ResumeData = {
  schema_version: "1.0",

  pessoal: {
    nome: "Pedro Lucas Gandara Santos",
    titulo:
      "Líder Técnico | Eng. de Software FullStack Sr. | API Specialist",
    email: "plgsantos@icloud.com",
    telefone: "+55 (11) 95090-3204",
    localizacao: "Itatiba - SP, Brasil",
    linkedin: "https://linkedin.com/in/pedrolucassantos",
  },

  resumo: {
    paragrafos: [
      "Desenvolvedor Sênior de APIs e API Specialist com mais de 15 anos de experiência em integração enterprise, API Management com Apigee (Edge e X), modelagem API-First e governança de contratos OpenAPI. Atuação como referência técnica em projetos críticos de integração digital, liderando decisões arquiteturais, migrações complexas e implementação de segurança avançada (OAuth2, JWT, mTLS) em ambientes cloud AWS / GCP.",
    ],
    keywords_ats: [
      "API Management",
      "Apigee",
      "OAuth2",
      "JWT",
      "mTLS",
      "OpenAPI",
      "AWS",
      "GCP",
      "Tech Lead",
      "FullStack",
    ],
  },

  skill_groups: [
    {
      titulo: "Backend & API Management",
      fullWidth: true,
      skills: [
        {
          nome: "**Arquitetura de serviços**, organização em camadas, Service Classes, Event Listeners, API Gateway, Mensageria.",
          nivel: "dominio-solido",
          categoria: "backend",
        },
        {
          nome: "**Apigee Edge & Apigee X** – API-First, OpenAPI 3.0/Swagger, proxies, policies, OAuth2, JWT, mTLS.",
          nivel: "dominio-solido",
          categoria: "backend",
        },
        {
          nome: "**Versionamentos de APIs**, controle de contratos e governança enterprise.",
          nivel: "dominio-solido",
          categoria: "backend",
        },
        {
          nome: "**PHP (15+), Node(4+), Java(1+)** – ~20 anos de experiência, modernização de legados e aplicações enterprise.",
          nivel: "dominio-solido",
          categoria: "backend",
        },
        {
          nome: "**Laravel** – RESTful APIs, API Resources, Middleware, Queues, Jobs, Cron, Eloquent ORM.",
          nivel: "dominio-solido",
          categoria: "backend",
        },
        {
          nome: "**Drupal** – RESTful APIs, API Resources, API Modules, API Themes, Middleware, Services, Queues, Jobs, Cron, Eloquent ORM.",
          nivel: "experiencia-avancada",
          categoria: "backend",
        },
        {
          nome: "**Integrações** entre microsserviços (REST/RPC), padrões orientados a domínio.",
          nivel: "dominio-solido",
          categoria: "backend",
        },
        {
          nome: "**Conhecimento Basico/Avançado** Kafka, BigQuery + Integração analítica, experiência real com governança enterprise.",
          nivel: "experiencia-pratica",
          categoria: "backend",
        },
      ],
    },
    {
      titulo: "Frontend & Portais",
      skills: [
        {
          nome: "**React, Vue.js** – integração com APIs e portais corporativos.",
          nivel: "experiencia-avancada",
          categoria: "frontend",
        },
        {
          nome: "**Frameworks** Mondrian, Tailwind CSS, Bootstrap, UX/UI orientado a produto.",
          nivel: "experiencia-avancada",
          categoria: "frontend",
        },
        {
          nome: "**Construções** jornadas digitais integradas a plataformas de APIs e monitoramento.",
          nivel: "experiencia-avancada",
          categoria: "frontend",
        },
        {
          nome: "**Drupal** (módulos customizados, sustentação, migração de ambientes), Twig, Blade, Html.",
          nivel: "experiencia-avancada",
          categoria: "frontend",
        },
      ],
    },
    {
      titulo: "Dados & Performance",
      skills: [
        {
          nome: "**MySQL, MongoDB** – modelagem relacional e não relacional.",
          nivel: "dominio-solido",
          categoria: "banco-de-dados",
        },
        {
          nome: "**SQL** otimização, queries, tuning de performance.",
          nivel: "dominio-solido",
          categoria: "banco-de-dados",
        },
        {
          nome: "**BigQuery** – integrações analíticas e suporte a camadas de dados.",
          nivel: "experiencia-pratica",
          categoria: "banco-de-dados",
        },
        {
          nome: "**Redis, Memcached** – estratégias de cache e melhoria de throughput.",
          nivel: "experiencia-pratica",
          categoria: "banco-de-dados",
        },
      ],
    },
    {
      titulo: "Cloud, DevOps & Plataforma",
      fullWidth: true,
      skills: [
        {
          nome: "**AWS** (ECS, Lambda, RDS, EKS) – atuação em ambientes corporativos híbridos.",
          nivel: "experiencia-avancada",
          categoria: "devops",
        },
        {
          nome: "**Painéis administrativos** AWS & GCP (IAM, redes, ambientes, controle de acesso).",
          nivel: "experiencia-avancada",
          categoria: "devops",
        },
        {
          nome: "**Jenkins** – pipelines CI/CD, build, validação, deploy e rollback.",
          nivel: "dominio-solido",
          categoria: "devops",
        },
        {
          nome: "**Docker**, versionamento Git, esteiras corporativas de entrega contínua.",
          nivel: "dominio-solido",
          categoria: "devops",
        },
        {
          nome: "**Governança** mudanças (RDM, Chamados, Ambientes, Jira, Automações), DevSecOps, CCoE.",
          nivel: "experiencia-avancada",
          categoria: "devops",
        },
        {
          nome: "Observabilidade, testes automatizados, troubleshooting em produção e análise de causa raiz.",
          nivel: "dominio-solido",
          categoria: "devops",
        },
      ],
    },
    {
      titulo: "Conhecimento Operacional",
      fullWidth: true,
      tipo: "paragraph",
      skills: [
        {
          nome: "Conhecimento operacional na estrutura administrativa do Apigee (organizações, environments, environment groups, API proxies, products, developers, apps, companies), uso de APIs administrativas GCP e gestão completa do ciclo de vida de APIs em ambientes enterprise.",
          nivel: "experiencia-avancada",
          categoria: "operacional",
        },
      ],
    },
  ],

  experiencias: [
    {
      empresa: "Claro Brasil (Jump Label / Global Hitss)",
      cargo: "Engenheiro de Software Sênior | Líder Técnico",
      periodo: "Set/2024 - Presente",
      atual: true,
      realizacoes: [
        "Atuação como **Líder Técnico** na sustentação e evolução crítica do portal **Claro Insights / Marketplace** (Drupal), garantindo alta disponibilidade, estabilidade e performance em ambiente enterprise.",
        "Liderança estratégica na migração de **Apigee Edge para Apigee X**, definindo modelo híbrido, mitigação de riscos e alinhamento com arquitetura corporativa.",
        "Condução do modelo **API-First**, governança de contratos (OpenAPI 3.0), versionamento e implementação de políticas avançadas de segurança (OAuth2, JWT, mTLS) no ciclo completo de APIs.",
        "Atuação direta com áreas de **Governança, Arquitetura, DevSecOps e Negócio**, participando de decisões técnicas estratégicas e garantindo conformidade com padrões corporativos.",
        "Gestão de mudanças (RDM), abertura e acompanhamento de chamados, controle de ambientes e esteiras CI/CD, assegurando qualidade e estabilidade em produção.",
        "Apoio técnico na estruturação do portal **OpenGateway**, integrando BigQuery e fluxos digitais de contratação.",
        "Atuação em troubleshooting crítico, análise de causa raiz, observabilidade e melhoria contínua de performance, segurança e escalabilidade.",
      ],
      stack: [
        "Drupal",
        "Apigee",
        "AWS",
        "GCP",
        "BigQuery",
        "Jenkins",
        "Docker",
        "OAuth2",
        "JWT",
      ],
    },
    {
      empresa: "Adiante Group",
      cargo: "Líder de Projeto / Desenvolvedor PHP",
      periodo: "Jan/2021 - Jul/2024",
      realizacoes: [
        "Construção de sistemas web com **Laravel**, focando em padrões de código e performance.",
        "Liderança técnica, organização de demandas e integração com áreas parceiras.",
      ],
      stack: ["Laravel", "PHP", "MySQL"],
    },
    {
      empresa: "Hydra Data",
      cargo: "DEV. FullStack Laravel",
      periodo: "2020 - 2021",
      realizacoes: [
        "Desenvolvimento full stack, modelagem de dados e otimização de queries.",
      ],
      stack: ["Laravel", "PHP", "MySQL"],
    },
    {
      empresa: "AdsMoby",
      cargo: "Programador Web",
      periodo: "2018 - 2019",
      realizacoes: [
        "Manutenção de aplicações PHP/MySQL, foco em performance e estabilidade.",
      ],
      stack: ["PHP", "MySQL"],
    },
  ],

  projetos: [
    {
      nome: "Projetos Próprios (SaaS)",
      subtitulo: "Ezead.club + Automações",
      descricao:
        "Construção de plataforma SaaS multi-tenant, arquitetura de microsserviços e operação completa (CI/CD, observabilidade). * Product Engineer",
      periodo: "Em 2017",
      stack: ["Laravel", "Docker", "CI/CD"],
    },
  ],

  consultorias: [
    { empresa: "Meeta Solutions", descricao: "FullStack" },
    { empresa: "Supralog", descricao: "FullStack" },
    { empresa: "OmegaBCD", descricao: "FullStack" },
    { empresa: "SUITE IT", descricao: "Chatbot/DialogFlow" },
    { empresa: "Brasil Self Service", descricao: "Frontend" },
    { empresa: "Yubank", descricao: "Backend API" },
  ],

  formacao: [
    {
      instituicao: "Univ. Padre Anchieta",
      curso: "Análise e Desenv. de Software",
      periodo: "2024 - 2026",
      status: "em-andamento",
    },
    {
      instituicao: "Univ. Padre Anchieta",
      curso: "Sistemas de Informação",
      periodo: "Concluído em 2008",
      status: "concluido",
    },
  ],

  especializacoes: [
    {
      titulo: "PHP Laravel Avançado",
      descricao: "SaaS, APIs, Queues, Modules, Jetstream",
    },
    {
      titulo: "Arquitetura de APIs",
      descricao: "RESTful, OAuth2/JWT, Gateways",
    },
    {
      titulo: "DevOps & Cloud",
      descricao: "AWS, Docker, CI/CD",
    },
    {
      titulo: "IA Aplicada",
      descricao: "LLMs, RAG, Automação",
    },
  ],

  job_match: null,

  metadata: {
    gerado_por: "manual",
    gerado_em: "2025-03-09T00:00:00.000Z",
    tailored: false,
  },
};

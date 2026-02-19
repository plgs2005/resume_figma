import React, { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Printer,
  Download,
  ExternalLink,
  FileDown,
} from "lucide-react";

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load html2pdf library
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload = () => setIsReady(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleExportPDF = () => {
    if (!isReady) {
      alert(
        "A biblioteca de PDF ainda está carregando. Tente novamente em alguns segundos.",
      );
      return;
    }

    const element = document.getElementById("resume-content");
    const opt = {
      margin: 0,
      filename: "Curriculo_Pedro_Lucas_Gandara_Santos.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen   print:bg-white print:p-0 font-sans text-slate-900">
      {/* Action Buttons */}
      <div className="fixed bottom-8 right-8 print:hidden z-50 flex flex-col gap-3">
        <button
          onClick={handleExportPDF}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 group"
          title="Exportar PDF (Visual)"
        >
          <Download className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
            Exportar PDF
          </span>
        </button>

        <button
          onClick={handlePrint}
          className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 group"
          title="Imprimir / PDF para ATS (Texto Selecionável)"
        >
          <Printer className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
            PDF para ATS (Ctrl+P)
          </span>
        </button>
      </div>

      <div
        id="resume-content"
        className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none print:w-full min-h-[297mm]"
      >
        {/* Header */}
        <header className="bg-slate-900 text-white p-10 print:p-8 print:bg-slate-900">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                Pedro Lucas Gandara Santos
              </h1>
              <p className="text-xl text-slate-300 font-light tracking-wide">
                Líder Técnico | Eng. de Software FullStack Sr. |
                API Specialist
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
            <a
              href="mailto:plgsantos@icloud.com"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>plgsantos@icloud.com</span>
            </a>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>+55 (11) 95090-3204</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Itatiba - SP, Brasil</span>
            </div>
            <a
              href="https://linkedin.com/in/pedrolucassantos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              <span>linkedin.com/in/pedrolucassantos</span>
              <ExternalLink className="w-3 h-3 opacity-50 print:hidden" />
            </a>
          </div>
        </header>

        <main className="p-10 print:p-8">
          {/* Professional Summary */}
          <section className="mb-8 break-inside-avoid">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-900 pb-2 mb-4">
              Resumo Profissional
            </h2>
            <p className="text-slate-700 leading-relaxed text-justify">
              Desenvolvedor Sênior de APIs e API Specialist com
              mais de 15 anos de experiência em integração
              enterprise, API Management com Apigee (Edge e X),
              modelagem API-First e governança de contratos
              OpenAPI. Atuação como referência técnica em
              projetos críticos de integração digital, liderando
              decisões arquiteturais, migrações complexas e
              implementação de segurança avançada (OAuth2, JWT,
              mTLS) em ambientes cloud AWS / GCP.
            </p>
          </section>

          {/* Skills */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-900 pb-2 mb-6">
              Conhecimentos Técnicos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Row 1: Backend & API Management (Full Width) */}
              <div className="md:col-span-2   p-4 rounded-lg border border-slate-200 shadow-sm print:shadow-none break-inside-avoid">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-base uppercase">
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
                  Backend & API Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <ul className="space-y-2 text-slate-700 text-sm leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        <strong>Arquitetura de serviços</strong>
                        , organização em camadas, Service
                        Classes, Event Listeners, API Gateway,
                        Mensageria.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        <strong>Apigee Edge & Apigee X</strong>{" "}
                        – API-First, OpenAPI 3.0/Swagger,
                        proxies, policies, OAuth2, JWT, mTLS.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        <strong>Versionamentos de APIs</strong>,
                        controle de contratos e governança
                        enterprise.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        <strong>
                          PHP (15+), Node(4+), Java(1+){" "}
                        </strong>{" "}
                        – ~20 anos de experiência, modernização
                        de legados e aplicações enterprise.
                      </span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-slate-700 text-sm leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        <strong>Laravel</strong> – RESTful APIs,
                        API Resources, Middleware, Queues, Jobs,
                        Cron, Eloquent ORM.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        <strong>Drupal</strong> – RESTful APIs,
                        API Resources, API Modules, API Themes,
                        Middleware, Services, Queues, Jobs,
                        Cron, Eloquent ORM.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        <strong>Integrações</strong> entre
                        microsserviços (REST/RPC), padrões
                        orientados a domínio.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        <strong>
                          Conhecimento Basico/Avançado
                        </strong>{" "}
                        Kafka, BigQuery + Integração analítica,
                        experiência real com governança
                        enterprise.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Row 2: Frontend & Dados (2 Columns) */}
              {/* Frontend & Portais */}
              <div className="  p-4 rounded-lg border border-slate-200 shadow-sm print:shadow-none break-inside-avoid">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-base uppercase">
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
                  Frontend & Portais
                </h3>
                <ul className="space-y-2 text-slate-700 text-sm leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                    <span>
                      <strong>React, Vue.js </strong>–
                      integração com APIs e portais
                      corporativos.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                    <span>
                      <strong>Frameworks</strong> Mondrian,
                      Tailwind CSS, Bootstrap, UX/UI orientado a
                      produto.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                    <span>
                      <strong>Construções</strong> jornadas
                      digitais integradas a plataformas de APIs
                      e monitoramento.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                    <span>
                      <strong>Drupal</strong> (módulos
                      customizados, sustentação, migração de
                      ambientes), Twig, Blade, Html.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Dados & Performance */}
              <div className="  p-4 rounded-lg border border-slate-200 shadow-sm print:shadow-none break-inside-avoid">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-base uppercase">
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
                  Dados & Performance
                </h3>
                <ul className="space-y-2 text-slate-700 text-sm leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                    <span>
                      <strong>MySQL, MongoDB</strong> –
                      modelagem relacional e não relacional.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                    <span>
                      <strong>SQL</strong> otimização, queries,
                      tuning de performance.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                    <span>
                      <strong>BigQuery</strong> – integrações
                      analíticas e suporte a camadas de dados.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                    <span>
                      <strong>Redis, Memcached</strong> –
                      estratégias de cache e melhoria de
                      throughput.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Row 3: Cloud, DevOps & Plataforma (Full Width) */}
              <div className="md:col-span-2   p-4 rounded-lg border border-slate-200 shadow-sm print:shadow-none break-inside-avoid">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-base uppercase">
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
                  Cloud, DevOps & Plataforma
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <ul className="space-y-2 text-slate-700 text-sm leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        <strong>AWS</strong> (ECS, Lambda, RDS,
                        EKS) – atuação em ambientes corporativos
                        híbridos.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        <strong>Painéis administrativos</strong>{" "}
                        AWS & GCP (IAM, redes, ambientes,
                        controle de acesso).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        <strong>Jenkins</strong> – pipelines
                        CI/CD, build, validação, deploy e
                        rollback.
                      </span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-slate-700 text-sm leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        <strong>Docker</strong>, versionamento
                        Git, esteiras corporativas de entrega
                        contínua.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        <strong>Governança</strong> mudanças
                        (RDM, Chamados, Ambientes, Jira,
                        Automações), DevSecOps,CCoE.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 min-w-[3px] h-[3px] bg-slate-400 rounded-full"></span>
                      <span>
                        Observabilidade,testes automatizados,
                        troubleshooting em produção e análise de
                        causa raiz.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Row 4: Conhecimento Operacional (Full Width) */}
              <div className="md:col-span-2   p-5 rounded-lg border border-slate-200 shadow-sm print:shadow-none break-inside-avoid">
                <p className="text-slate-700 text-sm font-medium">
                  Conhecimento operacional na estrutura
                  administrativa do Apigee (organizações,
                  environments, environment groups, API proxies,
                  products, developers, apps, companies), uso de
                  APIs administrativas GCP e gestão completa do
                  ciclo de vida de APIs em ambientes enterprise.
                </p>
              </div>
            </div>
          </section>

          {/* Experience */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-900 pb-2 mb-6">
              Experiência Profissional
            </h2>

            <div className="space-y-4">
              {/* Claro */}
              <div className="bg-slate-50  p-6 rounded-lg border border-slate-200 break-inside-avoid shadow-sm print:shadow-none">
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4 border-b border-slate-200 pb-2">
                  <div>
                    <p className="text-slate-700 font-medium bg-slate-100 ">
                      <strong>Claro Brasil</strong> (Jump Label
                      / Global Hitss)
                    </p>
                    <h3 className="text-lg font-bold text-slate-900">
                      Engenheiro de Software Sênior | Líder
                      Técnico
                    </h3>
                  </div>
                  <span className="text-slate-800 text-sm font-bold bg-white border border-slate-200 px-3 py-1 rounded mt-2 md:mt-0 whitespace-nowrap">
                    Set/2024 - Presente
                  </span>
                </div>

                <ul className="space-y-2 text-slate-700 text-sm leading-relaxed ml-1">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[4px] h-[4px] bg-slate-900 rounded-full"></span>
                    <span>
                      Atuação como{" "}
                      <strong>Líder Técnico</strong> na
                      sustentação e evolução crítica do portal
                      <strong>
                        {" "}
                        Claro Insights / Marketplace
                      </strong>{" "}
                      (Drupal), garantindo alta disponibilidade,
                      estabilidade e performance em ambiente
                      enterprise.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[4px] h-[4px] bg-slate-900 rounded-full"></span>
                    <span>
                      Liderança estratégica na migração de{" "}
                      <strong>Apigee Edge para Apigee X</strong>
                      , definindo modelo híbrido, mitigação de
                      riscos e alinhamento com arquitetura
                      corporativa.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[4px] h-[4px] bg-slate-900 rounded-full"></span>
                    <span>
                      Condução do modelo{" "}
                      <strong>API-First</strong>, governança de
                      contratos (OpenAPI 3.0), versionamento e
                      implementação de políticas avançadas de
                      segurança (OAuth2, JWT, mTLS) no ciclo
                      completo de APIs.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[4px] h-[4px] bg-slate-900 rounded-full"></span>
                    <span>
                      Atuação direta com áreas de{" "}
                      <strong>
                        Governança, Arquitetura, DevSecOps e
                        Negócio
                      </strong>
                      , participando de decisões técnicas
                      estratégicas e garantindo conformidade com
                      padrões corporativos.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[4px] h-[4px] bg-slate-900 rounded-full"></span>
                    <span>
                      Gestão de mudanças (RDM), abertura e
                      acompanhamento de chamados, controle de
                      ambientes e esteiras CI/CD, assegurando
                      qualidade e estabilidade em produção.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[4px] h-[4px] bg-slate-900 rounded-full"></span>
                    <span>
                      Apoio técnico na estruturação do portal{" "}
                      <strong>OpenGateway</strong>, integrando
                      BigQuery e fluxos digitais de contratação.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[4px] h-[4px] bg-slate-900 rounded-full"></span>
                    <span>
                      Atuação em troubleshooting crítico,
                      análise de causa raiz, observabilidade e
                      melhoria contínua de performance,
                      segurança e escalabilidade.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Adiante Group */}
              <div className="  p-6 rounded-lg border border-slate-200 break-inside-avoid shadow-sm print:shadow-none">
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4 border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Líder de Projeto / Desenvolvedor PHP
                    </h3>
                    <p className="text-slate-700 font-medium">
                      Adiante Group
                    </p>
                  </div>
                  <span className="text-slate-600 text-sm font-semibold bg-white border border-slate-200 px-3 py-1 rounded mt-2 md:mt-0 whitespace-nowrap">
                    Jan/2021 - Jul/2024
                  </span>
                </div>
                <ul className="space-y-2 text-slate-700 text-sm leading-relaxed ml-1">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[4px] h-[4px] bg-slate-900 rounded-full"></span>
                    <span>
                      Construção de sistemas web com{" "}
                      <strong>Laravel</strong>, focando em
                      padrões de código e performance.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 min-w-[4px] h-[4px] bg-slate-900 rounded-full"></span>
                    <span>
                      Liderança técnica, organização de demandas
                      e integração com áreas parceiras.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Hydra & AdsMoby & Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 break-inside-avoid">
                {/* Hydra Data */}
                <div className="  p-5 rounded-lg border border-slate-200 shadow-sm print:shadow-none h-full">
                  <div className="flex flex-col mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-900 text-base">
                        DEV. FullStack Laravel
                      </h3>
                      <span className="text-slate-500 text-xs font-semibold whitespace-nowrap bg-white px-2 py-0.5 rounded border border-slate-200">
                        2020 - 2021
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm font-medium">
                      Hydra Data
                    </p>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Desenvolvimento full stack, modelagem de
                    dados e otimização de queries.
                  </p>
                </div>

                {/* AdsMoby */}
                <div className="  p-5 rounded-lg border border-slate-200 shadow-sm print:shadow-none h-full">
                  <div className="flex flex-col mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-900 text-base">
                        Programador Web
                      </h3>
                      <span className="text-slate-500 text-xs font-semibold whitespace-nowrap bg-white px-2 py-0.5 rounded border border-slate-200">
                        2018 - 2019
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm font-medium">
                      AdsMoby
                    </p>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Manutenção de aplicações PHP/MySQL, foco em
                    performance e estabilidade.
                  </p>
                </div>

                {/* Projetos Próprios */}
                <div className="  p-5 rounded-lg border border-slate-200 shadow-sm print:shadow-none h-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Projetos Próprios (SaaS)
                      </h3>
                      <p className="text-slate-700 text-sm font-medium">
                        Ezead.club + Automações
                      </p>
                    </div>
                    <span className="text-slate-500 text-xs font-semibold whitespace-nowrap bg-white px-2 py-0.5 rounded border border-slate-200 mt-2 md:mt-0">
                      Em 2017
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Construção de plataforma SaaS multi-tenant,
                    arquitetura de microsserviços e operação
                    completa (CI/CD, observabilidade). * Product
                    Engineer
                  </p>
                </div>
              </div>

              {/* Consultoria & Projetos (2017-2019) */}
              <div className="  p-5 rounded-lg border border-slate-200 shadow-sm print:shadow-none break-inside-avoid">
                <h3 className="font-bold text-slate-900 text-base mb-3 border-b border-slate-200 pb-2">
                  Atuação em Projetos & Consultoria (2017 -
                  2019)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-700">
                      <strong>Meeta Solutions</strong>{" "}
                      (FullStack)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-700">
                      <strong>Supralog</strong> (FullStack)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-700">
                      <strong>OmegaBCD</strong> (FullStack)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-700">
                      <strong>SUITE IT</strong>{" "}
                      (Chatbot/DialogFlow)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-700">
                      <strong>Brasil Self Service</strong>{" "}
                      (Frontend)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-700">
                      <strong>Yubank</strong> (Backend API)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Education & Certifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6 break-inside-avoid">
            {/* Education */}
            <section className="md:col-span-1 print:col-span-1 bg-white pt-4">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-900 pb-2 mb-4">
                Formação
              </h2>
              <div className="space-y-4">
                <div className="break-inside-avoid">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Análise e Desenv. de Software
                  </h3>
                  <p className="text-slate-700 text-sm">
                    Univ. Padre Anchieta
                  </p>
                  <span className="text-slate-500 text-xs">
                    2024 - 2026 (Em conclusão)
                  </span>
                </div>
                <div className="break-inside-avoid">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Sistemas de Informação
                  </h3>
                  <p className="text-slate-700 text-sm">
                    Univ. Padre Anchieta
                  </p>
                  <span className="text-slate-500 text-xs">
                    Concluído em 2008
                  </span>
                </div>
              </div>
            </section>

            {/* Certifications */}
            <section className="md:col-span-2 print:col-span-2 pt-4">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-900 pb-2 mb-4">
                Especializações
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded border border-slate-100 break-inside-avoid">
                  <strong className="block text-slate-900 text-sm">
                    PHP Laravel Avançado
                  </strong>
                  <span className="text-slate-600 text-xs">
                    SaaS, APIs, Queues, Modules, Jetstream
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-100 break-inside-avoid">
                  <strong className="block text-slate-900 text-sm">
                    Arquitetura de APIs
                  </strong>
                  <span className="text-slate-600 text-xs">
                    RESTful, OAuth2/JWT, Gateways
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-100 break-inside-avoid">
                  <strong className="block text-slate-900 text-sm">
                    DevOps & Cloud
                  </strong>
                  <span className="text-slate-600 text-xs">
                    AWS, Docker, CI/CD
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-100 break-inside-avoid">
                  <strong className="block text-slate-900 text-sm">
                    IA Aplicada
                  </strong>
                  <span className="text-slate-600 text-xs">
                    LLMs, RAG, Automação
                  </span>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <style>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background: white;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

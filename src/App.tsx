import { useEffect, useState } from "react";

const emailIcon =
  "https://www.figma.com/api/mcp/asset/429e2d36-12e8-4e69-a200-07bbd82d4675";
const phoneIcon =
  "https://www.figma.com/api/mcp/asset/ff46e5e0-8132-4d62-a474-5e9bc24a0bc6";
const locationIcon =
  "https://www.figma.com/api/mcp/asset/63487193-e814-4a15-8b90-f6eee1593f62";
const linkedinIcon =
  "https://www.figma.com/api/mcp/asset/cf2d799c-27d4-4e1d-b7d3-8983075deb63";
const externalIcon =
  "https://www.figma.com/api/mcp/asset/042cf5a8-e8e8-4411-b0c1-bc53f87031d3";
const downloadIcon =
  "https://www.figma.com/api/mcp/asset/35bf4095-b366-4df8-aa7e-8bb52b07c7d8";
const printIcon =
  "https://www.figma.com/api/mcp/asset/8da78b2d-fb52-421c-bf10-003f7621be91";

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
    <div className="min-h-screen bg-[#f1f5f9] print:bg-white py-8 print:p-0 font-sans text-[#0f172b]">
      {/* Action Buttons */}
      <div className="fixed right-8 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3 print:hidden">
        <button
          onClick={handleExportPDF}
          className="size-16 rounded-full bg-[#009966] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-transform hover:scale-105"
          title="Exportar PDF (Visual)"
        >
          <img
            src={downloadIcon}
            alt="Exportar PDF"
            className="mx-auto size-6"
          />
        </button>

        <button
          onClick={handlePrint}
          className="size-16 rounded-full bg-[#0f172b] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-transform hover:scale-105"
          title="Imprimir / PDF para ATS (Texto Selecionável)"
        >
          <img
            src={printIcon}
            alt="Imprimir"
            className="mx-auto size-6"
          />
        </button>
      </div>

      <div
        id="resume-content"
        className="mx-auto w-full max-w-[794px] bg-white shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] print:shadow-none print:max-w-none print:w-full"
      >
        {/* Header */}
        <header className="bg-[#0f172b] text-white px-10 pt-10 pb-8 print:p-8 print:bg-[#0f172b]">
          <div className="flex flex-col gap-2">
            <h1 className="text-[48px] leading-[48px] font-bold tracking-[-1.2px]">
              Pedro Lucas Gandara Santos
            </h1>
            <p className="text-[20px] leading-[28px] text-[#cad5e2] font-light tracking-[0.5px]">
              Líder Técnico | Eng. de Software FullStack Sr. |
              API Specialist
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 text-[14px] leading-[20px] text-[#cad5e2]">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href="mailto:plgsantos@icloud.com"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <img src={emailIcon} alt="" className="size-4" />
                <span>plgsantos@icloud.com</span>
              </a>
              <div className="flex items-center gap-2">
                <img src={phoneIcon} alt="" className="size-4" />
                <span>+55 (11) 95090-3204</span>
              </div>
              <div className="flex items-center gap-2">
                <img src={locationIcon} alt="" className="size-4" />
                <span>Itatiba - SP, Brasil</span>
              </div>
            </div>
            <a
              href="https://linkedin.com/in/pedrolucassantos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <img src={linkedinIcon} alt="" className="size-4" />
              <span>linkedin.com/in/pedrolucassantos</span>
              <img src={externalIcon} alt="" className="size-3" />
            </a>
          </div>
        </header>

        <main className="px-10 pt-10 pb-10 print:p-8">
          {/* Professional Summary */}
          <section className="mb-8">
            <h2 className="text-[20px] font-bold text-[#0f172b] uppercase tracking-[1px] border-b-2 border-[#0f172b] pb-2 mb-4">
              Resumo Profissional
            </h2>
            <p className="text-[#314158] text-[16px] leading-[26px] text-justify max-w-[714px]">
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
            <h2 className="text-[20px] font-bold text-[#0f172b] uppercase tracking-[1px] border-b-2 border-[#0f172b] pb-2 mb-6">
              Conhecimentos Técnicos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Row 1: Backend & API Management (Full Width) */}
              <div className="md:col-span-2 skill-card px-[17px] pt-[17px] pb-[17px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
                <h3 className="font-bold text-[#1d293d] mb-3 flex items-center gap-2 text-[16px] uppercase">
                  <span className="w-[6px] h-[6px] bg-[#0f172b] rounded-full"></span>
                  Backend & API Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px]">
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                      <span>
                        <strong>Arquitetura de serviços</strong>
                        , organização em camadas, Service
                        Classes, Event Listeners, API Gateway,
                        Mensageria.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                      <span>
                        <strong>Apigee Edge & Apigee X</strong>{" "}
                        – API-First, OpenAPI 3.0/Swagger,
                        proxies, policies, OAuth2, JWT, mTLS.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                      <span>
                        <strong>Versionamentos de APIs</strong>,
                        controle de contratos e governança
                        enterprise.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                      <span>
                        <strong>
                          PHP (15+), Node(4+), Java(1+){" "}
                        </strong>{" "}
                        – ~20 anos de experiência, modernização
                        de legados e aplicações enterprise.
                      </span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px]">
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                      <span>
                        <strong>Laravel</strong> – RESTful APIs,
                        API Resources, Middleware, Queues, Jobs,
                        Cron, Eloquent ORM.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                      <span>
                        <strong>Drupal</strong> – RESTful APIs,
                        API Resources, API Modules, API Themes,
                        Middleware, Services, Queues, Jobs,
                        Cron, Eloquent ORM.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                      <span>
                        <strong>Integrações</strong> entre
                        microsserviços (REST/RPC), padrões
                        orientados a domínio.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
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
              <div className="skill-card px-[17px] pt-[17px] pb-[17px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
                <h3 className="font-bold text-[#1d293d] mb-3 flex items-center gap-2 text-[16px] uppercase">
                  <span className="w-[6px] h-[6px] bg-[#0f172b] rounded-full"></span>
                  Frontend & Portais
                </h3>
                <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px]">
                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                    <span>
                      <strong>React, Vue.js </strong>–
                      integração com APIs e portais
                      corporativos.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                    <span>
                      <strong>Frameworks</strong> Mondrian,
                      Tailwind CSS, Bootstrap, UX/UI orientado a
                      produto.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                    <span>
                      <strong>Construções</strong> jornadas
                      digitais integradas a plataformas de APIs
                      e monitoramento.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                    <span>
                      <strong>Drupal</strong> (módulos
                      customizados, sustentação, migração de
                      ambientes), Twig, Blade, Html.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Dados & Performance */}
              <div className="skill-card px-[17px] pt-[17px] pb-[17px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
                <h3 className="font-bold text-[#1d293d] mb-3 flex items-center gap-2 text-[16px] uppercase">
                  <span className="w-[6px] h-[6px] bg-[#0f172b] rounded-full"></span>
                  Dados & Performance
                </h3>
                <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px]">
                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                    <span>
                      <strong>MySQL, MongoDB</strong> –
                      modelagem relacional e não relacional.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                    <span>
                      <strong>SQL</strong> otimização, queries,
                      tuning de performance.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                    <span>
                      <strong>BigQuery</strong> – integrações
                      analíticas e suporte a camadas de dados.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                    <span>
                      <strong>Redis, Memcached</strong> –
                      estratégias de cache e melhoria de
                      throughput.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Row 3: Cloud, DevOps & Plataforma (Full Width) */}
              <div className="md:col-span-2 skill-card px-[17px] pt-[17px] pb-[17px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
                <h3 className="font-bold text-[#1d293d] mb-3 flex items-center gap-2 text-[16px] uppercase">
                  <span className="w-[6px] h-[6px] bg-[#0f172b] rounded-full"></span>
                  Cloud, DevOps & Plataforma
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px]">
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                      <span>
                        <strong>AWS</strong> (ECS, Lambda, RDS,
                        EKS) – atuação em ambientes corporativos
                        híbridos.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                      <span>
                        <strong>Painéis administrativos</strong>{" "}
                        AWS & GCP (IAM, redes, ambientes,
                        controle de acesso).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                      <span>
                        <strong>Jenkins</strong> – pipelines
                        CI/CD, build, validação, deploy e
                        rollback.
                      </span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px]">
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                      <span>
                        <strong>Docker</strong>, versionamento
                        Git, esteiras corporativas de entrega
                        contínua.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                      <span>
                        <strong>Governança</strong> mudanças
                        (RDM, Chamados, Ambientes, Jira,
                        Automações), DevSecOps,CCoE.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
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
              <div className="md:col-span-2 skill-card px-[21px] pt-[21px] pb-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
                <p className="text-[#314158] text-[14px] leading-[20px] font-medium">
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
            <h2 className="text-[20px] font-bold text-[#0f172b] uppercase tracking-[1px] border-b-2 border-[#0f172b] pb-2 mb-6">
              Experiência Profissional
            </h2>

            <div className="space-y-4">
              {/* Claro */}
              <div className="bg-[#f8fafc] experience-card p-6 rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4 border-b border-[#e2e8f0] pb-2">
                  <div>
                    <p className="text-[#314158] font-medium bg-[#f1f5f9]">
                      <strong>Claro Brasil</strong> (Jump Label
                      / Global Hitss)
                    </p>
                    <h3 className="text-[18px] font-bold text-[#0f172b]">
                      Engenheiro de Software Sênior | Líder
                      Técnico
                    </h3>
                  </div>
                  <span className="text-[#1d293d] text-[14px] font-bold bg-white border border-[#e2e8f0] px-[13px] py-[5px] rounded mt-2 md:mt-0 whitespace-nowrap">
                    Set/2024 - Presente
                  </span>
                </div>

                <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px] ml-1">
                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[4px] h-[4px] bg-[#0f172b] rounded-full"></span>
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
                    <span className="mt-[6px] min-w-[4px] h-[4px] bg-[#0f172b] rounded-full"></span>
                    <span>
                      Liderança estratégica na migração de{" "}
                      <strong>Apigee Edge para Apigee X</strong>
                      , definindo modelo híbrido, mitigação de
                      riscos e alinhamento com arquitetura
                      corporativa.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[4px] h-[4px] bg-[#0f172b] rounded-full"></span>
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
                    <span className="mt-[6px] min-w-[4px] h-[4px] bg-[#0f172b] rounded-full"></span>
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
                    <span className="mt-[6px] min-w-[4px] h-[4px] bg-[#0f172b] rounded-full"></span>
                    <span>
                      Gestão de mudanças (RDM), abertura e
                      acompanhamento de chamados, controle de
                      ambientes e esteiras CI/CD, assegurando
                      qualidade e estabilidade em produção.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[4px] h-[4px] bg-[#0f172b] rounded-full"></span>
                    <span>
                      Apoio técnico na estruturação do portal{" "}
                      <strong>OpenGateway</strong>, integrando
                      BigQuery e fluxos digitais de contratação.
                    </span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[4px] h-[4px] bg-[#0f172b] rounded-full"></span>
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
              <div className="experience-card p-6 rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4 border-b border-[#e2e8f0] pb-2">
                  <div>
                    <h3 className="text-[18px] font-bold text-[#0f172b]">
                      Líder de Projeto / Desenvolvedor PHP
                    </h3>
                    <p className="text-[#314158] font-medium">
                      Adiante Group
                    </p>
                  </div>
                  <span className="text-[#45556c] text-[14px] font-semibold bg-white border border-[#e2e8f0] px-[13px] py-[5px] rounded mt-2 md:mt-0 whitespace-nowrap">
                    Jan/2021 - Jul/2024
                  </span>
                </div>
                <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px] ml-1">
                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[4px] h-[4px] bg-[#0f172b] rounded-full"></span>
                    <span>
                      Construção de sistemas web com{" "}
                      <strong>Laravel</strong>, focando em
                      padrões de código e performance.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-[6px] min-w-[4px] h-[4px] bg-[#0f172b] rounded-full"></span>
                    <span>
                      Liderança técnica, organização de demandas
                      e integração com áreas parceiras.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Hydra & AdsMoby & Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hydra Data */}
                <div className="experience-card p-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none h-full">
                  <div className="flex flex-col mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-[#0f172b] text-[16px]">
                        DEV. FullStack Laravel
                      </h3>
                      <span className="text-[#62748e] text-[12px] font-semibold whitespace-nowrap bg-white px-[9px] py-[3px] rounded border border-[#e2e8f0]">
                        2020 - 2021
                      </span>
                    </div>
                    <p className="text-[#314158] text-[14px] font-medium">
                      Hydra Data
                    </p>
                  </div>
                  <p className="text-[#314158] text-[14px] leading-[22.75px]">
                    Desenvolvimento full stack, modelagem de
                    dados e otimização de queries.
                  </p>
                </div>

                {/* AdsMoby */}
                <div className="experience-card p-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none h-full">
                  <div className="flex flex-col mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-[#0f172b] text-[16px]">
                        Programador Web
                      </h3>
                      <span className="text-[#62748e] text-[12px] font-semibold whitespace-nowrap bg-white px-[9px] py-[3px] rounded border border-[#e2e8f0]">
                        2018 - 2019
                      </span>
                    </div>
                    <p className="text-[#314158] text-[14px] font-medium">
                      AdsMoby
                    </p>
                  </div>
                  <p className="text-[#314158] text-[14px] leading-[22.75px]">
                    Manutenção de aplicações PHP/MySQL, foco em
                    performance e estabilidade.
                  </p>
                </div>

                {/* Projetos Próprios */}
                <div className="experience-card p-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none h-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                    <div>
                      <h3 className="font-bold text-[#0f172b] text-[16px]">
                        Projetos Próprios (SaaS)
                      </h3>
                      <p className="text-[#314158] text-[14px] font-medium">
                        Ezead.club + Automações
                      </p>
                    </div>
                    <span className="text-[#62748e] text-[12px] font-semibold whitespace-nowrap bg-white px-[9px] py-[3px] rounded border border-[#e2e8f0] mt-2 md:mt-0">
                      Em 2017
                    </span>
                  </div>
                  <p className="text-[#314158] text-[14px] leading-[22.75px]">
                    Construção de plataforma SaaS multi-tenant,
                    arquitetura de microsserviços e operação
                    completa (CI/CD, observabilidade). * Product
                    Engineer
                  </p>
                </div>
              </div>

              {/* Consultoria & Projetos (2017-2019) */}
              <div className="experience-card p-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
                <h3 className="font-bold text-[#0f172b] text-[16px] mb-3 border-b border-[#e2e8f0] pb-2">
                  Atuação em Projetos & Consultoria (2017 -
                  2019)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-[6px] h-[6px] bg-[#90a1b9] rounded-full"></span>
                    <span className="text-[#314158]">
                      <strong>Meeta Solutions</strong>{" "}
                      (FullStack)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-[6px] h-[6px] bg-[#90a1b9] rounded-full"></span>
                    <span className="text-[#314158]">
                      <strong>Supralog</strong> (FullStack)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-[6px] h-[6px] bg-[#90a1b9] rounded-full"></span>
                    <span className="text-[#314158]">
                      <strong>OmegaBCD</strong> (FullStack)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-[6px] h-[6px] bg-[#90a1b9] rounded-full"></span>
                    <span className="text-[#314158]">
                      <strong>SUITE IT</strong>{" "}
                      (Chatbot/DialogFlow)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-[6px] h-[6px] bg-[#90a1b9] rounded-full"></span>
                    <span className="text-[#314158]">
                      <strong>Brasil Self Service</strong>{" "}
                      (Frontend)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-[6px] h-[6px] bg-[#90a1b9] rounded-full"></span>
                    <span className="text-[#314158]">
                      <strong>Yubank</strong> (Backend API)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Education & Certifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6">
            {/* Education */}
            <section className="md:col-span-1 print:col-span-1 bg-white pt-4">
              <h2 className="text-[18px] font-bold text-[#0f172b] uppercase tracking-[0.9px] border-b-2 border-[#0f172b] pb-2 mb-4">
                Formação
              </h2>
              <div className="space-y-4">
                <div className="break-inside-avoid">
                  <h3 className="font-bold text-[#0f172b] text-[14px]">
                    Análise e Desenv. de Software
                  </h3>
                  <p className="text-[#314158] text-[14px]">
                    Univ. Padre Anchieta
                  </p>
                  <span className="text-[#62748e] text-[12px]">
                    2024 - 2026 (Em conclusão)
                  </span>
                </div>
                <div className="break-inside-avoid">
                  <h3 className="font-bold text-[#0f172b] text-[14px]">
                    Sistemas de Informação
                  </h3>
                  <p className="text-[#314158] text-[14px]">
                    Univ. Padre Anchieta
                  </p>
                  <span className="text-[#62748e] text-[12px]">
                    Concluído em 2008
                  </span>
                </div>
              </div>
            </section>

            {/* Certifications */}
            <section className="md:col-span-2 print:col-span-2 pt-4">
              <h2 className="text-[18px] font-bold text-[#0f172b] uppercase tracking-[0.9px] border-b-2 border-[#0f172b] pb-2 mb-4">
                Especializações
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3">
                <div className="bg-[#f8fafc] p-3 rounded border border-[#f1f5f9] break-inside-avoid">
                  <strong className="block text-[#0f172b] text-[14px]">
                    PHP Laravel Avançado
                  </strong>
                  <span className="text-[#45556c] text-[12px]">
                    SaaS, APIs, Queues, Modules, Jetstream
                  </span>
                </div>
                <div className="bg-[#f8fafc] p-3 rounded border border-[#f1f5f9] break-inside-avoid">
                  <strong className="block text-[#0f172b] text-[14px]">
                    Arquitetura de APIs
                  </strong>
                  <span className="text-[#45556c] text-[12px]">
                    RESTful, OAuth2/JWT, Gateways
                  </span>
                </div>
                <div className="bg-[#f8fafc] p-3 rounded border border-[#f1f5f9] break-inside-avoid">
                  <strong className="block text-[#0f172b] text-[14px]">
                    DevOps & Cloud
                  </strong>
                  <span className="text-[#45556c] text-[12px]">
                    AWS, Docker, CI/CD
                  </span>
                </div>
                <div className="bg-[#f8fafc] p-3 rounded border border-[#f1f5f9] break-inside-avoid">
                  <strong className="block text-[#0f172b] text-[14px]">
                    IA Aplicada
                  </strong>
                  <span className="text-[#45556c] text-[12px]">
                    LLMs, RAG, Automação
                  </span>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <style>{`
        /* Reset do container root para evitar margens/paddings inesperados */
        #root {
          min-height: 100vh;
        }

        /* Font family explicita para garantir consistencia cross-environment */
        .font-sans {
          font-family: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        }

        @media print {
          /* Configuração da página A4 SEM margens - mantém layout visual original */
          @page {
            size: A4 portrait;
            margin: 0;
          }

          /* Reset root e body para impressao limpa */
          #root {
            min-height: auto;
            padding: 0;
            margin: 0;
            background: white !important;
          }
          
          /* Força cores exatas para PDF ATS */
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Header mantém fundo escuro */
          header {
            background: #0f172b !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Controle de viúvas e órfãos para melhor quebra de texto */
          p, li, span {
            orphans: 2;
            widows: 2;
          }
          
          /* Mantém títulos junto com o conteúdo seguinte */
          h1, h2, h3, h4 {
            break-after: avoid;
            page-break-after: avoid;
          }
          
          /* Permite quebra dentro de cards para evitar espaços em branco excessivos */
          .experience-card, .skill-card {
            break-inside: auto;
            page-break-inside: auto;
          }
        }
      `}</style>
    </div>
  );
}
import { useEffect, useState } from "react";
import type { ResumeData, SkillGroup as SkillGroupType } from "./types/resume";
import { useOrchestrator } from "./agents/useOrchestrator";
import { JobPanel } from "./components/JobPanel";

/* ── Inline SVG icon components (replacing expired Figma MCP asset URLs) ── */

const IconEmail = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconPhone = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconLocation = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconLinkedin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const IconExternalLink = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

const IconDownload = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const IconPrint = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect width="12" height="8" x="6" y="14" />
  </svg>
);

/* ── Inline markup renderer: converte **bold** em <strong> ── */

function Markup({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/* ── Renderizador de grupo de skills ── */

function SkillGroupCard({ group }: { group: SkillGroupType }) {
  // Paragraph mode (ex: "Conhecimento Operacional")
  if (group.tipo === "paragraph") {
    return (
      <div className="md:col-span-2 skill-card px-[21px] pt-[21px] pb-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
        <p className="text-[#314158] text-[14px] leading-[20px] font-medium">
          {group.skills[0].nome}
        </p>
      </div>
    );
  }

  // Full-width with 2-column grid
  if (group.fullWidth) {
    const mid = Math.ceil(group.skills.length / 2);
    const leftSkills = group.skills.slice(0, mid);
    const rightSkills = group.skills.slice(mid);

    return (
      <div className="md:col-span-2 skill-card px-[17px] pt-[17px] pb-[17px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
        <h3 className="font-bold text-[#1d293d] mb-3 flex items-center gap-2 text-[16px] uppercase">
          <span className="w-[6px] h-[6px] bg-[#0f172b] rounded-full"></span>
          {group.titulo}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px]">
            {leftSkills.map((skill, si) => (
              <li key={si} className="flex items-start gap-2">
                <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                <span>
                  <Markup text={skill.nome} />
                </span>
              </li>
            ))}
          </ul>
          <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px]">
            {rightSkills.map((skill, si) => (
              <li key={si} className="flex items-start gap-2">
                <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                <span>
                  <Markup text={skill.nome} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Half-width single column
  return (
    <div className="skill-card px-[17px] pt-[17px] pb-[17px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
      <h3 className="font-bold text-[#1d293d] mb-3 flex items-center gap-2 text-[16px] uppercase">
        <span className="w-[6px] h-[6px] bg-[#0f172b] rounded-full"></span>
        {group.titulo}
      </h3>
      <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px]">
        {group.skills.map((skill, si) => (
          <li key={si} className="flex items-start gap-2">
            <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
            <span>
              <Markup text={skill.nome} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Componente principal ── */

export default function App({
  data: dataProp,
}: {
  data?: ResumeData;
}) {
  const [isReady, setIsReady] = useState(false);
  const [jobPanelOpen, setJobPanelOpen] = useState(false);
  const { state, analyze, reset, isProcessing, isTailored } =
    useOrchestrator();

  // Usar dados da prop se fornecidos, senão dados ativos do orchestrator
  const data = dataProp || state.activeData;

  const {
    pessoal,
    resumo,
    skill_groups,
    experiencias,
    projetos,
    consultorias,
    formacao,
    especializacoes,
  } = data;

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
      filename: `Curriculo_${pessoal.nome.replace(/\s+/g, "_")}.pdf`,
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

  // Split experiences by display style
  const featuredExps = experiencias.filter((e) => e.atual);
  const standardExps = experiencias.filter(
    (e) => !e.atual && e.realizacoes.length >= 2,
  );
  const compactExps = experiencias.filter(
    (e) => !e.atual && e.realizacoes.length < 2,
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] print:bg-white py-8 print:p-0 font-sans text-[#0f172b]">
      {/* Job Analysis Panel */}
      <JobPanel
        isOpen={jobPanelOpen}
        onClose={() => setJobPanelOpen(false)}
        onAnalyze={analyze}
        onReset={reset}
        isProcessing={isProcessing}
        isTailored={isTailored}
        result={state.lastResult}
      />

      {/* Action Buttons */}
      <div className="fixed right-8 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3 print:hidden">
        <button
          onClick={() => setJobPanelOpen(true)}
          className={`size-16 rounded-full shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 ${isTailored ? "bg-blue-600 ring-2 ring-blue-300" : "bg-[#6366f1]"}`}
          title="Analisar Vaga"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto size-6 text-white"
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <circle cx="11.5" cy="14.5" r="2.5" />
            <path d="M13.3 16.3 15 18" />
          </svg>
        </button>

        <button
          onClick={handleExportPDF}
          className="size-16 rounded-full bg-[#009966] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-transform hover:scale-105"
          title="Exportar PDF (Visual)"
        >
          <IconDownload className="mx-auto size-6 text-white" />
        </button>

        <button
          onClick={handlePrint}
          className="size-16 rounded-full bg-[#0f172b] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-transform hover:scale-105"
          title="Imprimir / PDF para ATS (Texto Selecionável)"
        >
          <IconPrint className="mx-auto size-6 text-white" />
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
              {pessoal.nome}
            </h1>
            <p className="text-[20px] leading-[28px] text-[#cad5e2] font-light tracking-[0.5px]">
              {pessoal.titulo}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 text-[14px] leading-[20px] text-[#cad5e2]">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href={`mailto:${pessoal.email}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <IconEmail className="size-4" />
                <span>{pessoal.email}</span>
              </a>
              <div className="flex items-center gap-2">
                <IconPhone className="size-4" />
                <span>{pessoal.telefone}</span>
              </div>
              <div className="flex items-center gap-2">
                <IconLocation className="size-4" />
                <span>{pessoal.localizacao}</span>
              </div>
            </div>
            <a
              href={pessoal.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <IconLinkedin className="size-4" />
              <span>
                {pessoal.linkedin.replace(/^https?:\/\//, "")}
              </span>
              <IconExternalLink className="size-3" />
            </a>
          </div>
        </header>

        <main className="px-10 pt-10 pb-10 print:p-8">
          {/* Professional Summary */}
          <section className="mb-8">
            <h2 className="text-[20px] font-bold text-[#0f172b] uppercase tracking-[1px] border-b-2 border-[#0f172b] pb-2 mb-4">
              Resumo Profissional
            </h2>
            {resumo.paragrafos.map((p, i) => (
              <p
                key={i}
                className="text-[#314158] text-[16px] leading-[26px] text-justify max-w-[714px]"
              >
                {p}
              </p>
            ))}
          </section>

          {/* Skills */}
          <section className="mb-8">
            <h2 className="text-[20px] font-bold text-[#0f172b] uppercase tracking-[1px] border-b-2 border-[#0f172b] pb-2 mb-6">
              Conhecimentos Técnicos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skill_groups.map((group, gi) => (
                <SkillGroupCard key={gi} group={group} />
              ))}
            </div>
          </section>

          {/* Experience */}
          <section className="mb-8">
            <h2 className="text-[20px] font-bold text-[#0f172b] uppercase tracking-[1px] border-b-2 border-[#0f172b] pb-2 mb-6">
              Experiência Profissional
            </h2>

            <div className="space-y-4">
              {/* Featured (current) experiences */}
              {featuredExps.map((exp, i) => {
                const parenIdx = exp.empresa.indexOf("(");
                const mainName =
                  parenIdx > 0
                    ? exp.empresa.slice(0, parenIdx).trim()
                    : exp.empresa;
                const detail =
                  parenIdx > 0
                    ? ` ${exp.empresa.slice(parenIdx)}`
                    : "";
                return (
                  <div
                    key={`f-${i}`}
                    className="bg-[#f8fafc] experience-card p-6 rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4 border-b border-[#e2e8f0] pb-2">
                      <div>
                        <p className="text-[#314158] font-medium bg-[#f1f5f9]">
                          <strong>{mainName}</strong>
                          {detail}
                        </p>
                        <h3 className="text-[18px] font-bold text-[#0f172b]">
                          {exp.cargo}
                        </h3>
                      </div>
                      <span className="text-[#1d293d] text-[14px] font-bold bg-white border border-[#e2e8f0] px-[13px] py-[5px] rounded mt-2 md:mt-0 whitespace-nowrap">
                        {exp.periodo}
                      </span>
                    </div>

                    <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px] ml-1">
                      {exp.realizacoes.map((r, ri) => (
                        <li
                          key={ri}
                          className="flex items-start gap-2"
                        >
                          <span className="mt-[6px] min-w-[4px] h-[4px] bg-[#0f172b] rounded-full"></span>
                          <span>
                            <Markup text={r} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              {/* Standard experiences */}
              {standardExps.map((exp, i) => (
                <div
                  key={`s-${i}`}
                  className="experience-card p-6 rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4 border-b border-[#e2e8f0] pb-2">
                    <div>
                      <h3 className="text-[18px] font-bold text-[#0f172b]">
                        {exp.cargo}
                      </h3>
                      <p className="text-[#314158] font-medium">
                        {exp.empresa}
                      </p>
                    </div>
                    <span className="text-[#45556c] text-[14px] font-semibold bg-white border border-[#e2e8f0] px-[13px] py-[5px] rounded mt-2 md:mt-0 whitespace-nowrap">
                      {exp.periodo}
                    </span>
                  </div>
                  <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px] ml-1">
                    {exp.realizacoes.map((r, ri) => (
                      <li
                        key={ri}
                        className="flex items-start gap-2"
                      >
                        <span className="mt-[6px] min-w-[4px] h-[4px] bg-[#0f172b] rounded-full"></span>
                        <span>
                          <Markup text={r} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Compact experiences + Projects grid */}
              {(compactExps.length > 0 || projetos.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {compactExps.map((exp, i) => (
                    <div
                      key={`c-${i}`}
                      className="experience-card p-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none h-full"
                    >
                      <div className="flex flex-col mb-3">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-[#0f172b] text-[16px]">
                            {exp.cargo}
                          </h3>
                          <span className="text-[#62748e] text-[12px] font-semibold whitespace-nowrap bg-white px-[9px] py-[3px] rounded border border-[#e2e8f0]">
                            {exp.periodo}
                          </span>
                        </div>
                        <p className="text-[#314158] text-[14px] font-medium">
                          {exp.empresa}
                        </p>
                      </div>
                      <p className="text-[#314158] text-[14px] leading-[22.75px]">
                        {exp.realizacoes[0]}
                      </p>
                    </div>
                  ))}

                  {projetos.map((proj, i) => (
                    <div
                      key={`p-${i}`}
                      className="experience-card p-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none h-full"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                        <div>
                          <h3 className="font-bold text-[#0f172b] text-[16px]">
                            {proj.nome}
                          </h3>
                          {proj.subtitulo && (
                            <p className="text-[#314158] text-[14px] font-medium">
                              {proj.subtitulo}
                            </p>
                          )}
                        </div>
                        {proj.periodo && (
                          <span className="text-[#62748e] text-[12px] font-semibold whitespace-nowrap bg-white px-[9px] py-[3px] rounded border border-[#e2e8f0] mt-2 md:mt-0">
                            {proj.periodo}
                          </span>
                        )}
                      </div>
                      <p className="text-[#314158] text-[14px] leading-[22.75px]">
                        {proj.descricao}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Consulting */}
              {consultorias.length > 0 && (
                <div className="experience-card p-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
                  <h3 className="font-bold text-[#0f172b] text-[16px] mb-3 border-b border-[#e2e8f0] pb-2">
                    Atuação em Projetos & Consultoria (2017 -
                    2019)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {consultorias.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2"
                      >
                        <span className="w-[6px] h-[6px] bg-[#90a1b9] rounded-full"></span>
                        <span className="text-[#314158]">
                          <strong>{c.empresa}</strong> (
                          {c.descricao})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                {formacao.map((f, i) => (
                  <div key={i} className="break-inside-avoid">
                    <h3 className="font-bold text-[#0f172b] text-[14px]">
                      {f.curso}
                    </h3>
                    <p className="text-[#314158] text-[14px]">
                      {f.instituicao}
                    </p>
                    <span className="text-[#62748e] text-[12px]">
                      {f.status === "em-andamento"
                        ? `${f.periodo} (Em conclusão)`
                        : f.periodo}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Specializations */}
            <section className="md:col-span-2 print:col-span-2 pt-4">
              <h2 className="text-[18px] font-bold text-[#0f172b] uppercase tracking-[0.9px] border-b-2 border-[#0f172b] pb-2 mb-4">
                Especializações
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3">
                {especializacoes.map((e, i) => (
                  <div
                    key={i}
                    className="bg-[#f8fafc] p-3 rounded border border-[#f1f5f9] break-inside-avoid"
                  >
                    <strong className="block text-[#0f172b] text-[14px]">
                      {e.titulo}
                    </strong>
                    <span className="text-[#45556c] text-[12px]">
                      {e.descricao}
                    </span>
                  </div>
                ))}
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

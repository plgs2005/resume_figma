/**
 * Resume — Preview visual do currículo no workspace.
 *
 * Mantém o layout visual original em A4 dentro da UI do workspace,
 * separado do comportamento de impressão/export.
 */

import { useEffect, useState } from "react";
import { ConfigActions } from "../../components/workspace/ConfigActions";
import {
    getResumeConfig,
    subscribeDomain,
    type ResumeConfig,
    type ResumeSection,
} from "../../lib/config-loader";
import { defaultResumeData } from "../../data/resume-default";
import { usePipeline, setTailoredResume } from "../../lib/pipeline-store";
import { buildTailoredResume } from "../../agents/resume-builder";
import { getSKEData, loadSKEData } from "../../lib/ske-bridge";
import type { ResumeData, SkillGroup as SkillGroupType } from "../../types/resume";

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

const IconFileText = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
    </svg>
);

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

function SkillGroupCard({ group }: { group: SkillGroupType }) {
    if (group.tipo === "paragraph") {
        return (
            <div className="md:col-span-2 skill-card px-[21px] pt-[21px] pb-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
                <p className="text-[#314158] text-[14px] leading-[20px] font-medium">
                    {group.skills[0]?.nome}
                </p>
            </div>
        );
    }

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
                    {[leftSkills, rightSkills].map((column, columnIndex) => (
                        <ul key={columnIndex} className="space-y-2 text-[#314158] text-[14px] leading-[22.75px]">
                            {column.map((skill, skillIndex) => (
                                <li key={skillIndex} className="flex items-start gap-2">
                                    <span className="mt-[6px] min-w-[3px] h-[3px] bg-[#90a1b9] rounded-full"></span>
                                    <span>
                                        <Markup text={skill.nome} />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="skill-card px-[17px] pt-[17px] pb-[17px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
            <h3 className="font-bold text-[#1d293d] mb-3 flex items-center gap-2 text-[16px] uppercase">
                <span className="w-[6px] h-[6px] bg-[#0f172b] rounded-full"></span>
                {group.titulo}
            </h3>
            <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px]">
                {group.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="flex items-start gap-2">
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

function getSectionLabel(sections: ResumeSection[], id: string, fallback: string): string {
    return sections.find((section) => section.id === id)?.label ?? fallback;
}

export default function Resume() {
    const [config, setConfig] = useState<ResumeConfig>(() => getResumeConfig());
    const [isGenerating, setIsGenerating] = useState(false);
    const pipeline = usePipeline();

    useEffect(() => {
        const unsub = subscribeDomain("resume", (cfg: ResumeConfig) => {
            setConfig(cfg);
        });
        return unsub;
    }, []);

    const handleGenerate = async () => {
        if (!pipeline.profileData || !pipeline.jobAnalysis) return;
        setIsGenerating(true);
        await new Promise((r) => setTimeout(r, 500));

        let ske = getSKEData();
        if (!ske) {
            try { ske = await loadSKEData(); } catch { /* ok sem SKE */ }
        }

        const tailored = buildTailoredResume(
            pipeline.profileData,
            pipeline.jobAnalysis,
            ske,
        );

        setTailoredResume(tailored);
        setIsGenerating(false);
    };

    const activeData: ResumeData = pipeline.tailoredResume
        ?? pipeline.profileData
        ?? defaultResumeData;

    const isTailored = !!pipeline.tailoredResume;
    const enabledSections = config.resume.sections
        .filter((section) => section.enabled)
        .sort((a, b) => a.order - b.order);

    const {
        pessoal,
        resumo,
        skill_groups,
        experiencias,
        projetos,
        consultorias,
        formacao,
        especializacoes,
    } = activeData;

    const featuredExps = experiencias.filter((experience) => experience.atual);
    const standardExps = experiencias.filter(
        (experience) => !experience.atual && experience.realizacoes.length >= 2,
    );
    const compactExps = experiencias.filter(
        (experience) => !experience.atual && experience.realizacoes.length < 2,
    );

    const header = config.resume.header ?? {
        title: "Resume Builder",
        subtitle: "Currículo dinâmico controlado por configuração",
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[28px] font-bold tracking-tight text-[#0f172a]">
                        {header.title}
                    </h1>
                    <p className="text-[15px] mt-1 text-[#64748b]">
                        {header.subtitle}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ConfigActions domain="resume" />
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !pipeline.profileData || !pipeline.jobAnalysis}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#6366f1] text-white rounded-lg text-[14px] font-medium hover:bg-[#4f46e5] transition-colors disabled:opacity-50"
                        title={
                            !pipeline.profileData
                                ? "Complete o Passo 2 (Profile) primeiro"
                                : !pipeline.jobAnalysis
                                    ? "Complete o Passo 3 (Jobs) primeiro"
                                    : ""
                        }
                    >
                        {isGenerating ? "Gerando…" : isTailored ? "✓ Regerar" : "Gerar Currículo Tailored"}
                    </button>
                </div>
            </div>

            {!pipeline.profileData && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <p className="text-[14px] text-amber-800">
                        <strong>Passos 1-2 pendentes:</strong> Conecte fontes em <strong>Sources</strong> e analise em <strong>Profile</strong>.
                    </p>
                </div>
            )}

            {pipeline.profileData && !pipeline.jobAnalysis && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <p className="text-[14px] text-amber-800">
                        <strong>Passo 3 pendente:</strong> Analise uma vaga em <strong>Jobs</strong> para gerar currículo tailored.
                    </p>
                </div>
            )}

            {isTailored && pipeline.jobAnalysis && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div className="flex-1">
                        <p className="text-[14px] font-medium text-emerald-800">
                            Pipeline completo — Currículo tailored para "{pipeline.jobAnalysis.parsed.titulo}"
                        </p>
                        <p className="text-[12px] text-emerald-600">
                            Aderência: <strong>{pipeline.jobAnalysis.match.aderencia}%</strong> · Skills matched: <strong>{pipeline.jobAnalysis.skills_encontradas.length}</strong> · Gaps: <strong>{pipeline.jobAnalysis.gaps.length}</strong>
                        </p>
                    </div>
                </div>
            )}

            <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3">
                    <IconFileText className="w-5 h-5 text-[#6366f1]" />
                    <div>
                        <p className="text-[14px] font-medium text-[#0f172a]">
                            Layout visual restaurado em A4
                        </p>
                        <p className="text-[12px] text-[#94a3b8]">
                            {enabledSections.length} seções ativas — alterações de configuração refletem em tempo real sem sobrescrever o preview visual.
                        </p>
                    </div>
                </div>
            </div>

            <div
                id="resume-content"
                className="mx-auto w-full max-w-[794px] bg-white shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] print:shadow-none print:max-w-none print:w-full"
            >
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
                            <a href={`mailto:${pessoal.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
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
                        {pessoal.linkedin && (
                            <a
                                href={pessoal.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-white transition-colors"
                            >
                                <IconLinkedin className="size-4" />
                                <span>{pessoal.linkedin.replace(/^https?:\/\//, "")}</span>
                                <IconExternalLink className="size-3" />
                            </a>
                        )}
                    </div>
                </header>

                <main className="px-10 pt-10 pb-10 print:p-8">
                    {enabledSections.map((section) => {
                        if (section.id === "profile") {
                            return (
                                <section key={section.id} className="mb-8 section-group">
                                    <h3 className="text-[20px] font-bold text-[#0f172b] uppercase tracking-[1px] border-b-2 border-[#0f172b] pb-2 mb-4">
                                        {getSectionLabel(enabledSections, "profile", "Resumo Profissional")}
                                    </h3>
                                    {resumo.paragrafos.map((paragraph, index) => (
                                        <p
                                            key={index}
                                            className="text-[#314158] text-[16px] leading-[26px] text-justify max-w-[714px]"
                                        >
                                            <Markup text={paragraph} />
                                        </p>
                                    ))}
                                </section>
                            );
                        }

                        if (section.id === "skills") {
                            return (
                                <section key={section.id} className="mb-8 section-group">
                                    <h3 className="text-[20px] font-bold text-[#0f172b] uppercase tracking-[1px] border-b-2 border-[#0f172b] pb-2 mb-6">
                                        {getSectionLabel(enabledSections, "skills", "Conhecimentos Técnicos")}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {skill_groups.map((group, index) => (
                                            <SkillGroupCard key={index} group={group} />
                                        ))}
                                    </div>
                                </section>
                            );
                        }

                        if (section.id === "experience") {
                            return (
                                <section key={section.id} className="mb-8 section-group">
                                    <h3 className="text-[20px] font-bold text-[#0f172b] uppercase tracking-[1px] border-b-2 border-[#0f172b] pb-2 mb-6">
                                        {getSectionLabel(enabledSections, "experience", "Experiência Profissional")}
                                    </h3>

                                    <div className="space-y-4">
                                        {featuredExps.map((exp, index) => {
                                            const parenIndex = exp.empresa.indexOf("(");
                                            const mainName = parenIndex > 0 ? exp.empresa.slice(0, parenIndex).trim() : exp.empresa;
                                            const detail = parenIndex > 0 ? ` ${exp.empresa.slice(parenIndex)}` : "";

                                            return (
                                                <div
                                                    key={`featured-${index}`}
                                                    className="bg-[#f8fafc] experience-card p-6 rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none"
                                                >
                                                    <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4 border-b border-[#e2e8f0] pb-2">
                                                        <div>
                                                            <p className="text-[#314158] font-medium bg-[#f1f5f9]">
                                                                <strong>{mainName}</strong>
                                                                {detail}
                                                            </p>
                                                            <h4 className="text-[18px] font-bold text-[#0f172b]">
                                                                {exp.cargo}
                                                            </h4>
                                                        </div>
                                                        <span className="text-[#1d293d] text-[14px] font-bold bg-white border border-[#e2e8f0] px-[13px] py-[5px] rounded mt-2 md:mt-0 whitespace-nowrap">
                                                            {exp.periodo}
                                                        </span>
                                                    </div>
                                                    <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px] ml-1">
                                                        {exp.realizacoes.map((item, itemIndex) => (
                                                            <li key={itemIndex} className="flex items-start gap-2">
                                                                <span className="mt-[6px] min-w-[4px] h-[4px] bg-[#0f172b] rounded-full"></span>
                                                                <span><Markup text={item} /></span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        })}

                                        {standardExps.map((exp, index) => (
                                            <div
                                                key={`standard-${index}`}
                                                className="experience-card p-6 rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none"
                                            >
                                                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4 border-b border-[#e2e8f0] pb-2">
                                                    <div>
                                                        <h4 className="text-[18px] font-bold text-[#0f172b]">
                                                            {exp.cargo}
                                                        </h4>
                                                        <p className="text-[#314158] font-medium">{exp.empresa}</p>
                                                    </div>
                                                    <span className="text-[#45556c] text-[14px] font-semibold bg-white border border-[#e2e8f0] px-[13px] py-[5px] rounded mt-2 md:mt-0 whitespace-nowrap">
                                                        {exp.periodo}
                                                    </span>
                                                </div>
                                                <ul className="space-y-2 text-[#314158] text-[14px] leading-[22.75px] ml-1">
                                                    {exp.realizacoes.map((item, itemIndex) => (
                                                        <li key={itemIndex} className="flex items-start gap-2">
                                                            <span className="mt-[6px] min-w-[4px] h-[4px] bg-[#0f172b] rounded-full"></span>
                                                            <span><Markup text={item} /></span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}

                                        {/* Compact experiences + Projects grid (matching original layout) */}
                                        {(compactExps.length > 0 || projetos.length > 0) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {compactExps.map((exp, index) => (
                                                    <div
                                                        key={`compact-${index}`}
                                                        className="experience-card p-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none h-full"
                                                    >
                                                        <div className="flex flex-col mb-3">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className="font-bold text-[#0f172b] text-[16px]">{exp.cargo}</h4>
                                                                <span className="text-[#62748e] text-[12px] font-semibold whitespace-nowrap bg-white px-[9px] py-[3px] rounded border border-[#e2e8f0]">
                                                                    {exp.periodo}
                                                                </span>
                                                            </div>
                                                            <p className="text-[#314158] text-[14px] font-medium">{exp.empresa}</p>
                                                        </div>
                                                        <p className="text-[#314158] text-[14px] leading-[22.75px]">
                                                            <Markup text={exp.realizacoes[0] ?? ""} />
                                                        </p>
                                                    </div>
                                                ))}

                                                {projetos.map((proj, index) => (
                                                    <div
                                                        key={`proj-${index}`}
                                                        className="experience-card p-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none h-full"
                                                    >
                                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                                                            <div>
                                                                <h4 className="font-bold text-[#0f172b] text-[16px]">{proj.nome}</h4>
                                                                {proj.subtitulo && (
                                                                    <p className="text-[#314158] text-[14px] font-medium">{proj.subtitulo}</p>
                                                                )}
                                                            </div>
                                                            {proj.periodo && (
                                                                <span className="text-[#62748e] text-[12px] font-semibold whitespace-nowrap bg-white px-[9px] py-[3px] rounded border border-[#e2e8f0] mt-2 md:mt-0">
                                                                    {proj.periodo}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[#314158] text-[14px] leading-[22.75px]">
                                                            <Markup text={proj.descricao} />
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {consultorias.length > 0 && (
                                            <div className="experience-card p-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none">
                                                <h4 className="font-bold text-[#0f172b] text-[16px] mb-3 border-b border-[#e2e8f0] pb-2">
                                                    Atuação em Projetos & Consultoria
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                                    {consultorias.map((consultoria, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <span className="w-[6px] h-[6px] bg-[#90a1b9] rounded-full"></span>
                                                            <span className="text-[#314158]">
                                                                <strong>{consultoria.empresa}</strong> ({consultoria.descricao})
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            );
                        }

                        if (section.id === "projects") {
                            // Projects + compactExps are rendered inside the experience section
                            // to match the original layout. Only render standalone if experience is disabled.
                            const experienceEnabled = enabledSections.some((s) => s.id === "experience");
                            if (experienceEnabled) return null;

                            return (
                                <section key={section.id} className="mb-8 section-group">
                                    <h3 className="text-[20px] font-bold text-[#0f172b] uppercase tracking-[1px] border-b-2 border-[#0f172b] pb-2 mb-6">
                                        {getSectionLabel(enabledSections, "projects", "Projetos")}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {compactExps.map((exp, index) => (
                                            <div
                                                key={`compact-${index}`}
                                                className="experience-card p-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none h-full"
                                            >
                                                <div className="flex flex-col mb-3">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-[#0f172b] text-[16px]">{exp.cargo}</h4>
                                                        <span className="text-[#62748e] text-[12px] font-semibold whitespace-nowrap bg-white px-[9px] py-[3px] rounded border border-[#e2e8f0]">
                                                            {exp.periodo}
                                                        </span>
                                                    </div>
                                                    <p className="text-[#314158] text-[14px] font-medium">{exp.empresa}</p>
                                                </div>
                                                <p className="text-[#314158] text-[14px] leading-[22.75px]">
                                                    <Markup text={exp.realizacoes[0] ?? ""} />
                                                </p>
                                            </div>
                                        ))}

                                        {projetos.map((project, index) => (
                                            <div
                                                key={index}
                                                className="experience-card p-[21px] rounded-[10px] border border-[#e2e8f0] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] print:shadow-none h-full"
                                            >
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-[#0f172b] text-[16px]">{project.nome}</h4>
                                                        {project.subtitulo && (
                                                            <p className="text-[#314158] text-[14px] font-medium">{project.subtitulo}</p>
                                                        )}
                                                    </div>
                                                    {project.periodo && (
                                                        <span className="text-[#62748e] text-[12px] font-semibold whitespace-nowrap bg-white px-[9px] py-[3px] rounded border border-[#e2e8f0] mt-2 md:mt-0">
                                                            {project.periodo}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[#314158] text-[14px] leading-[22.75px]">
                                                    <Markup text={project.descricao} />
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        }

                        if (section.id === "education") {
                            // Match original layout: 3-col grid — 1/3 Formação + 2/3 Especializações
                            const certEnabled = enabledSections.some((s) => s.id === "certifications");

                            return (
                                <div key={section.id} className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-6 mb-8">
                                    {/* Formação (1/3) */}
                                    <section className="md:col-span-1 print:col-span-1 bg-white pt-4 section-group">
                                        <h2 className="text-[18px] font-bold text-[#0f172b] uppercase tracking-[0.9px] border-b-2 border-[#0f172b] pb-2 mb-4">
                                            {getSectionLabel(enabledSections, "education", "Formação")}
                                        </h2>
                                        <div className="space-y-4">
                                            {formacao.map((item, index) => (
                                                <div key={index} className="break-inside-avoid">
                                                    <h3 className="font-bold text-[#0f172b] text-[14px]">{item.curso}</h3>
                                                    <p className="text-[#314158] text-[14px]">{item.instituicao}</p>
                                                    <span className="text-[#62748e] text-[12px]">
                                                        {item.status === "em-andamento" ? `${item.periodo} (Em conclusão)` : item.periodo}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Especializações (2/3) — rendered here when certifications is enabled */}
                                    {certEnabled && especializacoes.length > 0 && (
                                        <section className="md:col-span-2 print:col-span-2 pt-4 section-group">
                                            <h2 className="text-[18px] font-bold text-[#0f172b] uppercase tracking-[0.9px] border-b-2 border-[#0f172b] pb-2 mb-4">
                                                {getSectionLabel(enabledSections, "certifications", "Especializações")}
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3">
                                                {especializacoes.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-[#f8fafc] p-3 rounded border border-[#f1f5f9] break-inside-avoid"
                                                    >
                                                        <strong className="block text-[#0f172b] text-[14px]">{item.titulo}</strong>
                                                        <span className="text-[#45556c] text-[12px]">{item.descricao}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            );
                        }

                        if (section.id === "certifications") {
                            // Already rendered inside education section when both are enabled
                            const educationEnabled = enabledSections.some((s) => s.id === "education");
                            if (educationEnabled) return null;

                            if (especializacoes.length === 0) return null;

                            return (
                                <section key={section.id} className="mb-8 section-group">
                                    <h3 className="text-[20px] font-bold text-[#0f172b] uppercase tracking-[1px] border-b-2 border-[#0f172b] pb-2 mb-6">
                                        {getSectionLabel(enabledSections, "certifications", "Especializações")}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3">
                                        {especializacoes.map((item, index) => (
                                            <div
                                                key={index}
                                                className="bg-[#f8fafc] p-3 rounded border border-[#f1f5f9] break-inside-avoid"
                                            >
                                                <strong className="block text-[#0f172b] text-[14px]">{item.titulo}</strong>
                                                <span className="text-[#45556c] text-[12px]">{item.descricao}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        }

                        return null;
                    })}
                </main>
            </div>

            {config.resume.include_match_score && activeData.job_match && (
                <div className="rounded-xl border border-[#c7d2fe] bg-[#eef2ff] p-5 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="text-[14px] font-semibold text-[#4338ca]">
                            Match Score: {activeData.job_match.titulo_vaga}
                        </h3>
                        <span className="text-[20px] font-bold text-[#4338ca]">
                            {activeData.job_match.aderencia}%
                        </span>
                    </div>
                    {activeData.job_match.keywords_match.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {activeData.job_match.keywords_match.map((keyword, index) => (
                                <span key={index} className="text-[11px] px-2 py-0.5 rounded bg-[#dcfce7] text-[#16a34a]">
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }

                    #root {
                        min-height: auto;
                        padding: 0;
                        margin: 0;
                        background: white !important;
                    }

                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }

                    header {
                        background: #0f172b !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }

                    p, li, span {
                        orphans: 2;
                        widows: 2;
                    }

                    h1, h2, h3, h4 {
                        break-after: avoid;
                        page-break-after: avoid;
                    }

                    .section-group {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    .experience-card, .skill-card {
                        break-inside: auto;
                        page-break-inside: auto;
                    }
                }
            `}</style>
        </div>
    );
}

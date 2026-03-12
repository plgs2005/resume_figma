/**
 * Sidebar — Navegação principal do Career Intelligence Workspace.
 *
 * Design limpo inspirado no Notion: compacto, com ícones + labels.
 * Usa NavLink do React Router para highlight de rota ativa.
 */

import { NavLink } from "react-router-dom";
import { useWorkspaceConfig } from "../../hooks/useWorkspaceConfig";

/* ── Ícones inline (evita dependência externa pesada) ── */

const IconHome = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
);

const IconSources = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
);

const IconProfile = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const IconJobs = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
);

const IconResume = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M4 2v20h16V7l-5-5H4z" />
        <path d="M14 2v5h5" />
        <path d="M8 13h8" />
        <path d="M8 17h8" />
        <path d="M8 9h4" />
    </svg>
);

/* ── Itens do menu ── */

interface NavItem {
    label: string;
    to: string;
    icon: React.ReactNode;
    description: string;
    moduleId: string;
}

const navItems: NavItem[] = [
    {
        label: "Home",
        to: "/workspace/home",
        icon: <IconHome className="w-5 h-5" />,
        description: "Visão geral",
        moduleId: "home",
    },
    {
        label: "Sources",
        to: "/workspace/sources",
        icon: <IconSources className="w-5 h-5" />,
        description: "Fontes de dados",
        moduleId: "sources",
    },
    {
        label: "Profile",
        to: "/workspace/profile",
        icon: <IconProfile className="w-5 h-5" />,
        description: "Perfil inteligente",
        moduleId: "profile",
    },
    {
        label: "Jobs",
        to: "/workspace/jobs",
        icon: <IconJobs className="w-5 h-5" />,
        description: "Vagas e currículos",
        moduleId: "jobs",
    },
    {
        label: "Resume",
        to: "/workspace/resume",
        icon: <IconResume className="w-5 h-5" />,
        description: "Currículo configurável",
        moduleId: "resume",
    },
];

/* ── Componente ── */

export function Sidebar() {
    const { isModuleEnabled } = useWorkspaceConfig();
    const visibleItems = navItems.filter((item) => isModuleEnabled(item.moduleId));

    return (
        <aside className="w-[240px] min-h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] flex flex-col print:hidden">
            {/* Logo / Branding */}
            <div className="px-5 py-6 border-b border-[var(--sidebar-border)]">
                <h1 className="text-[15px] font-bold text-[var(--sidebar-foreground)] tracking-tight">
                    Career Intelligence
                </h1>
                <p className="text-[12px] text-[var(--sidebar-accent-foreground)] mt-0.5 opacity-60">
                    Workspace
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {visibleItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors duration-150 group ${isActive
                                ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-primary)] font-medium"
                                : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] opacity-70 hover:opacity-100"
                            }`
                        }
                    >
                        <span className="flex-shrink-0 opacity-80 group-hover:opacity-100">
                            {item.icon}
                        </span>
                        <div className="flex flex-col">
                            <span>{item.label}</span>
                            <span className="text-[11px] opacity-50 leading-tight">{item.description}</span>
                        </div>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[var(--sidebar-border)]">
                <p className="text-[11px] text-[var(--sidebar-foreground)] opacity-40">
                    v2.1 — Career Intelligence
                </p>
            </div>
        </aside>
    );
}

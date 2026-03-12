/**
 * WorkspaceCard — Card reutilizável para o Career Intelligence Workspace.
 *
 * Design limpo e modular, inspirado no Notion.
 * Aceita título, ícone, conteúdo filho e ação opcional.
 */

import { type ReactNode } from "react";

export interface WorkspaceCardProps {
    /** Título do card */
    title: string;
    /** Ícone opcional (ReactNode para flexibilidade) */
    icon?: ReactNode;
    /** Conteúdo do card */
    children: ReactNode;
    /** Classe CSS adicional */
    className?: string;
    /** Ação no clique (torna o card clicável) */
    onClick?: () => void;
    /** Badge de status opcional exibido ao lado do título */
    badge?: ReactNode;
}

export function WorkspaceCard({
    title,
    icon,
    children,
    className = "",
    onClick,
    badge,
}: WorkspaceCardProps) {
    const Component = onClick ? "button" : "div";

    return (
        <Component
            onClick={onClick}
            className={`
        bg-white rounded-xl border border-[#e2e8f0] p-6
        shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)]
        transition-all duration-200
        ${onClick ? "cursor-pointer hover:shadow-md hover:border-[#c7d2e0] active:scale-[0.99]" : ""}
        ${className}
      `}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#f1f5f9] text-[#475569]">
                            {icon}
                        </div>
                    )}
                    <h3 className="text-[16px] font-semibold text-[#0f172a]">{title}</h3>
                </div>
                {badge}
            </div>
            <div className="text-[14px] text-[#475569] leading-relaxed">
                {children}
            </div>
        </Component>
    );
}

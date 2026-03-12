/**
 * WorkspaceLayout — Layout persistente do Career Intelligence Workspace.
 *
 * Estrutura:
 * - Sidebar fixa à esquerda (240px)
 * - Área de conteúdo (Outlet) à direita, scrollável
 *
 * O Outlet do React Router renderiza a página correspondente à rota ativa.
 */

import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function WorkspaceLayout() {
    return (
        <div className="flex min-h-screen bg-[#f8fafc] font-sans text-[#0f172a] print:bg-white">
            <Sidebar />

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-8 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

/**
 * AppRouter — Ponto de entrada do Career Intelligence Workspace.
 *
 * Configura React Router com:
 * - /workspace/home     → Dashboard
 * - /workspace/sources  → Fontes de dados
 * - /workspace/profile  → Perfil inteligente
 * - /workspace/jobs     → Vagas e currículos (componente App original)
 * - / → redireciona para /workspace/home
 *
 * O componente App original (currículo) é preservado intacto em App.tsx
 * e renderizado dentro da rota /workspace/jobs.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WorkspaceLayout } from "./components/workspace/WorkspaceLayout";
import Home from "./pages/workspace/Home";
import Sources from "./pages/workspace/Sources";
import Profile from "./pages/workspace/Profile";
import Jobs from "./pages/workspace/Jobs";
import Resume from "./pages/workspace/Resume";
import QuickApply from "./pages/quick-apply/QuickApply";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Workspace layout com sidebar persistente */}
                <Route path="/workspace" element={<WorkspaceLayout />}>
                    <Route path="home" element={<Home />} />
                    <Route path="sources" element={<Sources />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="jobs" element={<Jobs />} />
                    <Route path="resume" element={<Resume />} />
                    {/* Default: /workspace → /workspace/home */}
                    <Route index element={<Navigate to="home" replace />} />
                </Route>

                {/* Quick Apply — modo de utilização imediata (independente do Workspace) */}
                <Route path="/quick-apply" element={<QuickApply />} />

                {/* Root redirect → workspace */}
                <Route path="/" element={<Navigate to="/workspace/home" replace />} />

                {/* Catch-all → workspace home */}
                <Route path="*" element={<Navigate to="/workspace/home" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

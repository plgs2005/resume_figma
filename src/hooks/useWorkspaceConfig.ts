/**
 * useWorkspaceConfig — Hook para acesso reativo à workspace-config.
 *
 * Expõe:
 * - enabledModules: lista de módulos ativos
 * - isModuleEnabled(id): check rápido
 * - features: flags de features
 * - config: objeto completo
 */

import { useState, useEffect, useCallback } from "react";
import {
    getWorkspaceConfig,
    subscribeDomain,
    type WorkspaceConfig,
} from "../lib/config-loader";

export interface WorkspaceConfigState {
    config: WorkspaceConfig;
    enabledModules: string[];
    isModuleEnabled: (moduleId: string) => boolean;
    features: {
        autoResume: boolean;
        autoJobMatching: boolean;
        careerGraph: boolean;
        configActions: boolean;
    };
    locale: string;
    theme: string;
}

export function useWorkspaceConfig(): WorkspaceConfigState {
    const [config, setConfig] = useState<WorkspaceConfig>(() => getWorkspaceConfig());

    useEffect(() => {
        const unsub = subscribeDomain("workspace", (cfg: WorkspaceConfig) => {
            setConfig(cfg);
        });
        return unsub;
    }, []);

    const enabledModules = config.workspace?.enabledModules ?? [
        "home", "profile", "sources", "jobs", "resume",
    ];

    const isModuleEnabled = useCallback(
        (moduleId: string) => enabledModules.includes(moduleId),
        [enabledModules],
    );

    const features = {
        autoResume: config.workspace?.features?.autoResume ?? false,
        autoJobMatching: config.workspace?.features?.autoJobMatching ?? false,
        careerGraph: config.workspace?.features?.careerGraph ?? false,
        configActions: config.workspace?.features?.configActions ?? true,
    };

    return {
        config,
        enabledModules,
        isModuleEnabled,
        features,
        locale: config.workspace?.locale ?? "pt-BR",
        theme: config.workspace?.theme ?? "default",
    };
}

/**
 * Connector Registry — Barrel export e registro centralizado de conectores.
 *
 * Uso:
 *   import { connectorRegistry, getConnector } from "@/sources/connectors";
 *
 *   const gh = getConnector("github");
 *   await gh.connect({ token: "..." });
 *   const data = await gh.scan();
 */

// ── Connector classes ────────────────────────────────────────────────

export { GitHubConnector } from "./github";
export { LocalRepoConnector } from "./local-repo";
export { LocalDirectoryConnector } from "./local-directory";
export { LinkedInExportConnector } from "./linkedin-export";
export { PdfResumeConnector } from "./pdf-resume";
export { ManualEntryConnector } from "./manual-entry";

// ── Types re-export ──────────────────────────────────────────────────

export type {
    SourceConnector,
    SourceData,
    SourceEvidence,
    ConnectorConfig,
    ConnectionStatus,
    SourceType,
} from "../types";

// ── Registry ─────────────────────────────────────────────────────────

import type { SourceConnector, SourceType } from "../types";
import { GitHubConnector } from "./github";
import { LocalRepoConnector } from "./local-repo";
import { LocalDirectoryConnector } from "./local-directory";
import { LinkedInExportConnector } from "./linkedin-export";
import { PdfResumeConnector } from "./pdf-resume";
import { ManualEntryConnector } from "./manual-entry";

/** Instâncias singleton dos conectores (factory lazy) */
const _instances = new Map<SourceType, SourceConnector>();

/** Fábricas dos conectores */
const CONNECTOR_FACTORIES: Record<SourceType, () => SourceConnector> = {
    github: () => new GitHubConnector(),
    "local-repo": () => new LocalRepoConnector(),
    "local-directory": () => new LocalDirectoryConnector(),
    "linkedin-export": () => new LinkedInExportConnector(),
    "pdf-resume": () => new PdfResumeConnector(),
    "manual-entry": () => new ManualEntryConnector(),
};

/**
 * Obter conector pelo tipo. Instância é lazy-created e reutilizada.
 */
export function getConnector(type: SourceType): SourceConnector {
    let instance = _instances.get(type);
    if (!instance) {
        const factory = CONNECTOR_FACTORIES[type];
        if (!factory) {
            throw new Error(`Conector não encontrado: ${type}`);
        }
        instance = factory();
        _instances.set(type, instance);
    }
    return instance;
}

/**
 * Criar nova instância de conector (sem cache singleton).
 */
export function createConnector(type: SourceType): SourceConnector {
    const factory = CONNECTOR_FACTORIES[type];
    if (!factory) {
        throw new Error(`Conector não encontrado: ${type}`);
    }
    return factory();
}

/**
 * Listar todos os tipos de conectores disponíveis.
 */
export function listConnectorTypes(): SourceType[] {
    return Object.keys(CONNECTOR_FACTORIES) as SourceType[];
}

/**
 * Obter metadados de todos os conectores disponíveis.
 */
export function listConnectors(): Array<{
    type: SourceType;
    label: string;
    description: string;
}> {
    return listConnectorTypes().map((type) => {
        const connector = getConnector(type);
        return {
            type: connector.type,
            label: connector.label,
            description: connector.description,
        };
    });
}

/**
 * Resetar todas as instâncias (útil para testes).
 */
export async function resetAllConnectors(): Promise<void> {
    for (const instance of _instances.values()) {
        await instance.disconnect();
    }
    _instances.clear();
}

/**
 * Source Connector Types — Contratos de dados para o pipeline de fontes.
 *
 * Fluxo: Source → SourceConnector.scan() → SourceEvidence[] → Skill Graph
 *
 * Cada conector implementa a interface SourceConnector e retorna evidências
 * normalizadas que alimentam o skill graph (Phase 4).
 */

// ── Tipos de fonte suportados ────────────────────────────────────────

export type SourceType =
    | "github"
    | "local-repo"
    | "local-directory"
    | "linkedin-export"
    | "pdf-resume"
    | "manual-entry";

// ── Status de conexão ────────────────────────────────────────────────

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

// ── Evidência extraída de uma fonte ──────────────────────────────────

export interface SourceEvidence {
    /** ID único da evidência */
    id: string;
    /** Tipo de evidência */
    kind: "project" | "skill" | "experience" | "certification" | "education";
    /** Nome legível (ex: nome do projeto, nome da skill) */
    label: string;
    /** Descrição curta */
    description?: string;
    /** Confiança na extração (0-100) */
    confidence: number;
    /** Tags/tecnologias associadas */
    tags: string[];
    /** De qual source veio */
    sourceId: string;
    /** Tipo da fonte original */
    sourceType: SourceType;
    /** Timestamp da extração */
    extractedAt: string;
    /** Metadados extras (dependem do conector) */
    metadata?: Record<string, unknown>;
}

// ── Dados consolidados de uma fonte ──────────────────────────────────

export interface SourceData {
    /** ID da fonte */
    sourceId: string;
    /** Tipo da fonte */
    sourceType: SourceType;
    /** Label humano */
    label: string;
    /** Todas as evidências extraídas */
    evidence: SourceEvidence[];
    /** Resumo da extração */
    summary: {
        totalProjects: number;
        totalSkills: number;
        totalExperiences: number;
        totalEvidence: number;
    };
    /** Timestamp da última varredura */
    scannedAt: string;
}

// ── Configuração de conexão (varia por conector) ─────────────────────

export interface ConnectorConfig {
    /** Token de autenticação (GitHub, etc.) */
    token?: string;
    /** Caminho local (diretório, repo) */
    path?: string;
    /** URL remota */
    url?: string;
    /** Arquivo para upload (PDF, ZIP, etc.) */
    file?: File;
    /** Dados manuais em texto */
    text?: string;
    /** Metadados extras */
    [key: string]: unknown;
}

// ── Interface principal do conector ──────────────────────────────────

export interface SourceConnector {
    /** Identificador único do conector */
    readonly id: string;
    /** Tipo da fonte */
    readonly type: SourceType;
    /** Label humano */
    readonly label: string;
    /** Descrição do conector */
    readonly description: string;
    /** Status atual da conexão */
    status: ConnectionStatus;

    /**
     * Conectar à fonte com a configuração fornecida.
     * Retorna true se a conexão foi bem-sucedida.
     */
    connect(config: ConnectorConfig): Promise<boolean>;

    /**
     * Escanear a fonte e extrair evidências.
     * Deve ser chamado após connect().
     */
    scan(): Promise<SourceData>;

    /**
     * Desconectar da fonte e limpar recursos.
     */
    disconnect(): Promise<void>;

    /**
     * Verificar se a fonte está acessível (healthcheck rápido).
     */
    validate(config: ConnectorConfig): Promise<boolean>;
}

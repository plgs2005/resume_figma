/**
 * ConfigActions — Botões reutilizáveis de Download/Upload Config por domínio.
 *
 * Uso: <ConfigActions domain="profile" />
 *
 * Exibe dois botões (Download Config, Upload Config) + banner de status
 * pós-importação. Aceita arquivos .json, .yml, .yaml, .md.
 */

import { useState, useRef, useCallback } from "react";
import {
    exportDomainConfig,
    importDomainConfig,
    type ConfigDomain,
} from "../../lib/config-loader";

/* ── Ícones inline (Lucide-style) ── */

const IconDownload = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
);

const IconUpload = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
);

/* ── Componente ── */

interface ConfigActionsProps {
    domain: ConfigDomain;
}

export function ConfigActions({ domain }: ConfigActionsProps) {
    const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownload = useCallback(() => {
        exportDomainConfig(domain);
    }, [domain]);

    const handleUpload = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportStatus(null);

        try {
            await importDomainConfig(domain, file);
            setImportStatus({
                type: "success",
                message: `Configuração "${domain}" importada com sucesso.`,
            });
        } catch (err) {
            setImportStatus({
                type: "error",
                message: err instanceof Error ? err.message : "Erro ao importar configuração.",
            });
        }

        // Limpa o input para permitir re-upload do mesmo arquivo
        e.target.value = "";
    }, [domain]);

    return (
        <>
            <div className="flex items-center gap-3">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e2e8f0] text-[#334155] rounded-lg text-[14px] font-medium hover:bg-[#f8fafc] transition-colors shadow-sm"
                >
                    <IconDownload className="w-4 h-4" />
                    Download Config
                </button>
                <button
                    onClick={handleUpload}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e2e8f0] text-[#334155] rounded-lg text-[14px] font-medium hover:bg-[#f8fafc] transition-colors shadow-sm"
                >
                    <IconUpload className="w-4 h-4" />
                    Upload Config
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.yml,.yaml,.md"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {importStatus && (
                <div className={`p-4 rounded-xl border text-[14px] ${importStatus.type === "success"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}>
                    {importStatus.message}
                </div>
            )}
        </>
    );
}

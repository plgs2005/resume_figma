/**
 * SelfKnowledgeEngine — Pipeline Orchestrator
 *
 * Orquestra as 4 camadas em sequência e persiste resultados.
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  Evidence,
  NormalizedBase,
  SkillBase,
  AnswerResult,
  JobMatchResult,
  JobDescription,
  SKEConfig,
  PipelineResult,
} from './types.js';
import { EvidenceCollector } from './collector.js';
import { EvidenceNormalizer } from './normalizer.js';
import { SkillExtractor } from './extractor.js';
import { AnswerEngine } from './answer-engine.js';
import { PromptExporter } from './prompt-export.js';
import type { PromptExportOptions, ExportedPrompt } from './prompt-export.js';
import { loadConfig, persistJson, safeReadJson, log, now, resolveGitHubConfig } from './utils.js';

export class SelfKnowledgeEngine {
  private config: SKEConfig;
  private collector: EvidenceCollector;
  private normalizer: EvidenceNormalizer;
  private extractor: SkillExtractor;
  private answerEngine: AnswerEngine | null = null;

  // Cached data
  private rawEvidences: Evidence[] = [];
  private normalizedBase: NormalizedBase | null = null;
  private skillBase: SkillBase | null = null;

  constructor(configPath?: string) {
    this.config = resolveGitHubConfig(loadConfig(configPath));
    this.collector = new EvidenceCollector(this.config);
    this.normalizer = new EvidenceNormalizer();
    this.extractor = new SkillExtractor();
  }

  // ─── Individual Pipeline Stages ──────────────────────────────────

  /**
   * Fase 1: Coleta de evidências
   */
  async collect(): Promise<PipelineResult> {
    const start = Date.now();
    const errors: string[] = [];

    try {
      this.rawEvidences = await this.collector.collect();
      persistJson(this.getOutputPath('raw-evidences.json'), this.rawEvidences);
      log.ok(`Evidências salvas em: ${this.getOutputPath('raw-evidences.json')}`);
    } catch (err) {
      errors.push(String(err));
      log.error(`Erro na coleta: ${err}`);
    }

    return {
      fase: 'collect',
      sucesso: errors.length === 0,
      duracao_ms: Date.now() - start,
      resumo: `${this.rawEvidences.length} evidências coletadas de ${this.config.scan_paths.length} caminho(s).`,
      erros: errors,
    };
  }

  /**
   * Fase 2: Normalização
   */
  async normalize(): Promise<PipelineResult> {
    const start = Date.now();
    const errors: string[] = [];

    try {
      // Carregar evidências se não estiverem em memória
      if (this.rawEvidences.length === 0) {
        const cached = safeReadJson<Evidence[]>(this.getOutputPath('raw-evidences.json'));
        if (cached) {
          this.rawEvidences = cached;
        } else {
          throw new Error('Sem evidências para normalizar. Execute "collect" primeiro.');
        }
      }

      this.normalizedBase = this.normalizer.normalize(this.rawEvidences);
      persistJson(this.getOutputPath('normalized-base.json'), this.normalizedBase);
      log.ok(`Base normalizada salva em: ${this.getOutputPath('normalized-base.json')}`);
    } catch (err) {
      errors.push(String(err));
      log.error(`Erro na normalização: ${err}`);
    }

    return {
      fase: 'normalize',
      sucesso: errors.length === 0,
      duracao_ms: Date.now() - start,
      resumo: this.normalizedBase
        ? `${this.normalizedBase.total_evidencias_unicas} evidências únicas em ${this.normalizedBase.projetos.length} projetos.`
        : 'Falha na normalização.',
      erros: errors,
    };
  }

  /**
   * Fase 3: Extração de skills
   */
  async extract(): Promise<PipelineResult> {
    const start = Date.now();
    const errors: string[] = [];

    try {
      // Carregar base normalizada se não estiver em memória
      if (!this.normalizedBase) {
        const cached = safeReadJson<NormalizedBase>(this.getOutputPath('normalized-base.json'));
        if (cached) {
          this.normalizedBase = cached;
        } else {
          throw new Error('Sem base normalizada. Execute "normalize" primeiro.');
        }
      }

      this.skillBase = this.extractor.extract(this.normalizedBase);
      persistJson(this.getOutputPath('skill-base.json'), this.skillBase);
      log.ok(`Base de skills salva em: ${this.getOutputPath('skill-base.json')}`);

      // Gerar relatório legível
      this.generateSkillReport();
    } catch (err) {
      errors.push(String(err));
      log.error(`Erro na extração: ${err}`);
    }

    return {
      fase: 'extract',
      sucesso: errors.length === 0,
      duracao_ms: Date.now() - start,
      resumo: this.skillBase
        ? `${this.skillBase.total_skills} skills extraídas. ${this.skillBase.padroes_identificados.length} padrões identificados.`
        : 'Falha na extração.',
      erros: errors,
    };
  }

  /**
   * Pipeline completo: collect → normalize → extract
   */
  async fullPipeline(): Promise<PipelineResult[]> {
    log.section('SELF KNOWLEDGE ENGINE — PIPELINE COMPLETO');
    const startTotal = Date.now();

    const results: PipelineResult[] = [];

    results.push(await this.collect());
    if (!results[results.length - 1].sucesso) return results;

    results.push(await this.normalize());
    if (!results[results.length - 1].sucesso) return results;

    results.push(await this.extract());

    const totalMs = Date.now() - startTotal;
    log.section(`PIPELINE COMPLETO — ${totalMs}ms`);

    for (const r of results) {
      log.info(`[${r.fase}] ${r.sucesso ? '✅' : '❌'} ${r.resumo} (${r.duracao_ms}ms)`);
    }

    return results;
  }

  // ─── Query Interface ─────────────────────────────────────────────

  /**
   * Responde uma pergunta com base na base factual.
   */
  async query(pergunta: string): Promise<AnswerResult> {
    await this.ensureAnswerEngine();
    return this.answerEngine!.query(pergunta);
  }

  /**
   * Cruza vaga com base factual.
   */
  async matchJob(jobText: string, titulo?: string, empresa?: string): Promise<JobMatchResult> {
    await this.ensureAnswerEngine();
    const jobDescription = this.answerEngine!.parseJobDescription(jobText, titulo, empresa);
    return this.answerEngine!.matchJob(jobDescription);
  }

  /**
   * Cruza vaga estruturada com base factual.
   */
  async matchJobStructured(job: JobDescription): Promise<JobMatchResult> {
    await this.ensureAnswerEngine();
    return this.answerEngine!.matchJob(job);
  }

  /**
   * Gera prompt estruturado para LLMs.
   */
  async exportPrompt(options: PromptExportOptions): Promise<ExportedPrompt> {
    await this.ensureAnswerEngine();

    if (!this.normalizedBase || !this.skillBase) {
      throw new Error('Base não inicializada. Execute o pipeline primeiro: full-pipeline');
    }

    const exporter = new PromptExporter(this.skillBase, this.normalizedBase);
    return exporter.export(options);
  }

  // ─── Report Generation ───────────────────────────────────────────

  private generateSkillReport(): void {
    if (!this.skillBase) return;

    const lines: string[] = [
      '# SelfKnowledgeEngine — Relatório de Skills',
      '',
      `**Gerado em:** ${now()}`,
      `**Total de skills:** ${this.skillBase.total_skills}`,
      `**Padrões de engenharia:** ${this.skillBase.padroes_identificados.length}`,
      '',
      '---',
      '',
      '## Skills por Nível',
      '',
    ];

    const levelLabels: Record<string, string> = {
      'dominio-solido': '🟢 Domínio Sólido',
      'experiencia-avancada': '🔵 Experiência Avançada',
      'experiencia-pratica': '🟡 Experiência Prática',
      'conhecimento-basico': '⚪ Conhecimento Básico',
    };

    for (const [level, label] of Object.entries(levelLabels)) {
      const skills = this.skillBase.por_nivel[level as keyof typeof this.skillBase.por_nivel];
      if (skills.length > 0) {
        lines.push(`### ${label}`);
        lines.push('');
        for (const skill of skills) {
          lines.push(`- ${skill}`);
        }
        lines.push('');
      }
    }

    lines.push('## Padrões de Engenharia Identificados');
    lines.push('');
    for (const pattern of this.skillBase.padroes_identificados) {
      lines.push(`- ${pattern}`);
    }
    lines.push('');

    lines.push('## Skills por Categoria');
    lines.push('');
    for (const [cat, skills] of Object.entries(this.skillBase.por_categoria)) {
      if (skills.length > 0) {
        lines.push(`### ${cat}`);
        for (const skill of skills) {
          lines.push(`- ${skill}`);
        }
        lines.push('');
      }
    }

    lines.push('---');
    lines.push('');
    lines.push('> Este relatório é gerado automaticamente pelo SelfKnowledgeEngine.');
    lines.push('> Todas as informações são baseadas exclusivamente em evidências factuais.');

    persistJson(this.getOutputPath('skill-report.md'), null); // Create dir
    writeFileSync(this.getOutputPath('skill-report.md'), lines.join('\n'), 'utf-8');
    log.ok(`Relatório de skills salvo em: ${this.getOutputPath('skill-report.md')}`);
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  private async ensureAnswerEngine(): Promise<void> {
    if (this.answerEngine) return;

    // Tentar carregar de cache
    if (!this.normalizedBase) {
      const cached = safeReadJson<NormalizedBase>(this.getOutputPath('normalized-base.json'));
      if (cached) {
        this.normalizedBase = cached;
      } else {
        throw new Error('Base não inicializada. Execute o pipeline primeiro: full-pipeline');
      }
    }

    if (!this.skillBase) {
      const cached = safeReadJson<SkillBase>(this.getOutputPath('skill-base.json'));
      if (cached) {
        this.skillBase = cached;
      } else {
        throw new Error('Skills não extraídas. Execute o pipeline primeiro: full-pipeline');
      }
    }

    this.answerEngine = new AnswerEngine(this.normalizedBase, this.skillBase);
  }

  private getOutputPath(filename: string): string {
    return join(this.config.output_dir, filename);
  }

  /**
   * Retorna a configuração atual do agente.
   */
  getConfig(): SKEConfig {
    return { ...this.config };
  }

  /**
   * Atualiza a configuração do agente e recria instâncias internas.
   */
  updateConfig(overrides: Partial<SKEConfig>): void {
    this.config = { ...this.config, ...overrides };
    this.collector = new EvidenceCollector(this.config);
  }
}

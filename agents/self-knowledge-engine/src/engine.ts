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
  KnowledgeTruth,
  ProjectsCatalog,
  DiscoveryConfig,
  IdentityProfile,
  IdentityResolutionConfig,
} from './types.js';
import { EvidenceCollector } from './collector.js';
import { EvidenceNormalizer } from './normalizer.js';
import { SkillExtractor } from './extractor.js';
import { AnswerEngine } from './answer-engine.js';
import { PromptExporter } from './prompt-export.js';
import type { PromptExportOptions, ExportedPrompt } from './prompt-export.js';
import { AuthorshipVerifier } from './authorship.js';
import { ProjectDiscovery } from './project-discovery.js';
import { IdentityResolver } from './identity-resolver.js';
import { loadConfig, persistJson, safeReadJson, log, now, resolveGitHubConfig } from './utils.js';

export class SelfKnowledgeEngine {
  private config: SKEConfig;
  private collector: EvidenceCollector;
  private normalizer: EvidenceNormalizer;
  private extractor: SkillExtractor;
  private authorshipVerifier: AuthorshipVerifier;
  private answerEngine: AnswerEngine | null = null;

  // Cached data
  private projectsCatalog: ProjectsCatalog | null = null;
  private identityProfile: IdentityProfile | null = null;
  private rawEvidences: Evidence[] = [];
  private normalizedBase: NormalizedBase | null = null;
  private skillBase: SkillBase | null = null;
  private knowledgeTruth: KnowledgeTruth | null = null;

  constructor(configPath?: string) {
    this.config = resolveGitHubConfig(loadConfig(configPath));
    this.collector = new EvidenceCollector(this.config);
    this.normalizer = new EvidenceNormalizer();
    this.extractor = new SkillExtractor();
    this.authorshipVerifier = new AuthorshipVerifier(this.config.github_username);
  }

  // ─── Individual Pipeline Stages ──────────────────────────────────

  /**
   * Fase 0: Project Discovery
   * Descobre e cataloga todos os projetos relevantes antes de qualquer análise.
   */
  async discovery(overrides?: Partial<DiscoveryConfig>): Promise<PipelineResult> {
    const start = Date.now();
    const errors: string[] = [];

    try {
      const discoveryConfig: DiscoveryConfig = {
        root_path: overrides?.root_path || this.config.scan_paths[0] || process.cwd(),
        github_user: overrides?.github_user || this.config.github_username,
        github_token: overrides?.github_token || this.config.github_token,
        max_selected: overrides?.max_selected || 20,
        max_depth: overrides?.max_depth || this.config.max_depth,
        ignore_patterns: overrides?.ignore_patterns || this.config.ignore_patterns,
      };

      const discoverer = new ProjectDiscovery(discoveryConfig);
      this.projectsCatalog = await discoverer.discover();

      persistJson(this.getOutputPath('projects-catalog.json'), this.projectsCatalog);
      log.ok(`Catálogo salvo em: ${this.getOutputPath('projects-catalog.json')}`);

      // Atualizar scan_paths com os projetos selecionados (locais)
      const selectedPaths = ProjectDiscovery.getSelectedPaths(this.projectsCatalog);
      if (selectedPaths.length > 0) {
        this.config.scan_paths = selectedPaths;
        this.collector = new EvidenceCollector(this.config);
        log.ok(`Pipeline configurado para ${selectedPaths.length} projeto(s) selecionado(s).`);
      }
    } catch (err) {
      errors.push(String(err));
      log.error(`Erro no discovery: ${err}`);
    }

    return {
      fase: 'discovery',
      sucesso: errors.length === 0,
      duracao_ms: Date.now() - start,
      resumo: this.projectsCatalog
        ? `${this.projectsCatalog.total_descobertos} projetos descobertos, ${this.projectsCatalog.total_selecionados} selecionados.`
        : 'Falha no discovery.',
      erros: errors,
    };
  }

  /**
   * Retorna o catálogo de projetos (se já executou discovery).
   */
  getProjectsCatalog(): ProjectsCatalog | null {
    if (!this.projectsCatalog) {
      const cached = safeReadJson<ProjectsCatalog>(this.getOutputPath('projects-catalog.json'));
      if (cached) this.projectsCatalog = cached;
    }
    return this.projectsCatalog;
  }

  /**
   * Fase 0.5: Identity Resolution
   * Consolida todas as identidades do usuário antes da análise de commits.
   */
  async identityResolution(overrides?: Partial<IdentityResolutionConfig>): Promise<PipelineResult> {
    const start = Date.now();
    const errors: string[] = [];

    try {
      // Obter project paths do catálogo se disponível
      const catalog = this.getProjectsCatalog();
      const projectPaths = catalog
        ? ProjectDiscovery.getSelectedPaths(catalog)
        : undefined;

      const identityConfig: IdentityResolutionConfig = {
        root_path: overrides?.root_path || this.config.scan_paths[0] || process.cwd(),
        github_user: overrides?.github_user || this.config.github_username,
        github_token: overrides?.github_token || this.config.github_token,
        project_paths: overrides?.project_paths || projectPaths,
      };

      const resolver = new IdentityResolver(identityConfig);
      this.identityProfile = await resolver.resolve();

      persistJson(this.getOutputPath('identity-profile.json'), this.identityProfile);
      log.ok(`Identity profile salvo em: ${this.getOutputPath('identity-profile.json')}`);

      // Atualizar AuthorshipVerifier com identidades consolidadas
      const consolidated = IdentityResolver.getConsolidatedIdentifiers(this.identityProfile);
      log.ok(`Identidade primária: "${this.identityProfile.primary_identity.nome_canonico}"`);
      log.ok(`Emails consolidados: ${consolidated.emails.length}`);
      log.ok(`Usernames: ${consolidated.usernames.join(', ') || '(nenhum)'}`);

    } catch (err) {
      errors.push(String(err));
      log.error(`Erro no identity resolution: ${err}`);
    }

    return {
      fase: 'identity-resolution',
      sucesso: errors.length === 0,
      duracao_ms: Date.now() - start,
      resumo: this.identityProfile
        ? `${this.identityProfile.total_clusters} cluster(s), identidade primária: "${this.identityProfile.primary_identity.nome_canonico}"`
        : 'Falha no identity resolution.',
      erros: errors,
    };
  }

  /**
   * Retorna o perfil de identidade (se já executou identity-resolution).
   */
  getIdentityProfile(): IdentityProfile | null {
    if (!this.identityProfile) {
      const cached = safeReadJson<IdentityProfile>(this.getOutputPath('identity-profile.json'));
      if (cached) this.identityProfile = cached;
    }
    return this.identityProfile;
  }

  /**
   * Fase 1: Coleta de evidências
   */
  async collect(): Promise<PipelineResult> {
    const start = Date.now();
    const errors: string[] = [];

    try {
      this.rawEvidences = await this.collector.collect();

      // Processar autoria e pesos em todas as evidências
      this.rawEvidences = this.authorshipVerifier.processEvidences(this.rawEvidences);

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

      // v3.0: Log de confidence scoring
      const inferidas = this.skillBase.skills.filter(s => s.inferida_por_stack);
      const highConf = this.skillBase.skills.filter(s => (s.confidence ?? 0) >= 75);
      if (inferidas.length > 0) {
        log.warn(`${inferidas.length} skill(s) foram inferidas por stack e REBAIXADAS (sem commits autorais).`);
      }
      if (highConf.length > 0) {
        log.ok(`${highConf.length} skill(s) com alta confidence (≥75) baseada em commits autorais.`);
      }

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
   * Fase 4: Geração do knowledge-truth.json
   */
  async generateTruth(): Promise<PipelineResult> {
    const start = Date.now();
    const errors: string[] = [];

    try {
      // Carregar dados se não estiverem em memória
      if (!this.normalizedBase) {
        const cached = safeReadJson<NormalizedBase>(this.getOutputPath('normalized-base.json'));
        if (cached) this.normalizedBase = cached;
        else throw new Error('Sem base normalizada. Execute "normalize" primeiro.');
      }
      if (!this.skillBase) {
        const cached = safeReadJson<SkillBase>(this.getOutputPath('skill-base.json'));
        if (cached) this.skillBase = cached;
        else throw new Error('Sem skills. Execute "extract" primeiro.');
      }

      const allEvidences = this.normalizedBase.projetos.flatMap(p => p.evidencias);

      // Classificar cada skill
      const skillsValidadas: KnowledgeTruth['skills_validadas'] = [];
      const skillsInferidas: KnowledgeTruth['skills_inferidas'] = [];
      const skillsDescartadas: KnowledgeTruth['skills_descartadas'] = [];

      for (const skill of this.skillBase.skills) {
        // Pegar evidências desta skill
        const evIds = new Set(skill.evidencias_ids);
        const skillEvs = allEvidences.filter(e => evIds.has(e.id));

        const autorais = skillEvs.filter(e => e.autoria_verificada === true).length;
        const framework = skillEvs.filter(e => e.framework_generated === true).length;
        const total = skillEvs.length;

        // Score = soma dos peso_final
        const score = skillEvs.reduce((s, e) => s + (e.peso_final ?? 0), 0);

        // v3.0: Usar confidence da skill se disponível, senão fallback para score
        let nivel = skill.nivel;
        const confidence = skill.confidence ?? 0;

        if (confidence > 0) {
          // v3.0: Nível baseado em confidence scoring (já calculado no extractor)
          nivel = skill.nivel;
        } else if (score >= 15) nivel = 'dominio-solido';
        else if (score >= 8) nivel = 'experiencia-avancada';
        else if (score >= 3) nivel = 'experiencia-pratica';
        else nivel = 'conhecimento-basico';

        // Regra v3.0: não classificar como avançada+ se nenhuma evidência tem autoria_verificada
        // E sem commits autorais confirmados
        if (autorais === 0 && (nivel === 'experiencia-avancada' || nivel === 'dominio-solido')) {
          nivel = 'experiencia-pratica';
        }

        // Regra v3.0: se skill foi inferida por stack, nunca promover além de básico
        if (skill.inferida_por_stack && nivel !== 'conhecimento-basico') {
          nivel = 'conhecimento-basico';
        }

        const validatedSkill = {
          nome: skill.nome,
          categoria: skill.categoria,
          nivel,
          score: Math.round(score * 100) / 100,
          evidencias_autorais: autorais,
          evidencias_framework: framework,
          evidencias_total: total,
        };

        // Classificar em buckets
        if (framework === total && total > 0) {
          skillsDescartadas.push(validatedSkill);
        } else if (autorais > 0) {
          skillsValidadas.push(validatedSkill);
        } else {
          skillsInferidas.push(validatedSkill);
        }
      }

      // Ordenar por score desc
      skillsValidadas.sort((a, b) => b.score - a.score);
      skillsInferidas.sort((a, b) => b.score - a.score);
      skillsDescartadas.sort((a, b) => b.score - a.score);

      const totalAutorais = allEvidences.filter(e => e.autoria_verificada === true).length;
      const totalFramework = allEvidences.filter(e => e.framework_generated === true).length;

      this.knowledgeTruth = {
        skills_validadas: skillsValidadas,
        skills_inferidas: skillsInferidas,
        skills_descartadas: skillsDescartadas,
        total_evidencias_autorais: totalAutorais,
        total_evidencias_framework: totalFramework,
        ultima_atualizacao: now(),
      };

      persistJson(this.getOutputPath('knowledge-truth.json'), this.knowledgeTruth);
      log.ok(`Knowledge truth salvo em: ${this.getOutputPath('knowledge-truth.json')}`);

      // Log resumo
      log.section('KNOWLEDGE TRUTH — RESUMO');
      log.info(`Skills validadas (autoria confirmada): ${skillsValidadas.length}`);
      log.info(`Skills inferidas (sem autoria):        ${skillsInferidas.length}`);
      log.info(`Skills descartadas (framework):        ${skillsDescartadas.length}`);
      log.info(`Evidências autorais: ${totalAutorais}/${allEvidences.length}`);
      log.info(`Evidências framework: ${totalFramework}/${allEvidences.length}`);

    } catch (err) {
      errors.push(String(err));
      log.error(`Erro na geração do knowledge-truth: ${err}`);
    }

    return {
      fase: 'truth',
      sucesso: errors.length === 0,
      duracao_ms: Date.now() - start,
      resumo: this.knowledgeTruth
        ? `${this.knowledgeTruth.skills_validadas.length} validadas, ${this.knowledgeTruth.skills_inferidas.length} inferidas, ${this.knowledgeTruth.skills_descartadas.length} descartadas.`
        : 'Falha na geração do truth.',
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

    // Etapa 0: Discovery (sempre primeiro)
    results.push(await this.discovery());
    if (!results[results.length - 1].sucesso) {
      log.warn('Discovery falhou, continuando com scan_paths do config...');
    }

    // Etapa 0.5: Identity Resolution
    results.push(await this.identityResolution());
    if (!results[results.length - 1].sucesso) {
      log.warn('Identity resolution falhou, continuando com username do config...');
    }

    results.push(await this.collect());
    if (!results[results.length - 1].sucesso) return results;

    results.push(await this.normalize());
    if (!results[results.length - 1].sucesso) return results;

    results.push(await this.extract());

    // Gerar knowledge-truth.json
    results.push(await this.generateTruth());

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

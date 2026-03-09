#!/usr/bin/env node

/**
 * SelfKnowledgeEngine — CLI
 *
 * Uso:
 *   ske discovery             Descobre e cataloga projetos (local + GitHub)
 *   ske identity             Resolve e consolida identidades do usuário
 *   ske collect              Coleta evidências de projetos locais e GitHub
 *   ske normalize            Normaliza e agrupa evidências
 *   ske extract              Extrai skills e padrões
 *   ske full-pipeline        Executa pipeline completo (discovery → collect → normalize → extract)
 *   ske query "pergunta"     Consulta a base factual
 *   ske match-job "arquivo"  Cruza descrição de vaga com base factual
 *   ske match-multi "dir"    Compara perfil vs N vagas (ranking)
 *   ske prompt [formato]     Gera prompt estruturado para LLMs
 *   ske status               Mostra status atual da base
 *
 * Flags:
 *   --config <path>          Caminho para arquivo de configuração
 *   --root <path>            Path raiz para discovery de projetos (padrão: /home/user)
 *   --scan <path>            Diretório adicional para escanear
 *   --github-token <token>   Token GitHub para API (ou env GITHUB_TOKEN)
 *   --github-user <user>     Username GitHub (ou env GITHUB_USERNAME)
 *   --max-selected <N>       Máximo de projetos selecionados no discovery (padrão: 20)
 *   --vaga <arquivo>         Arquivo de vaga (para prompt com job context)
 *   --formato <formato>      Formato do prompt
 *   --idioma <pt-br|en>      Idioma do prompt
 *   --tom <formal|...>       Tom do prompt
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { SelfKnowledgeEngine } from './engine.js';
import { log, safeReadJson } from './utils.js';
import type { SKEConfig, DiscoveryConfig, ProjectsCatalog, IdentityProfile, IdentityResolutionConfig } from './types.js';
import type { PromptFormat } from './prompt-export.js';

// ─── Argument Parsing ───────────────────────────────────────────────

function parseArgs(argv: string[]): {
  command: string;
  args: string[];
  flags: Record<string, string>;
} {
  const args: string[] = [];
  const flags: Record<string, string> = {};
  let command = 'help';

  const rawArgs = argv.slice(2);

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = rawArgs[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = 'true';
      }
    } else if (args.length === 0 && !command || command === 'help') {
      command = arg;
    } else {
      args.push(arg);
    }
  }

  // Se nenhum comando foi dado, verificar se o primeiro arg é comando
  if (command === 'help' && rawArgs.length > 0 && !rawArgs[0].startsWith('--')) {
    command = rawArgs[0];
  }

  return { command, args, flags };
}

// ─── Main ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { command, args, flags } = parseArgs(process.argv);

  // Build config overrides from flags
  const configOverrides: Partial<SKEConfig> = {};

  if (flags.scan) {
    configOverrides.scan_paths = [resolve(flags.scan)];
  }
  if (flags['github-token']) {
    configOverrides.github_token = flags['github-token'];
  }
  if (flags['github-user']) {
    configOverrides.github_username = flags['github-user'];
  }

  // Create engine
  const engine = new SelfKnowledgeEngine(flags.config);

  // Apply overrides (merge with loaded config)
  if (Object.keys(configOverrides).length > 0) {
    const mergedOverrides: Partial<SKEConfig> = {};
    if (configOverrides.scan_paths) {
      // Quando --scan é passado, substitui os paths default (cwd) em vez de adicionar
      mergedOverrides.scan_paths = configOverrides.scan_paths;
    }
    if (configOverrides.github_token) {
      mergedOverrides.github_token = configOverrides.github_token;
    }
    if (configOverrides.github_username) {
      mergedOverrides.github_username = configOverrides.github_username;
    }
    engine.updateConfig(mergedOverrides);
  }

  console.log(`
╔═══════════════════════════════════════════════════════╗
║   SelfKnowledgeEngine v3.0                           ║
║   Agente factual de conhecimento técnico             ║
║   Modo: ${command.padEnd(44)}║
╚═══════════════════════════════════════════════════════╝
`);

  try {
    switch (command) {
      case 'discovery': {
        const discoveryOverrides: Partial<DiscoveryConfig> = {};
        if (flags.root) discoveryOverrides.root_path = resolve(flags.root);
        if (flags['github-user']) discoveryOverrides.github_user = flags['github-user'];
        if (flags['github-token']) discoveryOverrides.github_token = flags['github-token'];
        if (flags['max-selected']) discoveryOverrides.max_selected = parseInt(flags['max-selected'], 10);

        const result = await engine.discovery(discoveryOverrides);
        log.info(result.resumo);

        // Exibir resumo do catálogo
        const catalog = engine.getProjectsCatalog();
        if (catalog) {
          showDiscoverySummary(catalog);
        }

        if (!result.sucesso) {
          log.error(`Erros: ${result.erros.join(', ')}`);
          process.exit(1);
        }
        break;
      }

      case 'identity': {
        const identityOverrides: Partial<IdentityResolutionConfig> = {};
        if (flags.root) identityOverrides.root_path = resolve(flags.root);
        if (flags['github-user']) identityOverrides.github_user = flags['github-user'];
        if (flags['github-token']) identityOverrides.github_token = flags['github-token'];

        const result = await engine.identityResolution(identityOverrides);
        log.info(result.resumo);

        // Exibir resumo do perfil
        const profile = engine.getIdentityProfile();
        if (profile) {
          showIdentitySummary(profile);
        }

        if (!result.sucesso) {
          log.error(`Erros: ${result.erros.join(', ')}`);
          process.exit(1);
        }
        break;
      }

      case 'collect': {
        const result = await engine.collect();
        log.info(result.resumo);
        if (!result.sucesso) {
          log.error(`Erros: ${result.erros.join(', ')}`);
          process.exit(1);
        }
        break;
      }

      case 'normalize': {
        const result = await engine.normalize();
        log.info(result.resumo);
        if (!result.sucesso) {
          log.error(`Erros: ${result.erros.join(', ')}`);
          process.exit(1);
        }
        break;
      }

      case 'extract': {
        const result = await engine.extract();
        log.info(result.resumo);
        if (!result.sucesso) {
          log.error(`Erros: ${result.erros.join(', ')}`);
          process.exit(1);
        }
        break;
      }

      case 'full-pipeline': {
        const results = await engine.fullPipeline();
        const allSuccess = results.every(r => r.sucesso);
        if (!allSuccess) {
          process.exit(1);
        }
        break;
      }

      case 'query': {
        const question = args.join(' ');
        if (!question) {
          log.error('Forneça uma pergunta: ske query "sua pergunta aqui"');
          process.exit(1);
        }
        const result = await engine.query(question);
        console.log('\n' + result.resposta);
        if (result.confianca > 0) {
          console.log(`\n📊 Confiança: ${result.confianca}%`);
        }
        if (result.contexto_projeto) {
          console.log(`📂 ${result.contexto_projeto}`);
        }
        break;
      }

      case 'match-job': {
        const filePath = args[0];
        if (!filePath) {
          log.error('Forneça o caminho para o arquivo de descrição da vaga: ske match-job vaga.txt');
          process.exit(1);
        }

        const resolvedPath = resolve(filePath);
        if (!existsSync(resolvedPath)) {
          log.error(`Arquivo não encontrado: ${resolvedPath}`);
          process.exit(1);
        }

        const jobText = readFileSync(resolvedPath, 'utf-8');
        const titulo = flags.titulo || flags.title;
        const empresa = flags.empresa || flags.company;

        const result = await engine.matchJob(jobText, titulo, empresa);

        // Salvar resultado
        const outputDir = engine.getConfig().output_dir;
        const outputPath = join(outputDir, 'job-match-result.json');
        const { writeFileSync: wf, mkdirSync } = await import('node:fs');
        mkdirSync(outputDir, { recursive: true });
        wf(outputPath, JSON.stringify(result, null, 2), 'utf-8');
        log.ok(`Resultado salvo em: ${outputPath}`);

        // Gerar relatório markdown
        const reportPath = join(outputDir, 'job-match-report.md');
        const report = generateJobMatchReport(result);
        wf(reportPath, report, 'utf-8');
        log.ok(`Relatório salvo em: ${reportPath}`);

        break;
      }

      case 'status': {
        await showStatus(engine);
        break;
      }

      case 'prompt': {
        const formato = (flags.formato || flags.format || args[0] || 'technical-summary') as PromptFormat;
        const validFormats: PromptFormat[] = ['cover-letter', 'interview-prep', 'technical-summary', 'linkedin', 'custom'];

        if (!validFormats.includes(formato)) {
          log.error(`Formato inválido: "${formato}". Válidos: ${validFormats.join(', ')}`);
          process.exit(1);
        }

        // Carregar job match se vaga for fornecida
        let jobMatch;
        const vagaPath = flags.vaga || flags.job;
        if (vagaPath) {
          const resolvedVaga = resolve(vagaPath);
          if (!existsSync(resolvedVaga)) {
            log.error(`Arquivo de vaga não encontrado: ${resolvedVaga}`);
            process.exit(1);
          }
          const jobText = readFileSync(resolvedVaga, 'utf-8');
          const titulo = flags.titulo || flags.title;
          const empresa = flags.empresa || flags.company;
          jobMatch = await engine.matchJob(jobText, titulo, empresa);
        }

        const idioma = (flags.idioma || flags.lang || 'pt-br') as 'pt-br' | 'en';
        const tom = (flags.tom || flags.tone || 'formal') as 'formal' | 'conversacional' | 'tecnico';

        const result = await engine.exportPrompt({
          formato,
          jobMatch,
          idioma,
          tom,
          instrucoes_extras: flags.extra,
          max_skills: flags['max-skills'] ? parseInt(flags['max-skills'], 10) : undefined,
        });

        // Salvar prompt
        const outputDir = engine.getConfig().output_dir;
        const promptPath = join(outputDir, `prompt-${formato}.md`);
        const { writeFileSync: wf, mkdirSync } = await import('node:fs');
        mkdirSync(outputDir, { recursive: true });
        wf(promptPath, result.prompt, 'utf-8');
        log.ok(`Prompt salvo em: ${promptPath}`);

        // Também imprimir no console
        console.log('\n' + '─'.repeat(60));
        console.log(result.prompt);
        console.log('─'.repeat(60));
        console.log(`\n📊 Dados injetados: ${result.dados_injetados.total_skills} skills, ${result.dados_injetados.total_projetos} projetos`);

        break;
      }

      case 'match-multi': {
        const dirPath = args[0];
        if (!dirPath) {
          log.error('Forneça o diretório com arquivos de vagas: ske match-multi vagas/');
          process.exit(1);
        }

        const resolvedDir = resolve(dirPath);
        if (!existsSync(resolvedDir) || !statSync(resolvedDir).isDirectory()) {
          log.error(`Diretório não encontrado: ${resolvedDir}`);
          process.exit(1);
        }

        const files = readdirSync(resolvedDir)
          .filter(f => f.endsWith('.txt') || f.endsWith('.md'))
          .map(f => join(resolvedDir, f));

        if (files.length === 0) {
          log.error(`Nenhum arquivo .txt ou .md encontrado em: ${resolvedDir}`);
          process.exit(1);
        }

        log.step(`Processando ${files.length} vagas de: ${resolvedDir}`);

        const results: Array<{ arquivo: string; titulo: string; aderencia: number; matches: number; gaps: number }> = [];

        for (const file of files) {
          const jobText = readFileSync(file, 'utf-8');
          const result = await engine.matchJob(jobText);

          results.push({
            arquivo: basename(file),
            titulo: result.vaga.titulo,
            aderencia: result.aderencia,
            matches: result.matches.length,
            gaps: result.gaps.length,
          });
        }

        // Ordenar por aderência (maior primeiro)
        results.sort((a, b) => b.aderencia - a.aderencia);

        // Exibir ranking
        console.log('\n📊 RANKING DE VAGAS POR ADERÊNCIA:');
        console.log('═'.repeat(80));
        console.log(
          '  #  │ Aderência │ Matches │ Gaps │ Vaga'
        );
        console.log('─'.repeat(80));

        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          const icon = r.aderencia >= 80 ? '🟢' : r.aderencia >= 60 ? '🟡' : '🔴';
          console.log(
            `  ${String(i + 1).padStart(2)} │ ${icon} ${String(r.aderencia).padStart(3)}%   │ ${String(r.matches).padStart(7)} │ ${String(r.gaps).padStart(4)} │ ${r.titulo.slice(0, 40)}`
          );
        }

        console.log('═'.repeat(80));
        console.log(`  Melhor fit: ${results[0].titulo} (${results[0].aderencia}%)`);
        console.log(`  Fonte: ${results[0].arquivo}`);

        // Salvar ranking
        const outputDir = engine.getConfig().output_dir;
        const rankingPath = join(outputDir, 'multi-match-ranking.json');
        const { writeFileSync: wf2, mkdirSync: mk2 } = await import('node:fs');
        mk2(outputDir, { recursive: true });
        wf2(rankingPath, JSON.stringify(results, null, 2), 'utf-8');
        log.ok(`Ranking salvo em: ${rankingPath}`);

        break;
      }

      case 'help':
      default: {
        showHelp();
        break;
      }
    }
  } catch (err) {
    log.error(String(err));
    process.exit(1);
  }
}

// ─── Discovery Summary ──────────────────────────────────────────────

function showDiscoverySummary(catalog: ProjectsCatalog): void {
  console.log('\n📂 CATÁLOGO DE PROJETOS DESCOBERTOS:');
  console.log('═'.repeat(80));
  console.log(
    '  #  │ Score │ Origem  │ Selecionado │ Nome'
  );
  console.log('─'.repeat(80));

  for (let i = 0; i < catalog.projetos.length; i++) {
    const p = catalog.projetos[i];
    const icon = p.selected_for_analysis ? '✅' : '  ';
    const score = String(p.relevancia.total).padStart(3);
    const origem = p.origem.padEnd(7);
    console.log(
      `  ${String(i + 1).padStart(2)} │  ${score} │ ${origem} │ ${icon}          │ ${p.nome}`
    );
  }

  console.log('═'.repeat(80));
  console.log(`  Total: ${catalog.total_descobertos} | Selecionados: ${catalog.total_selecionados}`);

  if (catalog.avisos.length > 0) {
    console.log('\n  ⚠️  Avisos:');
    for (const aviso of catalog.avisos) {
      console.log(`     - ${aviso}`);
    }
  }
  console.log('');
}

// ─── Identity Summary ────────────────────────────────────────────────

function showIdentitySummary(profile: IdentityProfile): void {
  console.log('\n🔍 IDENTITY RESOLUTION — RESULTADO:');
  console.log('═'.repeat(80));

  // Identidade primária
  console.log('\n  IDENTIDADE PRIMARIA:');
  console.log(`    Nome:      ${profile.primary_identity.nome_canonico}`);
  console.log(`    Emails:    ${profile.primary_identity.emails.join(', ') || '(nenhum)'}`);
  console.log(`    Usernames: ${profile.primary_identity.usernames.join(', ') || '(nenhum)'}`);

  // Clusters
  console.log(`\n  CLUSTERS ENCONTRADOS: ${profile.total_clusters}`);
  console.log('─'.repeat(80));
  console.log(
    '  #  │ Conf. │ Nomes                          │ Emails                         │ Fontes'
  );
  console.log('─'.repeat(80));

  for (let i = 0; i < profile.aliases.length; i++) {
    const c = profile.aliases[i];
    const nomes = c.nomes_detectados.slice(0, 2).join(', ');
    const emails = c.emails_detectados.slice(0, 2).join(', ');
    const fontes = c.sources.join(', ');
    console.log(
      `  ${String(i + 1).padStart(2)} │ ${String(c.confidence).padStart(4)}% │ ${nomes.padEnd(30).slice(0, 30)} │ ${emails.padEnd(30).slice(0, 30)} │ ${fontes}`
    );
  }

  console.log('═'.repeat(80));
  console.log(`  Total aliases: ${profile.aliases.length}`);
  console.log(`  identity-profile.json criado com sucesso.`);
  console.log('');
}

// ─── Status ─────────────────────────────────────────────────────────

async function showStatus(engine: SelfKnowledgeEngine): Promise<void> {
  const config = engine.getConfig();
  const outputDir = config.output_dir;

  console.log('📊 STATUS DA BASE:');
  console.log(`   Output dir: ${outputDir}`);
  console.log(`   Scan paths: ${config.scan_paths.join(', ')}`);
  console.log(`   GitHub: ${config.github_username ? `✅ ${config.github_username}` : '❌ não configurado'}`);

  // Verificar catálogo de discovery
  const catalogPath = join(outputDir, 'projects-catalog.json');
  if (existsSync(catalogPath)) {
    const catalog = safeReadJson<ProjectsCatalog>(catalogPath);
    if (catalog) {
      console.log(`\n   📂 Discovery: ${catalog.total_descobertos} projetos, ${catalog.total_selecionados} selecionados (${catalog.gerado_em.slice(0, 19)})`);
    }
  } else {
    console.log('\n   📂 Discovery: não executado ainda');
  }

  // Verificar arquivos de base
  const files = [
    { name: 'projects-catalog.json', label: 'Catálogo de projetos' },
    { name: 'identity-profile.json', label: 'Perfil de identidade' },
    { name: 'raw-evidences.json', label: 'Evidências brutas' },
    { name: 'normalized-base.json', label: 'Base normalizada' },
    { name: 'skill-base.json', label: 'Base de skills' },
    { name: 'skill-report.md', label: 'Relatório de skills' },
  ];

  console.log('\n   Arquivos:');
  for (const file of files) {
    const filePath = join(outputDir, file.name);
    if (existsSync(filePath)) {
      const stat = statSync(filePath);
      const size = (stat.size / 1024).toFixed(1);
      console.log(`   ✅ ${file.label}: ${size}KB (${stat.mtime.toISOString().slice(0, 19)})`);
    } else {
      console.log(`   ❌ ${file.label}: não encontrado`);
    }
  }

  // Quick stats from skill base
  const skillBase = safeReadJson<{ total_skills: number; padroes_identificados: string[] }>(
    join(outputDir, 'skill-base.json')
  );
  if (skillBase) {
    console.log(`\n   Skills: ${skillBase.total_skills}`);
    console.log(`   Padrões: ${skillBase.padroes_identificados.length}`);
  }
}

// ─── Job Match Report ───────────────────────────────────────────────

function generateJobMatchReport(result: import('./types.js').JobMatchResult): string {
  const lines: string[] = [
    '# Relatório de Match — SelfKnowledgeEngine',
    '',
    `**Vaga:** ${result.vaga.titulo}`,
    result.vaga.empresa ? `**Empresa:** ${result.vaga.empresa}` : '',
    `**Aderência geral:** ${result.aderencia}%`,
    `**Requisitos atendidos:** ${result.matches.length}/${result.vaga.requisitos.length}`,
    '',
    '---',
    '',
  ];

  if (result.bullets.length > 0) {
    lines.push('## 🎯 Bullets Estratégicos (para currículo)');
    lines.push('');
    for (const bullet of result.bullets) {
      lines.push(`- ${bullet}`);
    }
    lines.push('');
  }

  if (result.pontos_fortes.length > 0) {
    lines.push('## 💪 Pontos Fortes');
    lines.push('');
    for (const p of result.pontos_fortes) {
      lines.push(`- ${p}`);
    }
    lines.push('');
  }

  if (result.pontos_fracos.length > 0) {
    lines.push('## ⚠️ Pontos Fracos');
    lines.push('');
    for (const p of result.pontos_fracos) {
      lines.push(`- ${p}`);
    }
    lines.push('');
  }

  if (result.gaps.length > 0) {
    lines.push('## 🔴 Gaps Técnicos');
    lines.push('');
    for (const gap of result.gaps) {
      const icon = gap.requisito.obrigatorio ? '🔴' : '🟡';
      lines.push(`- ${icon} **${gap.requisito.nome}** (${gap.requisito.obrigatorio ? 'obrigatório' : 'desejável'}): ${gap.sugestao}`);
    }
    lines.push('');
  }

  if (result.riscos_entrevista.length > 0) {
    lines.push('## 🚨 Riscos para Entrevista');
    lines.push('');
    for (const r of result.riscos_entrevista) {
      lines.push(`- ${r}`);
    }
    lines.push('');
  }

  if (result.ajustes_keywords.length > 0) {
    lines.push('## 🔤 Ajustes de Keywords (ATS)');
    lines.push('');
    lines.push('| Atual | Sugerido | Motivo |');
    lines.push('|-------|----------|--------|');
    for (const a of result.ajustes_keywords) {
      lines.push(`| ${a.atual} | ${a.sugerido} | ${a.motivo} |`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('> Gerado pelo SelfKnowledgeEngine — baseado exclusivamente em evidências factuais.');

  return lines.filter(l => l !== '').join('\n');
}

// ─── Help ───────────────────────────────────────────────────────────

function showHelp(): void {
  console.log(`
COMANDOS:
  discovery               Descobre e cataloga projetos locais + remotos
  identity                Resolve e consolida identidades do usuário (git + GitHub)
  collect               Coleta evidências de projetos locais e GitHub
  normalize             Normaliza e agrupa evidências
  extract               Extrai skills e padrões de engenharia
  full-pipeline         Executa pipeline completo (discovery → collect → normalize → extract)
  query "pergunta"      Consulta a base factual com uma pergunta
  match-job <file>      Cruza descrição de vaga com base factual
  match-multi <dir>     Compara perfil vs N vagas — gera ranking
  prompt [formato]      Gera prompt estruturado para LLMs
  status                Mostra status atual da base de conhecimento
  help                  Mostra esta ajuda

FORMATOS DE PROMPT:
  cover-letter          Prompt para gerar cover letter personalizada
  interview-prep        Prompt para preparação de entrevista técnica
  technical-summary     Resumo técnico factual do perfil (padrão)
  linkedin              Texto para perfil LinkedIn
  custom                Template livre (requer --template)

FLAGS:
  --config <path>           Caminho para config.json
  --root <path>             Path raiz para discovery (padrão: primeiro scan_path)
  --scan <path>             Diretório adicional para escanear
  --github-token <token>    Token GitHub (ou env GITHUB_TOKEN / GH_TOKEN)
  --github-user <username>  Username GitHub (ou env GITHUB_USERNAME / GH_USER)
  --max-selected <N>        Máximo de projetos selecionados no discovery (padrão: 20)
  --titulo <titulo>         Título da vaga (para match-job)
  --empresa <empresa>       Empresa da vaga (para match-job)
  --vaga <arquivo>          Arquivo de vaga (para prompt com job context)
  --formato <formato>       Formato do prompt (cover-letter, interview-prep, etc.)
  --idioma <pt-br|en>       Idioma do prompt (padrão: pt-br)
  --tom <formal|conversacional|tecnico>  Tom do prompt
  --max-skills <N>          Máximo de skills no contexto do prompt

EXEMPLOS:
  node dist/cli.js discovery --root /home/user --github-user meuuser
  node dist/cli.js discovery --root /home/user --github-user meuuser --github-token ghp_xxx
  node dist/cli.js discovery --root /home/user --max-selected 10
  node dist/cli.js identity --root /home/user --github-user meuuser --github-token ghp_xxx
  node dist/cli.js full-pipeline
  node dist/cli.js full-pipeline --scan /home/user/projetos
  node dist/cli.js full-pipeline --github-token ghp_xxx --github-user meuuser
  node dist/cli.js query "qual minha experiência com React?"
  node dist/cli.js match-job vaga.txt --titulo "Senior Engineer"
  node dist/cli.js match-multi ./vagas/
  node dist/cli.js prompt cover-letter --vaga vaga.txt --idioma pt-br
  node dist/cli.js prompt interview-prep --vaga vaga.txt --tom tecnico
  node dist/cli.js prompt technical-summary
  node dist/cli.js prompt linkedin --idioma en
  node dist/cli.js status

VARIÁVEIS DE AMBIENTE:
  GITHUB_TOKEN / GH_TOKEN     Token de acesso GitHub
  GITHUB_USERNAME / GH_USER   Username GitHub

REGRAS:
  • O agente NUNCA inventa experiências.
  • O agente NUNCA extrapola além das evidências encontradas.
  • O agente NUNCA assume competências não comprovadas.
  • Toda afirmação tem origem rastreável.
`);
}

// ─── Run ────────────────────────────────────────────────────────────

main().catch((err) => {
  log.error(`Erro fatal: ${err}`);
  process.exit(1);
});

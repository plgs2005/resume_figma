#!/usr/bin/env node

/**
 * SelfKnowledgeEngine — CLI
 *
 * Uso:
 *   ske collect              Coleta evidências de projetos locais e GitHub
 *   ske normalize            Normaliza e agrupa evidências
 *   ske extract              Extrai skills e padrões
 *   ske full-pipeline        Executa pipeline completo (collect → normalize → extract)
 *   ske query "pergunta"     Consulta a base factual
 *   ske match-job "arquivo"  Cruza descrição de vaga com base factual
 *   ske status               Mostra status atual da base
 *
 * Flags:
 *   --config <path>          Caminho para arquivo de configuração
 *   --scan <path>            Diretório adicional para escanear
 *   --github-token <token>   Token GitHub para API
 *   --github-user <user>     Username GitHub
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SelfKnowledgeEngine } from './engine.js';
import { log, safeReadJson } from './utils.js';
import type { SKEConfig } from './types.js';

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
║   SelfKnowledgeEngine v1.0                           ║
║   Agente factual de conhecimento técnico             ║
║   Modo: ${command.padEnd(44)}║
╚═══════════════════════════════════════════════════════╝
`);

  try {
    switch (command) {
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

// ─── Status ─────────────────────────────────────────────────────────

async function showStatus(engine: SelfKnowledgeEngine): Promise<void> {
  const config = engine.getConfig();
  const outputDir = config.output_dir;

  console.log('📊 STATUS DA BASE:');
  console.log(`   Output dir: ${outputDir}`);
  console.log(`   Scan paths: ${config.scan_paths.join(', ')}`);
  console.log(`   GitHub: ${config.github_username ? `✅ ${config.github_username}` : '❌ não configurado'}`);

  // Verificar arquivos de base
  const files = [
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
  collect           Coleta evidências de projetos locais e GitHub
  normalize         Normaliza e agrupa evidências
  extract           Extrai skills e padrões de engenharia
  full-pipeline     Executa pipeline completo (collect → normalize → extract)
  query "pergunta"  Consulta a base factual com uma pergunta
  match-job <file>  Cruza descrição de vaga com base factual
  status            Mostra status atual da base de conhecimento
  help              Mostra esta ajuda

FLAGS:
  --config <path>           Caminho para config.json
  --scan <path>             Diretório adicional para escanear
  --github-token <token>    Token GitHub (para API)
  --github-user <username>  Username GitHub
  --titulo <titulo>         Título da vaga (para match-job)
  --empresa <empresa>       Empresa da vaga (para match-job)

EXEMPLOS:
  node dist/cli.js full-pipeline
  node dist/cli.js full-pipeline --scan /home/user/projetos
  node dist/cli.js query "qual minha experiência com React?"
  node dist/cli.js match-job vaga.txt --titulo "Senior Engineer" --empresa "XPTO"
  node dist/cli.js status

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

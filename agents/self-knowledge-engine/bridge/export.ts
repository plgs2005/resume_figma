/**
 * SelfKnowledgeEngine — Bridge para resume_figma
 *
 * Exporta dados do SKE em formato consumível pelo React app.
 * Não modifica o App.tsx — fornece dados complementares.
 *
 * Uso:
 *   import skillData from './agents/self-knowledge-engine/bridge/skill-data.json'
 *
 * Ou via script:
 *   node agents/self-knowledge-engine/bridge/export.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface SkillEntry {
  nome: string;
  categoria: string;
  nivel: string;
  frequencia: number;
  profundidade: number;
  descricao: string;
}

interface SkillBase {
  total_skills: number;
  skills: SkillEntry[];
  por_nivel: Record<string, string[]>;
  por_categoria: Record<string, string[]>;
  padroes_identificados: string[];
}

interface ResumeSkillData {
  gerado_em: string;
  fonte: string;
  resumo: {
    total_skills: number;
    total_projetos_escaneados: number;
    total_evidencias: number;
    padroes_engenharia: number;
  };
  por_nivel: {
    dominio_solido: string[];
    experiencia_avancada: string[];
    experiencia_pratica: string[];
    conhecimento_basico: string[];
  };
  categorias: {
    backend: string[];
    frontend: string[];
    devops: string[];
    'banco-de-dados': string[];
    testes: string[];
    arquitetura: string[];
    fundamentos: string[];
    performance: string[];
    integracao: string[];
    produto: string[];
    seguranca: string[];
    escalabilidade: string[];
  };
  destaques: Array<{
    skill: string;
    nivel: string;
    projetos: number;
    profundidade: number;
  }>;
  padroes: string[];
}

function exportForResume(): void {
  // Resolve paths from the engine root (2 levels up from bridge/dist/)
  const engineRoot = join(__dirname, '..', '..');
  const skePath = join(engineRoot, '.context', 'self-knowledge');
  const skillBasePath = join(skePath, 'skill-base.json');
  const normalizedPath = join(skePath, 'normalized-base.json');

  let skillBase: SkillBase;
  let normalizedBase: { total_evidencias_brutas: number; projetos: unknown[] };

  try {
    skillBase = JSON.parse(readFileSync(skillBasePath, 'utf-8'));
  } catch {
    console.error('❌ skill-base.json não encontrado. Execute o pipeline primeiro:');
    console.error('   cd agents/self-knowledge-engine && node dist/cli.js full-pipeline --scan /home/plgsa');
    process.exit(1);
  }

  try {
    normalizedBase = JSON.parse(readFileSync(normalizedPath, 'utf-8'));
  } catch {
    normalizedBase = { total_evidencias_brutas: 0, projetos: [] };
  }

  // Construir dados para o resume
  const topSkills = skillBase.skills
    .filter(s => s.nivel === 'dominio-solido' || s.nivel === 'experiencia-avancada')
    .sort((a, b) => b.profundidade - a.profundidade || b.frequencia - a.frequencia)
    .slice(0, 15)
    .map(s => ({
      skill: s.nome,
      nivel: s.nivel.replace(/-/g, ' '),
      projetos: s.frequencia,
      profundidade: s.profundidade,
    }));

  const data: ResumeSkillData = {
    gerado_em: new Date().toISOString(),
    fonte: 'SelfKnowledgeEngine v1.0',
    resumo: {
      total_skills: skillBase.total_skills,
      total_projetos_escaneados: normalizedBase.projetos.length,
      total_evidencias: normalizedBase.total_evidencias_brutas,
      padroes_engenharia: skillBase.padroes_identificados.length,
    },
    por_nivel: {
      dominio_solido: skillBase.por_nivel['dominio-solido'] || [],
      experiencia_avancada: skillBase.por_nivel['experiencia-avancada'] || [],
      experiencia_pratica: skillBase.por_nivel['experiencia-pratica'] || [],
      conhecimento_basico: skillBase.por_nivel['conhecimento-basico'] || [],
    },
    categorias: {
      backend: skillBase.por_categoria.backend || [],
      frontend: skillBase.por_categoria.frontend || [],
      devops: skillBase.por_categoria.devops || [],
      'banco-de-dados': skillBase.por_categoria['banco-de-dados'] || [],
      testes: skillBase.por_categoria.testes || [],
      arquitetura: skillBase.por_categoria.arquitetura || [],
      fundamentos: skillBase.por_categoria.fundamentos || [],
      performance: skillBase.por_categoria.performance || [],
      integracao: skillBase.por_categoria.integracao || [],
      produto: skillBase.por_categoria.produto || [],
      seguranca: skillBase.por_categoria.seguranca || [],
      escalabilidade: skillBase.por_categoria.escalabilidade || [],
    },
    destaques: topSkills,
    padroes: skillBase.padroes_identificados,
  };

  // Salvar em dois locais: dentro do engine e na raiz do resume
  const outputPaths = [
    join(skePath, 'resume-skill-data.json'),
    join(engineRoot, '..', '..', 'public', 'skill-data.json'),
  ];

  for (const outputPath of outputPaths) {
    try {
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, JSON.stringify(data, null, 2));
      console.log(`✅ Exportado: ${outputPath}`);
    } catch (err) {
      console.warn(`⚠️  Não foi possível salvar em ${outputPath}: ${err}`);
    }
  }

  // Resumo
  console.log('\n📊 Dados exportados para o resume:');
  console.log(`   Skills: ${data.resumo.total_skills}`);
  console.log(`   Projetos: ${data.resumo.total_projetos_escaneados}`);
  console.log(`   Evidências: ${data.resumo.total_evidencias}`);
  console.log(`   Destaques: ${topSkills.length} skills top`);
  console.log(`   Padrões: ${data.padroes.length}`);
}

exportForResume();

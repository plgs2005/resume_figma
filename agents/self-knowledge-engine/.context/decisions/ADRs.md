# ADR-001: Recursão de Diretórios sem Gate isProjectRoot

**Data:** 2026-02-24
**Status:** Aceita
**Contexto:** O collector só descia em subdiretórios que eram `isProjectRoot()`, impedindo
a descoberta de projetos aninhados em estruturas como `/home/user/projects/group/app/`.

## Decisão

Remover o gate `isProjectRoot` da recursão de subdiretórios. A recursão agora desce
em **todos** os diretórios (até `max_depth`), e `isProjectRoot` é usado apenas para
decidir se coleta evidências daquele diretório.

## Consequências

- ✅ Descobre projetos em qualquer nível de aninhamento
- ⚠️ Scan mais lento em árvores profundas (mitigado por `max_depth: 4`)
- ⚠️ Precisa de `ignore_patterns` robusto para evitar dirs pesados

---

# ADR-002: updateConfig() em vez de Mutação de Cópia

**Data:** 2026-02-24
**Status:** Aceita
**Contexto:** `engine.getConfig()` retornava `{ ...this.config }` (spread). O CLI mutava
essa cópia, mas o engine interno continuava com o config original.

## Decisão

Adicionar `engine.updateConfig(overrides)` que:
1. Faz merge no `this.config` interno
2. Recria `this.collector` com o novo config

## Consequências

- ✅ Overrides do CLI propagam para todas as camadas
- ✅ Collector é recriado, garantindo consistência

---

# ADR-003: STACK_TO_CATEGORY Canônico por Tecnologia

**Data:** 2026-02-24
**Status:** Aceita
**Contexto:** O extractor classificava cada tech pela categoria do **projeto** em que
aparecia (ex: Laravel aparecia num projeto frontend → classificado como frontend).

## Decisão

Exportar `STACK_TO_CATEGORY` do normalizer e usá-lo no extractor para classificar
cada tecnologia por seu mapa canônico, independente do projeto de origem.

## Consequências

- ✅ Laravel → backend, Docker → devops, React → frontend (sempre)
- ✅ Mapa centralizado, single source of truth
- ⚠️ Techs ausentes do mapa caem em "fundamentos" como fallback

---

# ADR-004: --scan Substitui Paths Default

**Data:** 2026-02-24
**Status:** Aceita
**Contexto:** `--scan /path` adicionava ao `scan_paths` default (`[cwd]`), causando
scan duplicado do diretório do engine.

## Decisão

Quando `--scan` é passado, substitui completamente o `scan_paths` default.

## Consequências

- ✅ Evita scan duplicado
- ✅ Comportamento previsível: "escanear X" = só X
- ⚠️ Para escanear múltiplos paths, usar config.json

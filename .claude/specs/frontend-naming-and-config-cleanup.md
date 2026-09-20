---
name: frontend-naming-and-config-cleanup
author: jhotiori
date: 2026-09-20
---

# TASK
Clean-up pass over `frontend/src/`: clarify method names by purpose (verb prefix),
clarify internal (private/protected) class field names, remove one confirmed
duplicated helper, and standardize the one config file that still exports a loose
constant instead of an object, matching every sibling under `core/config/`. PT-BR
domain vocabulary (`Servico`, `Usuario`, `Agendamento`, `Disponibilidade`, and their
fields) is never translated — only verb prefixes and generic/ambiguous identifiers are
clarified. No behavior change anywhere in this pass.

# GOAL
Every renamed method/field states its purpose at the call site with no added
indirection, `busca.config.ts` matches the object-per-domain shape every other
`core/config/*.ts` file already uses, and the one confirmed duplicated helper has a
single source of truth — all without touching public component/store contracts that
templates or other files already depend on where that contract is fine as-is.

# PLAN
Most of `frontend/src/` already follows `CLAUDE.md`'s naming convention (English verb +
PT-BR domain spec) well: store CRUD (`add`/`update`/`remove`/`findById`), `AuthStore`
(`login`/`register`/`logout`), and predicate/format methods (`isEditing`, `formatData`,
`formatPreco`) are already correct and are explicitly out of scope. This plan fixes the
concrete, confirmed exceptions only: one mis-prefixed private method
(`AgendamentoFormComponent.getDataIso`), one generic private field repeated identically
across four stores (`state`), one byte-for-byte duplicated module function
(`normalizeTexto`), and one config file exporting a loose constant instead of an object
(`busca.config.ts`).

# SPECS

## SPEC-001 - Rename `getDataIso` to match its actual purpose

### Goal
- `AgendamentoFormComponent`'s private date-building method carries a verb that
  reflects what it does (derive/compute a new date), not `get` (implies retrieving
  existing state).

### Problem
- SITUATION: `agendamento-form.component.ts:208` declares
  `private getDataIso(dias: number): string`, whose own TSDoc says "Calcula a data
  local deslocada do dia atual" (computes an offset date) - it builds a new ISO string
  from `Date.now()` + an offset, it does not read or return existing component state.
  Its two call sites (`agendamento-form.component.ts:82,85`,
  `dataMinima`/`dataMaxima` field initializers) already read as retrieval because of
  the `get` prefix, which is misleading.
- IMPACT: a `get*` name implies a cheap accessor over existing state; a reader expects
  no computation, no `Date` allocation, no formatting logic behind it.

### Expected
- EXPECTED: method renamed to `computeDataIso` (verb `compute`, consistent with the
  component's own TSDoc wording "Calcula"), same signature, same body, same two call
  sites updated.
- NOT EXPECTED: any change to `dataMinima`/`dataMaxima`'s computed value, to
  `Validators` on the `data` field, or to any other method in the file.

### Acceptance
- MUST: `agendamento-form.component.ts` contains no reference to `getDataIso` after
  the rename.
- MUST: `dataMinima` and `dataMaxima` resolve to the exact same string values as
  before, for the same wall-clock time.
- MUST NOT: change the method's parameter, return type, or body logic.

### Constraints
- DO: keep the existing TSDoc comment as-is (it already documents the method
  correctly); only the symbol name and its two call sites change.
- DO NOT: rename `isEditing`, `submit`, `close`, `isInvalid`, or `ngOnInit` in the same
  file - they already carry correct, purpose-matching names.

### Tasks
- [ ] `agendamento-form.component.ts:208` - rename `getDataIso` to `computeDataIso`.
- [ ] `agendamento-form.component.ts:82` - update `dataMinima` initializer to call
      `this.computeDataIso(0)`.
- [ ] `agendamento-form.component.ts:85` - update `dataMaxima` initializer to call
      `this.computeDataIso(14)`.

## SPEC-002 - Rename the repeated private `state` field to a domain-specific name

### Goal
- Each store's private, mutable signal states what list it holds, instead of the
  generic `state` name repeated identically in every store.

### Problem
- SITUATION: `AgendamentoStore` (`agendamento.store.ts:57`), `DisponibilidadeStore`
  (`disponibilidade.store.ts:29`), `ServicoStore` (`servico.store.ts:29`), and
  `UsuarioStore` (`usuario.store.ts:28`) each declare
  `private readonly state = signal<XResponseDTO[]>([])`, then expose it through a
  differently-named public/computed field (`agendamentos`, `disponibilidades`,
  `servicos`, `usuarios`). `AuthStore`'s equivalent private field is already
  domain-specific (`sessao`, `auth.store.ts:24`), showing the pattern these four
  stores should follow.
- IMPACT: `state` says nothing about its contents; every store's private field reads
  identically regardless of domain, so a reader must check the generic type parameter
  to know what a given `state` actually holds.

### Expected
- EXPECTED: each store's private field is renamed to `<dominio>State`, keeping the
  PT-BR domain noun intact and only adding the purpose suffix that already
  distinguishes it from the public read-only view of the same data:
  - `AgendamentoStore.state` -> `agendamentosState`
  - `DisponibilidadeStore.state` -> `disponibilidadesState`
  - `ServicoStore.state` -> `servicosState`
  - `UsuarioStore.state` -> `usuariosState`
- NOT EXPECTED: any change to the public field names (`agendamentos`, `servicos`,
  `disponibilidades`, `usuarios`), to `AuthStore.sessao`, or to any method signature.

### Acceptance
- MUST: every internal `this.state` reference inside each of the four store files is
  updated to the new field name (constructor `.set`, `add`/`update`/`remove`/
  `findById` bodies).
- MUST: the public readonly signals (`agendamentos`, `servicos`, `disponibilidades`,
  `usuarios`) keep their current names and `asReadonly()`/`computed()` wiring.
- MUST NOT: rename `AuthStore.sessao` - it is already domain-specific and correct.
- MUST NOT: change any store's public method signatures, `Observable` return types, or
  emitted values.

### Constraints
- DO: apply the same `<dominio>State` suffix consistently across all four files in one
  pass, so the pattern reads identically everywhere.
- DO NOT: rename the `service`/`alertService`/`servicoStore`/`usuarioStore` injected
  fields in the same classes - they are already clear.

### Tasks
- [ ] `agendamento.store.ts:57,79,98,120,143` - rename `state` to `agendamentosState`.
- [ ] `disponibilidade.store.ts:29,36,53,75,95,111` - rename `state` to
      `disponibilidadesState`.
- [ ] `servico.store.ts:29,36,53,75,91,106` - rename `state` to `servicosState`.
- [ ] `usuario.store.ts:28,35,52` - rename `state` to `usuariosState`.

## SPEC-003 - Deduplicate the search-normalization helper

### Goal
- One shared implementation of the text-normalization function used by search, instead
  of two identical copies.

### Problem
- SITUATION: `function normalizeTexto(texto: string): string` is defined verbatim,
  including its TSDoc, in both `agendamento-screen.component.ts:38-43` and
  `servico-screen.component.ts:19-24` - same body (`.normalize("NFD")`, strip
  diacritics, lowercase), same signature, same doc comment.
- IMPACT: a future change to normalization (e.g. also stripping punctuation) requires
  editing two files in lockstep, with no compiler check that they stay identical.

### Expected
- EXPECTED: one exported `normalizeTexto` function, defined once, imported by both
  screen components; both screens' filtering behavior (`servicosFiltrados`,
  `agendamentosFiltrados`) is unchanged.
- NOT EXPECTED: any change to the normalization algorithm itself, or to `OPCOES_BUSCA`/
  `VALOR_BUSCA`/`CampoBusca` in `agendamento-screen.component.ts`.

### Acceptance
- MUST: `normalizeTexto`'s implementation exists in exactly one file under
  `core/` (a new small util, e.g. `core/pipes/` or a sibling location matching this
  repo's existing `core/` subfolder conventions - not under either feature's
  `components/`).
- MUST: both `agendamento-screen.component.ts` and `servico-screen.component.ts`
  import it instead of declaring their own copy.
- MUST: search results for both screens are byte-identical to today's for the same
  input text.
- MUST NOT: change the function's signature, TSDoc content, or normalization logic.

### Constraints
- DO: follow this repo's TSDoc convention (PT-BR, `@param`/`@returns`, no `@example`
  unless one already existed - it does not here) on the relocated function.
- DO NOT: turn this into an Angular pipe or service unless a plain exported function
  cannot satisfy both call sites - both current usages call it as a plain function
  inside a `computed()`, not from a template.

### Tasks
- [ ] Create the shared `normalizeTexto` function in one new file under `core/`.
- [ ] `agendamento-screen.component.ts:38-43` - remove the local declaration, import
      the shared one.
- [ ] `servico-screen.component.ts:19-24` - remove the local declaration, import the
      shared one.

## SPEC-004 - Standardize `busca.config.ts` to the object-per-domain pattern

### Goal
- `busca.config.ts` exports a single `BuscaConfig` object, matching every other file
  under `core/config/` (`ModalConfig`, `Formats`, `Placeholders`, `ErrorMessages`,
  `Endpoints`, `RoutePaths`), instead of being the one file that exports a loose
  top-level constant.

### Problem
- SITUATION: `busca.config.ts:4` exports `export const DEBOUNCE_BUSCA = 500;`, a bare
  `UPPER_SNAKE_CASE` constant. Every sibling config file instead exports one
  `PascalCase` object of keyed values: `ModalConfig = { modalClass: ... }`,
  `Formats = { PRECO, DATA_HORA, DIA_SEMANA }`, `Placeholders = { REMOVIDO }`,
  `ErrorMessages = { AGENDAMENTO_CREATE, ... }`, `Endpoints = { AGENDAMENTOS_URL, ... }`,
  `RoutePaths = { LOGIN_ROUTE, ... }`. `DEBOUNCE_BUSCA` is consumed at
  `agendamento-screen.component.ts:6,87` and `servico-screen.component.ts:6,61`.
- IMPACT: `busca.config.ts` is the one config domain that cannot grow a second related
  value without becoming inconsistent with itself (a mix of a loose constant and an
  object), and it already reads differently from every other config import in the
  codebase.

### Expected
- EXPECTED: `busca.config.ts` exports `export const BuscaConfig = { DEBOUNCE: 500 };`,
  with the existing TSDoc comment kept (moved to sit on `BuscaConfig`). Both call sites
  import `BuscaConfig` and reference `BuscaConfig.DEBOUNCE` instead of
  `DEBOUNCE_BUSCA`.
- NOT EXPECTED: any change to the debounce value (`500`), to `debounceTime`'s usage, or
  to any other config file - they already follow this shape and need no change.

### Acceptance
- MUST: `busca.config.ts` exports exactly one symbol, `BuscaConfig`, an object.
- MUST: both consumers (`agendamento-screen.component.ts`,
  `servico-screen.component.ts`) reference `BuscaConfig.DEBOUNCE` and no longer import
  `DEBOUNCE_BUSCA`.
- MUST: the debounce behavior (500ms pause before the search filters) is unchanged.
- MUST NOT: rename the file itself (`busca.config.ts`) - only its exported symbol
  changes shape.

### Constraints
- DO: keep the key name `DEBOUNCE` (not `DEBOUNCE_BUSCA` again) - the domain is
  already scoped by the `BuscaConfig` object name, so the key doesn't repeat it,
  matching e.g. `Formats.PRECO` (not `Formats.FORMATS_PRECO`).
- DO NOT: fold `BuscaConfig` into another existing config object (e.g. `Formats`) -
  busca/debounce is its own config domain, matching this file's current scope.

### Tasks
- [ ] `busca.config.ts:4` - replace `export const DEBOUNCE_BUSCA = 500;` with
      `export const BuscaConfig = { DEBOUNCE: 500 };`, keeping the existing TSDoc
      comment on the new symbol.
- [ ] `agendamento-screen.component.ts:6,87` - import `BuscaConfig`, use
      `BuscaConfig.DEBOUNCE`.
- [ ] `servico-screen.component.ts:6,61` - import `BuscaConfig`, use
      `BuscaConfig.DEBOUNCE`.

# CONSTRAINTS
- Scope is `frontend/` only, specifically `frontend/src/`; never touch `backend/` - it
  is a separate, sibling repository, not part of this git repository.
- No behavior change anywhere in this pass: every rename/dedup/config change must
  produce identical runtime behavior (same debounce timing, same search results, same
  computed dates, same store data) before and after.
- PT-BR domain vocabulary (`Servico`, `Usuario`, `Agendamento`, `Disponibilidade`,
  `nome`, `valor`, `duracao`, `diaSemana`, `horaInicio`, `horaFim`, `cargo`, `sessao`,
  etc.) is never translated to English; only generic/ambiguous or purpose-mismatched
  identifiers are clarified, per `CLAUDE.md`'s English-verb + PT-BR-domain-spec
  convention.
- Do not rename or restructure anything not explicitly listed in SPEC-001 through
  SPEC-004 - store CRUD methods (`add`/`update`/`remove`/`findById`), `AuthStore`'s
  `login`/`register`/`logout`, and every other `core/config/*.ts` file already match
  the target conventions and are out of scope.
- No new abstractions beyond what each SPEC states: SPEC-003's extraction is a plain
  function in one file, not a service/pipe/class, unless a call site genuinely
  requires it.
- After implementation, run `bunx biome check --write <touched files>` then
  `bun run check`, per this repo's `CLAUDE.md`.

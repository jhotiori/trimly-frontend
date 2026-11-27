---
paths:
  - "src/**/*.ts"
---

# Conventions

- Language: domain vocabulary is PT-BR, everything else is English. Domain means ONLY backend entity, DTO field and
  enum names (`Servico`, `Agendamento`, `senha`, `horario`, `diaSemana`, `AGENDADO`). Technical concepts MUST be
  English, including file names, config objects and keys, and utils (`business-rules.config.ts`, `BusinessRules`,
  `Formats.CURRENCY`, `UiConfig.SEARCH_DEBOUNCE`, `normalizeText`, `toHHmm`). Mixed keys pair a domain field with an
  English qualifier (`SENHA_MIN_LENGTH`).
- Casing: `camelCase` for methods, variables, properties; `PascalCase` for classes,
  interfaces, enums, and objects.
- Naming: English verb (`find`, `get`, `delete`) + language-specific spec:
  `findByNome`, `deleteByStatus`, `getByEmail`. Variables: shortest name that stays
  descriptive (`nome`, `usuarioId`, `isAtivo`).
- Predicates (boolean getters and `computed`) take an English `is`/`has`/`can` prefix and
  keep the pt-br domain noun: `isGestor`, `isEditing`, `isAutenticado`, never `ehGestor`,
  `edicao` or a translated `isManager`. Component methods use English verbs too (`edit`,
  `cancel`), while UI copy stays PT-BR.

## Comments

- File header: every `.ts` file MUST open with a `/* */` block summarizing the file (not the class) in ≤ 200
  characters, no filler, body indented 4 spaces, then a blank line before the imports:
```ts
/*
    Estado reativo dos serviços, recarregado a cada sessão.
*/

import { ... } from "...";
```
- NEVER a class-level comment: nothing above `@Component`, `@Injectable`, `@Pipe` or `export class`.
- Exported non-class symbols (interface, enum, function, const) keep a `/** */` TSDoc directly on the symbol.
- Class members keep their `/** */`. A blank ` *` line goes ONLY between the description and the first tag,
  NEVER between description lines.
- Inline comments (`//`, inline `/* */` in TS and SCSS, `<!-- -->` in templates) ONLY for genuinely complex or
  ambiguous logic. A comment says why (constraint, trade-off, browser or API quirk), NEVER what; delete one that
  restates the code. No commented-out code.
- Wording, for every comment (file header, TSDoc, inline, SCSS): humanized and plain, the way you would explain it
  to a teammate; clear, concise, direct; one idea per comment, no jargon the code does not already use, no filler.

## Code rules

Apply to new and touched code; do not refactor untouched code for them.

- Guard clauses: guards come first and `return` early; the main path stays unindented. No `else` after `return`; no more
  than two nesting levels.
- Immutability: `const` over `let`, `readonly` on fields, `as const` on fixed tables. Signals are replaced, never
  mutated (`[...list, item]`, never `push`); see [state](state.md).
- Focused code: component renders and delegates, store holds state, service does HTTP, util is pure. A method does one
  job; if its name needs "and", extract. Derive with `computed`, never recompute in a template.
- No magic values: a meaningful literal becomes a constant, an enum or a config entry, following the Config rules
  above. `0`, `1` and `""` with an obvious meaning stay inline.
- Fail fast at boundaries: validate in the reactive form (mirroring `BusinessRules`) before the request; type every
  DTO; no `any` (`unknown` and narrow instead).
- Errors: type the handler (`catchError((err: HttpErrorResponse) => ...)`); never an empty handler except the silent
  `load()` documented in [state](state.md); keep the backend message through `extractErrorMessage(err, fallback)`
  instead of replacing it with a generic one.
- Dates: a date-only string (`yyyy-MM-dd`) NEVER goes straight into `new Date(...)`: it parses as UTC and shows the
  previous day in GMT-3. Append `T00:00:00` or split it.
- No `console.log` in committed code. A subscription that does not complete on its own uses `takeUntilDestroyed`
  (`HttpClient` calls complete, so they do not need it).

## TSDoc

- Block tags: only `@param`, `@returns`, `@example`. Inline `{@link ...}` is fine. No
  `@author`, `@since`, `@see`, `@version`, `@remarks`.
- `@param` uses the hyphen form: `@param nome - descrição`.
- `@example` blocks are fenced with ` ```ts `. Add one only where a public function
  genuinely needs it.
- Injected/private service fields (`http`, `url`) get a plain one-line `/** */`, no
  `{@link}` pointer (TS editor type links already resolve it).
- Language: PT-BR, concise, direct, imperative. No em-dashes, no filler.
- Example:
```ts
/**
 * Cria um novo serviço.
 *
 * @param request - Dados do serviço a ser criado.
 * @returns O serviço criado.
 * @example
 * ```ts
 * servicoService.create({ nome: "Corte", valor: 40, duracao: 30 });
 * ```
 */
```

## Config

- `infra/config/` holds only multi-key objects. A single-key value MUST be inlined as a top-level `const` in its only
  consumer; with several consumers it joins a related domain file (`ui.config.ts` for UI tuning, `business-rules.config.ts`
  for business limits).
- Frontend business limits (`BusinessRules`) MUST match the backend rule when one exists.
- Deploy-specific values (API URL) live in `src/environments/environment.ts`, swapped for
  `environment.development.ts` by `fileReplacements` in `angular.json`. NEVER hard-code them in `infra/config/`.
- Frontend enums mirror the backend enum name and values (`DisponibilidadeDiaSemana`).

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
- Inline `//` comments ONLY for genuinely complex or ambiguous logic, concise and direct. No filler.

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

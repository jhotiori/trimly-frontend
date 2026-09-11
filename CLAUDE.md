# CLAUDE.md

Trimly frontend is an Angular SPA that talks to the Trimly backend over HTTP.

Domain language is Portuguese (models, DTOs, stores, component folders);
framework/technical scaffolding stays English.
- `Servico` - service
- `Usuario` - user
- `Agendamento` - appointment/booking
- `Disponibilidade` - availability

## Conventions

- Casing: `camelCase` for methods, variables, properties; `PascalCase` for classes,
  interfaces, enums, and objects.
- Naming: English verb (`find`, `get`, `delete`) + language-specific spec:
  `findByNome`, `deleteByStatus`, `getByEmail`. Variables: shortest name that stays
  descriptive (`nome`, `usuarioId`, `isAtivo`).

## Graphify

Knowledge graph at `graphify-out/`. For dependency/call-graph or codebase questions,
use `graphify query "<question>"` / `path "<A>" "<B>"` / `explain "<concept>"` before
grep; `graphify-out/wiki/index.md` for broad navigation. Run `graphify update .` after
code changes (AST-only, no API cost).

## Commands

Bun preferred (`package-lock.json` also present).

```bash
bun install
bun run start     # ng serve, dev server
bun run build     # ng build, production build
bun run format    # biome format --write . - run after crucial modifications
bun run check     # biome check . (lint + format + import sort)
ng test       # karma/jasmine unit tests (no bun alias)
ng g c <path> # creates a new component (Angular)
ng g s <path> # creates a new service (Angular)
```

Biome owns frontend style (4-space indent, 120-col wrap, double quotes, sorted imports).
Run `bun run format` after crucial modifications, mirroring the backend `./mvnw
spotless:apply` guidance.

### TSDoc

- Every exported symbol under `services/`, `models/`, and `config/` carries a `/** */`
  TSDoc comment sitting directly on the symbol (interface, enum, class, function). Never
  a floating `/* */` file header.
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

## Architecture

Angular 19 standalone app (no `NgModule`). Routing in `app.routes.ts`, bootstrapped via
`app.config.ts` + `main.ts`. Routed feature components live under `app/components/<name>/`,
HTTP services under `app/services/`, DTO and enum interfaces under `app/models/<domain>/`,
endpoint config under `app/config/`. `app/shared/` holds `components/` (cross-feature
building blocks, currently none) and `layout/`. `layout/` contains the dashboard layout
shell (`app-dashboard-layout`: sidebar region + routed `<router-outlet>`, at
`app/shared/layout/dashboard-layout/`, wraps every `/dashboard` section) and `sidebar/`
(the navigation chrome it renders). UI uses `mdb-angular-ui-kit` (Material Design
Bootstrap), styles wired in `angular.json`.

Feature UIs are split one folder per surface under `app/components/<domain>/`:
`<domain>-list/` (dumb, takes an `@Input()` array), `<domain>-item/` (takes one entry,
calls the store for leaf actions like delete), `<domain>-form/` (reactive MDB form
rendered inside an `MdbModalService` modal, closes through `MdbModalRef`).

### Client state: `*.store.ts`

Client-side state lives in `app/services/<domain>/<domain>.store.ts`, beside the HTTP
`<domain>.service.ts` and never replacing it. A store is
`@Injectable({ providedIn: "root" })`, holds a private `signal<T[]>` and exposes it as
`asReadonly()`. State is signals only: no RxJS subject, no `localStorage`; the only RxJS is
the `HttpClient` observables, piped with `map`/`tap`/`catchError`.

Stores are HTTP-backed: the constructor issues one `findAll().subscribe` (silent on error,
so a boot-time failure just leaves the list empty) and every mutation delegates to the
service. The signal changes **only after** the response arrives - no optimistic writes, so
a rejection leaves the list untouched. The mutation signatures are observables the caller
subscribes to:

- `add(createDto): Observable<T | null>` - appends the server response, or alerts and emits
  `null`.
- `update(id, updateDto): Observable<T | null>` - immutable replace, or alerts and emits
  `null`.
- `remove(id): Observable<boolean>` - drops the entry and emits `true`, or alerts and emits
  `false`.

Every rejection is surfaced once by the store itself through
`alertService.error(extractErrorMessage(err, "<fallback PT-BR>"))`; callers only branch on
the emitted value (a modal closes only on a non-null emission). `UsuarioStore` is the one
exception: its `login` shows no dialog of its own, leaving the message to the caller.

`AlertService` (`app/services/alert.service.ts`) is the single dialog surface: exactly
`confirm(titulo, texto): Promise<boolean>` and `error(mensagem): void`, both through one
token-bound `Swal.mixin`, plus the exported pure `extractErrorMessage(err, fallback)`. No
other file imports `sweetalert2`. Its theming lives in the global `styles.scss` (the
`.app-alert*` classes) because SweetAlert2 renders to `document.body`, outside view
encapsulation - the same reason the MDB modal theme lives there.

A PATCH that would set a field to its current value is rejected by the backend
(`validateStatusUpdate` on both `agendamento` and `servico` throws when `status` equals the
current one), so forms omit an unchanged `status` from the update payload rather than
sending it.

Display-only shapes that widen a DTO (a resolved join, for example) are co-located in the
store file as a type composing the real DTO (`AgendamentoView = AgendamentoResponseDTO &
{ ... }`), exposed through a `computed` signal. Never edit `models/**` for a view concern.

### Styling

`src/styles.scss` is the single authoritative design system: all tokens on `:root`,
global element defaults, a `:focus-visible` treatment built from `--accent-*`, and the
animation vocabulary. Components consume tokens and never raw hex or px values for
anything a token covers. Transitions name their properties; never `transition: all`.

Component classes are BEM blocks prefixed `app-`
(`app-<component>__<element>--<modifier>`) — the prefix is load-bearing: the global sheet
scopes decorative-shadow removal to `[class^="app-"]` so MDB internals keep their own
styling. SCSS carries short PT-BR section comments.

MDB component theming (modal surface, form notch, validation states) lives in the global
`styles.scss`, not in component SCSS: MDB renders those elements from its own templates,
so view-encapsulated component styles cannot reach them and `::ng-deep` is not needed.

The global reset zeroes every border. `agendamento-item` is the single sanctioned
exception: a `--border-width-xs` `--border-base` border that brightens to `--border-hover`
on hover, with `--border-radius-lg` instead of the pill's `xl`. Its SCSS says so in a
comment - do not "fix" it back to borderless. `servico-item` stays the borderless pill.

- Fonts (Inter, Fraunces) load via `<link>` in `src/index.html`; only the four weights
  300/400/600/800 are requested.
- `bun run format` does not apply Biome assist actions (import and attribute sorting), so
  it alone will not satisfy `bun run check`. Run `bunx biome check --write <paths>` on the
  files you touched, then `bun run check`.

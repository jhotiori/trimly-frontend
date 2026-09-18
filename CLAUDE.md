# CLAUDE.md

Angular SPA, talks to Trimly backend over HTTP.

Domain language: PT-BR (models, DTOs, stores, component folders). Framework/scaffolding: English.
- `Servico` - service
- `Usuario` - user
- `Agendamento` - appointment/booking
- `Disponibilidade` - availability

## Conventions

- Casing: `camelCase` (methods, vars, properties); `PascalCase` (classes, interfaces, enums, objects).
- Naming: English verb (`find`/`get`/`delete`) + language-specific spec: `findByNome`, `deleteByStatus`,
  `getByEmail`. Vars: shortest descriptive name (`nome`, `usuarioId`, `isAtivo`).
- Predicates (boolean getters/`computed`): English `is`/`has`/`can` prefix + PT-BR domain noun: `isGestor`,
  `isEditing`, `isAutenticado` - never `ehGestor`, `edicao`, or a translated `isManager`. Component methods:
  English verbs too (`edit`, `cancel`); UI copy stays PT-BR.

## Graphify

Knowledge graph at `graphify-out/`. For dependency/call-graph or codebase questions, use
`graphify query "<question>"` / `path "<A>" "<B>"` / `explain "<concept>"` before grep;
`graphify-out/wiki/index.md` for broad navigation. Run `graphify update .` after code changes (AST-only, no
API cost).

## Commands

Bun preferred (`package-lock.json` also present).

```bash
bun install
bun run start     # ng serve, dev server
bun run build     # ng build, production build
bun run format    # biome format --write .
bun run check     # biome check . (lint + format + import sort)
ng g c <path> # new component (Angular)
ng g s <path> # new service (Angular)
```

No unit tests: `src/**` holds no `*.spec.ts`. karma/jasmine tooling stays installed (`angular.json`'s `test`
target, `tsconfig.spec.json`), so `ng test` still runs, just with nothing to execute. Don't add a spec file
unless asked.

Biome owns frontend style (4-space indent, 120-col wrap, double quotes, sorted imports). Scope: `src/**` only
(`files.includes` in `biome.json`); `.scss` not processed. `bun run format` skips Biome's assist actions
(import/attribute sorting), so it alone won't satisfy `bun run check`. After edits, run
`bunx biome check --write <paths>` on touched files, then `bun run check`.

### TSDoc

- Every exported symbol under `services/`, `models/`, `config/`: `/** */` TSDoc directly on the symbol
  (interface, enum, class, function). Never a floating `/* */` file header.
- Block tags: `@param`, `@returns`, `@example` only. Inline `{@link ...}` fine. No `@author`, `@since`,
  `@see`, `@version`, `@remarks`.
- `@param`: hyphen form - `@param nome - descrição`.
- `@example`: fenced ` ```ts `. Add one only where a public function genuinely needs it.
- Injected/private service fields (`http`, `url`): plain 1-line `/** */`, no `{@link}` pointer (TS editor type
  links already resolve it).
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

Angular 19 standalone (no `NgModule`). Routing: `app.routes.ts`, bootstrapped via `app.config.ts` + `main.ts`.
Feature-first split: each domain owns its slice under `app/features/<domain>/` (`components/`, `models/`,
`services/`); app-wide infra under `app/core/` (`config/`, `guards/`, `models/exception/`, `layout/`,
`pipes/`, `services/`). `features/*` may depend on `core/`, never another `features/*` folder directly, except
`dashboard/` (aggregation view, reads multiple feature stores). `core/` never imports from `features/`. UI:
`mdb-angular-ui-kit` (Material Design Bootstrap), styles wired in `angular.json`.

`core/layout/`: dashboard layout shell (`app-dashboard-layout` - sidebar region + routed `<router-outlet>`, at
`app/core/layout/dashboard-layout/`, wraps every `/dashboard` section) + `sidebar/` (nav chrome it renders) -
both singleton app-shell pieces, not reusable components, hence `core/` rather than a generic `shared/`.

Feature UIs: one folder per surface under `app/features/<domain>/components/`:
- `<domain>-screen/` - routed page (`/dashboard/*`): title, description, 500ms-debounced search filtering the
  store signal in memory (never the backend), in-page create action opening the `<domain>-form` modal.
- `<domain>-list/` - dumb, takes an `@Input()` array, renders the shared card grid.
- `<domain>-item/` - one card, calls the store for leaf actions (delete), gates gestor-only actions itself via
  `authStore.isGestor()`.
- `<domain>-form/` - reactive MDB form rendered inside an `MdbModalService` modal, closes through `MdbModalRef`.

### Client state: `*.store.ts`

Client-side state: `app/features/<domain>/services/<domain>.store.ts`, beside the HTTP `<domain>.service.ts`
(never replaces it). Store: `@Injectable({ providedIn: "root" })`, private `signal<T[]>` exposed as
`asReadonly()`. State = signals only - no RxJS subject, no `localStorage`; the only RxJS is the `HttpClient`
observables (`map`/`tap`/`catchError`).

HTTP-backed: constructor issues 1 `findAll().subscribe` (silent on error, so a boot-time failure leaves the
list empty), every mutation delegates to the service. Signal changes only after the response arrives - no
optimistic writes, so a rejection leaves the list untouched. Mutation signatures = observables the caller
subscribes to:
- `add(createDto): Observable<T | null>` - appends the server response, or alerts + emits `null`.
- `update(id, updateDto): Observable<T | null>` - immutable replace, or alerts + emits `null`.
- `remove(id): Observable<boolean>` - drops the entry + emits `true`, or alerts + emits `false`.

Every rejection surfaced once by the store via `alertService.error(extractErrorMessage(err, "<fallback PT-BR>"))`;
callers only branch on the emitted value (modal closes only on non-null emission). `UsuarioStore` exception:
`login` shows no dialog of its own - message left to the caller.

`AlertService` (`app/core/services/alert.service.ts`): single dialog surface - exactly
`confirm(titulo, texto): Promise<boolean>` + `error(mensagem): void`, both through one token-bound
`Swal.mixin`, + the exported pure `extractErrorMessage(err, fallback)`. No other file imports `sweetalert2`.
Theming: global `styles.scss` (`.app-alert*` classes), since SweetAlert2 renders to `document.body`, outside
view encapsulation - same reason the MDB modal theme lives there.

A PATCH setting a field to its current value is rejected by the backend (`validateStatusUpdate` on
`agendamento`/`servico` throws when `status` equals the current one) - forms omit an unchanged `status` from
the update payload rather than sending it.

Display-only shapes widening a DTO (e.g. a resolved join) are co-located in the store file as a type composing
the real DTO (`AgendamentoView = AgendamentoResponseDTO & { ... }`), exposed via a `computed` signal. Never
edit `models/**` for a view concern.

Enum members never interpolated raw: templates format via `EnumLabelPipe` (`{{ status | enumLabel }}`, at
`app/core/pipes/`), so `AGENDADO` reads "Agendado" while the enum keeps its wire value. Only place casing
logic lives.

### Styling

`src/styles.scss`: single authoritative design system - all tokens on `:root`, global element defaults, a
`:focus-visible` treatment built from `--accent-*`, the animation vocabulary. Components consume tokens, never
raw hex/px values for anything a token covers. Transitions name their properties; never `transition: all`.

Component classes: BEM blocks prefixed `app-` (`app-<component>__<element>--<modifier>`) - prefix is
load-bearing: the global sheet scopes decorative-shadow removal to `[class^="app-"]` so MDB internals keep
their own styling. SCSS carries short PT-BR section comments.

MDB component theming (modal surface, form notch, validation states): global `styles.scss`, not component
SCSS - MDB renders those elements from its own templates, so view-encapsulated component styles can't reach
them; `::ng-deep` not needed.

Agendamentos/Serviços/Dashboard screens share one vocabulary, defined once in `styles.scss` (every screen
repeats it): `.app-tela` (page column, header, toolbar, accent create button), `.app-busca` (search field),
`.app-grade` (4/3/2-column card grid, single `--animation-medium` fade-in on mount), `.app-cartao`
(`--border-radius-lg` card, icon-labelled `<dl>` fields, round actions), `.app-vazio` (empty state). Items/lists
compose these classes instead of restyling cards per component; component SCSS keeps only what's truly local
(the agendamento client menu). Every micro-interaction: 1-line SCSS comment saying why it exists;
`prefers-reduced-motion` drops the fade + hover scale.

Global reset zeroes every border; a border only marks focus or the active state (`.app-busca`'s full
perimeter, MDB `.form-outline` fields, sidebar's active edge), transparent at rest so nothing shifts. Hover
never draws a border: shifts the background color only. Exception: `.app-sidebar` panel - `--border-width-xs`
`--border-base` frame, only right corners rounded (`--border-radius-lg`), since its left edge sits flush
against the viewport. Former bordered `agendamento-item` exception is gone - every card is the borderless
`.app-cartao`.

- Fonts: one `<link>` in `src/index.html`, only weights in use - Geist 600/800 (`--font-family-display`,
  h2-h4), Inter 300/400/600/800 (`--font-family-interface`), Geist Mono 400 (`--font-family-mono`, MDB
  `.form-outline` fields), Playfair Display 600/700 (`--font-family-serif`, sidebar logotype only). Add a
  weight to the `<link>` before using it in SCSS.

### Themes

Dark = default, writes nothing to the DOM. Light = a scope, `[data-theme="light"]` on `<html>`, re-declares
only the 4 base tokens `--text-primary`, `--bg-base`, `--accent-base`, `--danger-base`; every other color =
`color-mix()` derived from those, so the whole palette recomputes with no component-level edit. A new color
belongs in that ladder, never as a literal inside a component.

`ThemeService` (`app/core/services/theme.service.ts`): single owner of the theme - a signal, the `localStorage`
key `trimly-theme`, the `data-theme` attribute, the `<meta name="theme-color">` content. `app.config.ts`
instantiates it through `provideAppInitializer` so the persisted theme lands before first paint on every route,
including login (renders no sidebar). Only control: sidebar's "Tema" entry. Universal reset carries the
`--animation-medium` transition for `background-color`, `color`, `border-color`, `box-shadow` - what makes the
switch fade instead of snap; component rules declaring their own `transition` keep their `--animation-fast`
hover timing.

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
- Predicates (boolean getters and `computed`) take an English `is`/`has`/`can` prefix and
  keep the pt-br domain noun: `isGestor`, `isEditing`, `isAutenticado`, never `ehGestor`,
  `edicao` or a translated `isManager`. Component methods use English verbs too (`edit`,
  `cancel`), while UI copy stays PT-BR.

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
bun run format    # biome format --write .
bun run check     # biome check . (lint + format + import sort)
ng g c <path> # creates a new component (Angular)
ng g s <path> # creates a new service (Angular)
```

The project carries no unit tests: `src/**` holds no `*.spec.ts` file. The karma/jasmine
tooling stays installed (`angular.json`'s `test` target, `tsconfig.spec.json`), so `ng test`
still runs, just with nothing to execute. Do not add a spec file unless asked.

Biome owns frontend style (4-space indent, 120-col wrap, double quotes, sorted imports).
Its scope is `src/**` only (`files.includes` in `biome.json`); `.scss` is not processed.
`bun run format` skips Biome's assist actions (import/attribute sorting), so it alone
won't satisfy `bun run check`. After edits, run `bunx biome check --write <paths>` on the
touched files, then `bun run check`.

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
`app.config.ts` + `main.ts`. The app is split feature-first: each domain owns its slice
under `app/features/<domain>/` (`components/`, `models/`, `services/`), and app-wide
infrastructure lives under `app/core/` (`config/`, `guards/`, `models/exception/`,
`layout/`, `pipes/`, `services/`). `features/*` may depend on `core/`, never on another
`features/*` folder directly, except `dashboard/`, an aggregation view allowed to read
multiple feature stores; `core/` never imports from `features/`. UI uses `mdb-angular-ui-kit` (Material Design Bootstrap), styles wired in
`angular.json`.

`core/layout/` contains the dashboard layout shell (`app-dashboard-layout`: sidebar
region + routed `<router-outlet>`, at `app/core/layout/dashboard-layout/`, wraps every
`/dashboard` section) and `sidebar/` (the navigation chrome it renders) — both are
singleton app-shell pieces, not reusable components, which is why they sit in `core/`
rather than a generic `shared/`.

Feature UIs are split one folder per surface under `app/features/<domain>/components/`:
`<domain>-screen/` (routed page under `/dashboard/*`: title, description, a 500ms-debounced
search that filters the store signal in memory, never the backend, and an in-page create
action that opens the `<domain>-form` modal), `<domain>-list/` (dumb, takes an `@Input()`
array, renders the shared card grid), `<domain>-item/` (one card, calls the store for leaf
actions like delete and gates gestor-only actions with `authStore.isGestor()` itself),
`<domain>-form/` (reactive MDB form rendered inside an `MdbModalService` modal, closes
through `MdbModalRef`).

### Client state: `*.store.ts`

Client-side state lives in `app/features/<domain>/services/<domain>.store.ts`, beside the HTTP
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

`AlertService` (`app/core/services/alert.service.ts`) is the single dialog surface: exactly
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

Enum members are never interpolated raw: templates format them through `EnumLabelPipe`
(`{{ status | enumLabel }}`, at `app/core/pipes/`), so `AGENDADO` reads "Agendado" while
the enum keeps its wire value. It is the only place that casing logic lives.

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

The Agendamentos, Serviços and Dashboard screens share one vocabulary, defined once in
`styles.scss` because every screen repeats it: `.app-tela` (page column, header, toolbar
and the accent create button), `.app-busca` (search field), `.app-grade` (4/3/2-column
card grid with a single `--animation-medium` fade-in on mount), `.app-cartao`
(`--border-radius-lg` card, icon-labelled `<dl>` fields, round actions) and `.app-vazio`
(empty state). Items and lists compose these classes instead of restyling cards per
component; component SCSS keeps only what is truly local (the agendamento client menu).
Every micro-interaction carries a one-line SCSS comment saying why it exists, and
`prefers-reduced-motion` drops the fade and the hover scale.

The global reset zeroes every border, and a border only marks focus or the active state
(the full perimeter border of `.app-busca` and the MDB `.form-outline` fields, the
sidebar's active edge), kept transparent at rest so nothing shifts. Hover never draws a
border: it only shifts the background color. The one deliberate exception is the `.app-sidebar` panel itself: a
`--border-width-xs` `--border-base` frame with only its right corners rounded
(`--border-radius-lg`), since its left edge sits flush against the viewport. The former
bordered `agendamento-item` exception is gone; every card is the borderless `.app-cartao`.

- Fonts load via one `<link>` in `src/index.html`, requesting only the weights in use:
  Geist 600/800 (`--font-family-display`, h2-h4), Inter 300/400/600/800
  (`--font-family-interface`), Geist Mono 400 (`--font-family-mono`, the MDB
  `.form-outline` fields) and Playfair Display 600/700 (`--font-family-serif`, read by the
  sidebar logotype and nothing else). Add a weight to the `<link>` before using it in SCSS.

### Themes

Dark is the default and writes nothing to the DOM. Light is a scope, `[data-theme="light"]`
on `<html>`, that re-declares only the four base tokens `--text-primary`, `--bg-base`,
`--accent-base` and `--danger-base`; every other color is a `color-mix()` derived from those,
so the whole palette recomputes with no component-level edit. A new color belongs in that
ladder, never as a literal inside a component.

`ThemeService` (`app/core/services/theme.service.ts`) is the single owner of the theme: a
signal, the `localStorage` key `trimly-theme`, the `data-theme` attribute and the
`<meta name="theme-color">` content. `app.config.ts` instantiates it through
`provideAppInitializer` so the persisted theme lands before the first paint on every route,
including login, which renders no sidebar. The only control is the sidebar's "Tema" entry.
The universal reset carries the `--animation-medium` transition for `background-color`,
`color`, `border-color` and `box-shadow`, which is what makes the switch fade instead of
snap; component rules that declare their own `transition` keep their `--animation-fast`
hover timing.

# CLAUDE.md

Angular SPA, talks to Trimly backend over HTTP.

## Context

Domain files under `.claude/rules/` load when a matching path is touched; read one directly when a task needs it.

- [**Conventions**](.claude/rules/conventions.md): naming, predicates, file headers, comments, TSDoc, config.
- [**Client State**](.claude/rules/state.md): stores, `AlertService`, payload and view rules, enum labels.
- [**Authentication**](.claude/rules/auth.md): `AuthStore`, token interceptor, `401` redirect, guards.
- [**Styling**](.claude/rules/styling.md): semantic markup, ARIA, design tokens, BEM `app-` classes, MDB theming, fonts, themes.

## Project

Domain language is Portuguese (models, DTOs, stores, component folders);
framework/technical scaffolding stays English.
- `Servico` - service
- `Usuario` - user
- `Agendamento` - appointment/booking
- `Disponibilidade` - availability

## CodeGraph

- When `.codegraph/` exists, query the graph before `Grep`, `Glob` or `Read`: the `codegraph_explore` MCP tool, or
  `codegraph explore "<symbols or question>"` in the shell. Name the symbols in the query; before changing a shared
  signature, read its blast radius in the same result.
- Without `.codegraph/`, skip CodeGraph (indexing is the user's call).
- Fallback to `Grep`/`Read` only for non-indexed files (configs, Markdown, logs) or exact regex matches.

## Commands

Bun is the package manager (`bun.lock`).

```bash
bun install
bun run start     # ng serve, dev server
bun run build     # ng build, production build
bun run format    # biome check --write . (format + lint fixes + import sort)
bun run check     # biome check . (lint + format + import sort)
ng g c <path> # new component (Angular)
ng g s <path> # new service (Angular)
```

The project carries no unit tests and no test tooling (no karma/jasmine, no `test` target).
Do not add a spec file unless asked.

Biome owns frontend style (4-space indent, 120-col wrap, double quotes, sorted imports) and is
the VS Code default formatter (`.vscode/settings.json`). Its scope is `src/**` only
(`files.includes` in `biome.json`), honoring `.gitignore`; `.scss` is not processed. After
edits, run `bunx biome check --write <paths>` on the touched files, then `bun run check`.

## Architecture

Angular 19 standalone app (no `NgModule`). Routing in `app.routes.ts`, bootstrapped via
`app.config.ts` + `main.ts`. The app is split feature-first: each domain owns its slice
under `app/features/<domain>/` (`components/`, `models/`, `services/`), and app-wide
infrastructure lives under `app/infra/` (`config/`, `guards/`, `interceptors/`, `models/exception/`,
`layout/`, `pipes/`, `services/`, `utils/`); deploy-specific values live in `src/environments/`. `features/*` may
depend on `infra/`, never on another
`features/*` folder directly, except `dashboard/` (an aggregation view reading several feature stores) and `auth/`
(reads the `usuarios` service and models). `infra/` never imports from `features/`, except the guards and
`authInterceptor`, which read `AuthStore`. UI uses `mdb-angular-ui-kit` (Material Design Bootstrap), styles wired in
`angular.json`.

`infra/layout/` contains the dashboard layout shell (`app-dashboard-layout`: sidebar
region + routed `<router-outlet>`, at `app/infra/layout/dashboard-layout/`, wraps every
`/dashboard` section) and `sidebar/` (the navigation chrome it renders), both
singleton app-shell pieces, not reusable components, which is why they sit in `infra/`
rather than a generic `shared/`.

Feature UIs are split one folder per surface under `app/features/<domain>/components/`:
`<domain>-screen/` (routed page under `/dashboard/*`: title, description, a 500ms-debounced
search that filters the store signal in memory, never the backend, and an in-page create
action that opens the `<domain>-form` modal), `<domain>-list/` (dumb, takes an `@Input()`
array, renders the shared card grid), `<domain>-item/` (one card, calls the store for leaf
actions like delete and gates gestor-only actions with `authStore.isGestor()` itself),
`<domain>-form/` (reactive MDB form rendered inside an `MdbModalService` modal, closes
through `MdbModalRef`).

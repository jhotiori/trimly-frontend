---
name: route-centralization
author: jhotiori
date: 2026-09-15
---

# TASK
Angular route path strings are hardcoded as literals inside consumers (guards, components,
templates) throughout the frontend. Centralize every raw route path string into one
config file, sibling to `src/app/core/config/endpoints.config.ts`, and migrate every
confirmed hardcoded consumer to reference it. This spec is planning-only: no application
source files are changed while authoring it. Implementation follows in a separate pass,
once the Open Questions below are resolved.

# GOAL
One exported map of UPPER_SNAKE_CASE keys to raw route path strings, under
`src/app/core/config/`, so a route path change is a one-line edit instead of a
repo-wide hunt across guards, components, and templates.

# PLAN
Create a new config file (shape mirrors `endpoints.config.ts`'s helper + exported
object-of-constants pattern) holding only route path strings — never components or
`Route`/`Routes` objects, never named or shaped like `app.routes.ts`. Migrate the 9
confirmed hardcoded call sites across 6 files to reference it. Leave the exact
filename, leading-slash convention, and `app.routes.ts` relationship to the Open
Questions below before implementation starts.

# SPECS

## SPEC-001 - Route path constants config file

### Goal
- Provide one exported map of UPPER_SNAKE_CASE keys to raw route path strings, placed
  in `src/app/core/config/`, shaped like `endpoints.config.ts` (small helper +
  exported const object of `Endpoints`).

### Problem
- SITUATION: route path strings (`"login"`, `"dashboard/view"`,
  `"dashboard/agendamentos"`, `"dashboard/servicos"`, `"dashboard/configuracoes"`) are
  duplicated as literals across guards, components, and one template.
- IMPACT: renaming a route means manually finding and editing every literal; a missed
  one silently breaks navigation instead of failing to compile.

### Plan
- New file `src/app/core/config/route-paths.config.ts` (filename pending
  Open Question 1), exporting `const RoutePaths = { ... }` — PascalCase object,
  mirroring the `Endpoints` convention in `endpoints.config.ts`.
- Keys derived from the route set in `app.routes.ts`: `LOGIN_ROUTE`,
  `DASHBOARD_VIEW_ROUTE`, `DASHBOARD_AGENDAMENTOS_ROUTE`,
  `DASHBOARD_SERVICOS_ROUTE`, `DASHBOARD_CONFIGURACOES_ROUTE`. Add a
  `DASHBOARD_ROOT_ROUTE` only if a consumer needs the bare `"dashboard"` segment.
- Reuse an `ENDPOINT()`-style helper only if Open Question 5 decides composition is
  needed; otherwise plain string literals per key, matching the original examples
  (`DASHBOARD_MAIN_ROUTE: "dashboard/"`, `AGENDAMENTOS_ROUTE: "dashboard/agendamentos"`).

### Acceptance
- MUST: file lives in `src/app/core/config/`.
- MUST: exports only UPPER_SNAKE_CASE key -> raw path string pairs (plus an optional
  composition helper).
- MUST: filename and export name are unambiguous versus `app.routes.ts` / its `routes`
  export, at a glance.
- MUST NOT: import or reference any component, `Route`, or `Routes` type.
- MUST NOT: be named `app.routes`/`app-routes`/`app.routes.ts`, and MUST NOT export a
  symbol literally named `routes` or `appRoutes`.

### Constraints
- DO: follow this repo's TSDoc convention for exported `config/` symbols — PT-BR,
  `/** */` directly on the exported const and any helper function, `@example` only
  where genuinely useful.
- DO NOT: pick a final leading-slash convention or filename before Open Questions 1
  and 2 are resolved.

### Tasks
- [ ] Create `src/app/core/config/route-paths.config.ts` with the exported constants
      map, once naming and leading-slash decisions land.

## SPEC-002 - Migrate hardcoded route consumers

### Goal
- Every confirmed call site that hardcodes a route path string references the new
  config instead of a literal.

### Problem
- SITUATION: repo-wide search (`router.navigate`, `navigateByUrl`, `createUrlTree`,
  `routerLink`) across `src/app/**/*.ts` and `*.html` found 9 literal call sites in 6
  files; none currently import a shared source of truth.
- IMPACT: each literal is an independent breakage point on route rename.

### Tasks
- [ ] `src/app/core/guards/auth.guard.ts:14` — `inject(Router).createUrlTree(["/login"])`
      -> `createUrlTree([RoutePaths.LOGIN_ROUTE])`.
- [ ] `src/app/core/guards/role.guard.ts:26` —
      `inject(Router).createUrlTree(["/dashboard/view"])` ->
      `createUrlTree([RoutePaths.DASHBOARD_VIEW_ROUTE])`.
- [ ] `src/app/core/layout/sidebar/sidebar.component.ts:61` —
      `this.router.navigate(["/login"])` -> `this.router.navigate([RoutePaths.LOGIN_ROUTE])`.
- [ ] `src/app/features/auth/components/login-form/login-form.component.ts:56` —
      `this.router.navigate(["/dashboard/view"])` ->
      `this.router.navigate([RoutePaths.DASHBOARD_VIEW_ROUTE])`.
- [ ] `src/app/features/auth/components/registrar-form/registrar-form.component.ts:52` —
      same change as the login form above.
- [ ] `src/app/core/layout/sidebar/sidebar.component.ts` — expose the needed keys (or
      the whole map) as a `protected readonly` field, e.g.
      `protected readonly routePaths = RoutePaths;`, so the template can bind to it
      (templates cannot import a `.ts` const directly).
- [ ] `src/app/core/layout/sidebar/sidebar.component.html:12` —
      `routerLink="/dashboard/view"` -> `[routerLink]="routePaths.DASHBOARD_VIEW_ROUTE"`.
- [ ] `src/app/core/layout/sidebar/sidebar.component.html:22` —
      `routerLink="/dashboard/agendamentos"` ->
      `[routerLink]="routePaths.DASHBOARD_AGENDAMENTOS_ROUTE"`.
- [ ] `src/app/core/layout/sidebar/sidebar.component.html:32` —
      `routerLink="/dashboard/servicos"` ->
      `[routerLink]="routePaths.DASHBOARD_SERVICOS_ROUTE"`.
- [ ] `src/app/core/layout/sidebar/sidebar.component.html:54` —
      `routerLink="/dashboard/configuracoes"` ->
      `[routerLink]="routePaths.DASHBOARD_CONFIGURACOES_ROUTE"`.

### Acceptance
- MUST: none of the 6 files above contain a literal route-path string
  (`"/login"`, `"login"`, `"/dashboard/..."`, `"dashboard/..."`) after migration.
- MUST: resulting navigation behavior (URL trees, resolved paths) is identical to
  today's — this is a refactor, not a routing change.
- MUST NOT: alter `*.spec.ts` files as part of this migration (none currently assert
  on the literal path strings, per the same search).

### Constraints
- DO: re-run the same search patterns (`router.navigate`, `navigateByUrl`,
  `createUrlTree`, `routerLink`) immediately before implementation, in case new call
  sites were added since this spec was written.
- DO NOT: expand scope to `app.routes.ts` itself here — see Open Question 3.

# OPEN QUESTIONS
1. **Filename / export naming** — proposed default: `route-paths.config.ts` exporting
   `RoutePaths` (mirrors `endpoints.config.ts` / `Endpoints`). Alternatives to
   consider: `route-segments.config.ts` (`RouteSegments`), `navigation.config.ts`
   (`NavigationRoutes`), `route-constants.config.ts` (`RouteConstants`). Confirm
   before SPEC-001 is implemented.
2. **Leading slash** — should stored values be absolute (`"/dashboard/view"`, matching
   today's literals in guards/`router.navigate`) or root-relative without the slash
   (`"dashboard/view"`, matching the original request's own examples)? `Router`
   treats a leading `/` in a navigation array as an absolute path and a bare segment
   as relative to the current route — this is a behavioral decision, not just a style
   one, and blocks SPEC-002.
3. **Should `app.routes.ts` also source from this config?** Today it defines bare
   segments (`path: "agendamentos"`, `path: "view"`, `redirectTo: "login"`), not full
   paths. Options: (a) leave `app.routes.ts` fully independent, config only serves
   consumers; (b) have both derive segment names from one place, accepting that the
   config would then need segment-level keys distinct from the full-path keys
   consumers use.
4. **Parameterized routes** — no current route takes an `:id`-style segment. Should
   the config add an `ENDPOINT()`-style composition helper now, in anticipation, or
   only once the first parameterized route lands?
5. **Composition helper vs. plain literals** — should every value go through a small
   `ROUTE(...)`-style joiner (mirroring `ENDPOINT()`) even though today's paths are
   static, or are plain string literals sufficient until real composition is needed?

# CONSTRAINTS
- The new config file and its exported symbol must never be named `app.routes` (or
  `app.routes.ts`) or anything indistinguishable from it at a glance — it must read as
  "route path constants," never as "route definitions."
- Every key in the exported map is UPPER_SNAKE_CASE.
- The file contains only key -> raw path string pairs, optionally composed through a
  small helper — no component references, no `Route`/`Routes` objects, no wiring of
  Angular's actual route table.
- This spec is planning-only: no `src/` files are modified while authoring it;
  SPEC-001/SPEC-002 tasks are executed in a later, separate implementation pass, after
  the Open Questions above are answered.

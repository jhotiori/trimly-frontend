---
name: layout-spacing-and-validation-polish
author: jhotiori
date: 2026-09-15
---

# TASK
Polish the dashboard shell's visual chrome and harden two client-side forms to match backend
constraints: round and border the sidebar, add a subtle gradient to the shell background,
retune the sidebar-to-content and vertical content spacing, bump the registration password's
minimum length, and cap the agendamento date field to today through 14 days ahead.

# GOAL
The dashboard shell (`dashboard-layout.component.scss`, `sidebar.component.scss`) reads with a
defined, softly-rounded sidebar edge, a barely-there background gradient, and a tighter
sidebar gutter with roomier vertical breathing room, while the registration password field and
the agendamento date field enforce the same limits the backend expects — all through minimal,
in-place edits to existing components and the existing `--spacing-*`/`--border-*`/`--bg-*`
token scale in `styles.scss`, with no new components or libraries.

# SPECS

## SPEC-001 - Sidebar Border and Right-Side Corner Rounding

### Goal
- `.app-sidebar` (`src/app/core/layout/sidebar/sidebar.component.scss`) gains a subtle border
  and rounds only its top-right and bottom-right corners, leaving the left side square since
  it sits flush against the viewport edge.

### Problem
- SITUATION: `.app-sidebar` currently has no border at all — its own comment reads "Barra
  lateral sem moldura: o fundo mais claro é a única costura contra o conteúdo" (no frame; the
  lighter background is the only seam), and the global reset in `styles.scss:112-119` zeroes
  `border` on every element by default.
- IMPACT: adding a visible border needs to override that reset — already a proven pattern in
  this same file (`.app-sidebar__item`'s `border-left: var(--border-width-md) solid
  transparent;`) — and must round only the two right corners, since the sidebar has no left
  margin (`width: 15rem`, `4.5rem` when `.app-sidebar--recolhida`).

### Expected
- EXPECTED: `.app-sidebar` gets `border: var(--border-width-xs) solid var(--border-base);`
  (the thinnest border-width token and the softest border-color token, both already defined in
  `styles.scss`) and `border-radius: 0 var(--border-radius-lg) var(--border-radius-lg) 0;`
  (top-left/bottom-left stay square at `0`; top-right/bottom-right round at
  `--border-radius-lg` = 0.5rem, the same radius `.app-cartao` and the auth card already use).
- NOT EXPECTED: left-side corners gaining any radius; a new border-color/radius token; the
  collapsed (`--recolhida`) or `<=48rem` icon-rail state losing this treatment.

### Acceptance
- MUST: border and radius apply in every sidebar state (expanded, collapsed, `<=48rem`).
- MUST: only the pre-existing `--border-width-xs` and `--border-radius-lg` tokens are used.
- MUST NOT: top-left or bottom-left gain any radius.
- MUST NOT: a new token added to `styles.scss` for this.

### Constraints
- DO: override the global `*, *::before, *::after { border: none; }` reset the same way
  `.app-sidebar__item` already does.
- DO NOT: treat this silently as breaking the documented "border only marks focus/active
  state, transparent at rest" convention (`frontend/CLAUDE.md`, Styling section) — this SPEC is
  an explicit, flagged exception scoped to the sidebar panel only.

## SPEC-002 - Subtle Gradient on the Dashboard Shell Background

### Goal
- `.app-dashboard-layout`'s background gains a barely-there gradient for depth, staying
  visually near-flat.

### Problem
- SITUATION: `.app-dashboard-layout` (`dashboard-layout.component.scss:6-12`) sets a single
  flat `background-color: var(--bg-base)` (`hsl(0 0 0%)`, pure black). The app ships exactly
  one dark theme — `color-scheme: dark` is hardcoded in `styles.scss:130` and no
  `prefers-color-scheme`/`data-theme` toggle exists anywhere in the codebase.
- IMPACT: the panel behind the sidebar and routed content reads as completely flat; any
  gradient must stay inside this single dark palette using existing near-black tokens, or it
  reads as bold rather than "almost-flat depth."

### Expected
- EXPECTED: `background-color: var(--bg-base)` on `.app-dashboard-layout` is replaced with a
  two-stop `linear-gradient(var(--bg-base), var(--bg-subtle))` — `--bg-subtle` is already
  `color-mix(in srgb, var(--bg-base), var(--text-primary) 5%)`, the smallest existing step
  above `--bg-base` — applied via `background`/`background-image` so the transition between
  the two darkest existing tokens stays barely perceptible.
- NOT EXPECTED: a new color token; a second theme variant; `.app-sidebar` or
  `.app-dashboard-layout__conteudo`'s own backgrounds touched; `AuthComponent`'s separate
  `:host` background (`auth.component.scss`) touched.

### Acceptance
- MUST: only `--bg-base` and `--bg-subtle` (both pre-existing) compose the gradient.
- MUST: the gradient reads as depth, not a visible band (e.g. top-to-bottom or a shallow
  diagonal).
- MUST NOT: any new `--bg-*`/`--accent-*` token introduced.
- MUST NOT: `AuthComponent`'s background touched.

### Constraints
- DO: scope this to `.app-dashboard-layout` in `dashboard-layout.component.scss` only.
- DO NOT: add a `prefers-color-scheme`/light-theme branch — the app has exactly one theme
  (`color-scheme: dark`, verified, no toggle exists).

## SPEC-003 - Reduce Sidebar-to-Content Gap

### Goal
- Shrink the horizontal inset between the sidebar's right edge and the routed content.

### Problem
- SITUATION: `.app-dashboard-layout` uses `grid-template-columns: auto 1fr` with no explicit
  `gap`/`column-gap`; the entire visual distance between sidebar and content is produced by
  `.app-dashboard-layout__conteudo`'s own uniform `padding: var(--spacing-3xl)` (2rem on every
  side, `dashboard-layout.component.scss:14-18`).
- IMPACT: the left component of that 2rem padding reads as an oversized gutter next to the
  sidebar's flush edge.

### Expected
- EXPECTED: the padding's left component shrinks from `var(--spacing-3xl)` (2rem) to
  `var(--spacing-xl)` (1rem) — the same value the codebase already falls back to at the
  `<=48rem` breakpoint (`dashboard-layout.component.scss:20-24`), grounding the choice in an
  already-used step of the existing `--spacing-*` scale (`styles.scss:76-82`) rather than a new
  value. Top, right, and bottom padding are untouched by this SPEC.
- NOT EXPECTED: sidebar and content visually touching (0 gap); a new `gap`/`column-gap`
  property added to `.app-dashboard-layout`.

### Acceptance
- MUST: content's left padding becomes exactly `var(--spacing-xl)`.
- MUST: a visible, non-zero gap remains between the sidebar's rounded right edge (SPEC-001)
  and the content.
- MUST NOT: any other side of `.app-dashboard-layout__conteudo`'s padding changed by this
  SPEC.
- MUST NOT: a new spacing token introduced.

### Constraints
- DO: edit only `.app-dashboard-layout__conteudo`'s padding in
  `dashboard-layout.component.scss`.
- DO NOT: touch the `@media (max-width: 48rem)` override — it already collapses to a single
  compact `--spacing-xl` value on narrow viewports, orthogonal to this desktop-gutter change.

## SPEC-004 - Vertical Content Padding

### Goal
- Give `.app-dashboard-layout__conteudo` roughly 4rem of top/bottom breathing room,
  independent of the sidebar-gap change.

### Problem
- SITUATION: `.app-dashboard-layout__conteudo`'s padding is currently uniform
  `var(--spacing-3xl)` (2rem) on every side; the project's `--spacing-*` scale
  (`styles.scss:76-82`) tops out at `--spacing-3xl` (2rem) — no existing step reaches 4rem.
- IMPACT: reaching ~4rem vertical padding needs either a raw literal (against
  `frontend/CLAUDE.md`'s "tokens consumed via `var(--token)`, never raw values" convention) or
  a new step added to the existing scale.

### Expected
- EXPECTED: a new `--spacing-4xl: 4rem;` token is added to the "Espaçamento" block in
  `styles.scss` (`styles.scss:75-82`), immediately after `--spacing-3xl`, following the scale's
  existing naming pattern; `.app-dashboard-layout__conteudo`'s top and bottom padding become
  `var(--spacing-4xl)`. Left padding stays whatever SPEC-003 leaves it at; right padding stays
  `var(--spacing-3xl)` (2rem, unchanged).
- NOT EXPECTED: `.app-sidebar`'s own padding (`var(--spacing-2xl) var(--spacing-xl)`) touched;
  a raw `4rem` literal used anywhere instead of the new token.

### Acceptance
- MUST: `--spacing-4xl` = `4rem`, added once and reused wherever this SPEC needs 4rem
  vertical padding.
- MUST: only content's top/bottom padding changes to the new token.
- MUST NOT: `.app-sidebar`'s own padding changed.
- MUST NOT: a raw `4rem` value written outside the new token's declaration.

### Constraints
- DO: add `--spacing-4xl` to the existing "Espaçamento" `:root` block in `styles.scss`,
  keeping the scale's naming convention (`xs` ... `3xl`).
- DO NOT: rename or alter the value of any existing `--spacing-*` token.

## SPEC-005 - Client-Side Password Length Feedback

### Goal
- Registration's password field visually flags itself below 6 characters, reusing the app's
  existing invalid-field pattern.

### Problem
- SITUATION: `RegistrarFormComponent` (`registrar-form.component.ts:35`) validates `senha`
  with `Validators.minLength(4)`. The template already wires
  `[class.is-invalid]="isInvalid('senha')"` (`registrar-form.component.html:28`), and
  `styles.scss` already themes that state globally:
  `.form-outline:has(.form-control.is-invalid)::after` turns the field's underline
  `--danger-base` and thickens it, and `.form-control.is-invalid ~ .form-label` turns the
  floating label `--danger-hover` (`styles.scss:396-399`, `420-422`).
- IMPACT: the visual-feedback mechanism is already fully wired end-to-end; only the length
  threshold is stale relative to the required 6-character minimum.

### Expected
- EXPECTED: `Validators.minLength(4)` becomes `Validators.minLength(6)` on the `senha`
  control; no template or SCSS change, since `isInvalid('senha')` and the global `.is-invalid`
  theming already produce the red underline/label once the control reports invalid.
- NOT EXPECTED: a new inline error-message element; a new validation-state CSS pattern; any
  change to `LoginFormComponent` (its `senha` control only authenticates, it never creates a
  password).

### Acceptance
- MUST: `senha`'s `minLength` becomes `6`.
- MUST: the existing `.is-invalid`-driven underline/label color change is the only visual
  feedback (reused, not a new pattern).
- MUST NOT: any other `registrar-form` control's validators changed.
- MUST NOT: `LoginFormComponent` touched.

### Constraints
- DO: change only `registrar-form.component.ts`'s `senha` validator array.
- DO NOT: introduce a distinct error-message component or text.

## SPEC-006 - Agendamento Date Range Restriction

### Goal
- The agendamento date field blocks past dates and dates more than 14 days out, using the
  native input's own range attributes.

### Problem
- SITUATION: the "Data" field on `AgendamentoFormComponent`
  (`agendamento-form.component.html:14-21`) is a plain native
  `<input type="date" formControlName="data" ...>` — there is no calendar/date-picker library
  in this codebase; MDB's `mdbInput` directive only themes the native input, and no MDB
  Datepicker or similar is imported by `agendamento-form.component.ts`.
- IMPACT: the native `<input type="date">` element already supports `min`/`max` attributes
  that restrict the browser's own date picker UI, so no new component or library is needed to
  satisfy the restriction.

### Expected
- EXPECTED: the template binds `[attr.min]` to today's date and `[attr.max]` to today + 14
  days, both computed once on `AgendamentoFormComponent` (ISO `yyyy-MM-dd`, the format the
  native date input expects) and exposed as readonly fields/getters alongside the existing
  `isInvalid` helper.
- NOT EXPECTED: a new calendar/date-picker component or third-party library added; the
  `horario` (`type="time"`) field touched; any change to `AgendamentoUpdateDTO`/
  `AgendamentoCreateDTO` payload shape.

### Acceptance
- MUST: the date input's browser picker/typed entry rejects dates before today and after
  today+14 days via `min`/`max`.
- MUST: bounds are computed relative to "today" at render time, not hardcoded.
- MUST NOT: a new component created for this.
- MUST NOT: any change to `horario`, `servicoId`, `usuarioId`, or `status` controls.

### Constraints
- DO: bind `min`/`max` directly on the existing `<input type="date">` in
  `agendamento-form.component.html`.
- DO NOT: build a custom calendar UI — the native input's `min`/`max` already satisfies the
  requirement, so per the explicit instruction against new components for this restriction, no
  fallback or deferral is needed here.

# CONSTRAINTS
- Scope: `frontend/` only; no backend changes.
- No new components, no new third-party libraries.
- Token discipline: reuse existing `--spacing-*`/`--border-*`/`--bg-*` tokens wherever
  possible; the one addition, `--spacing-4xl` (SPEC-004), follows the existing scale's naming
  and rem-based convention.
- Preserve existing layout structure, DOM, and component boundaries — these are visual/token
  and validator-threshold edits, not restructuring.
- SPEC-001 and SPEC-003 are sequenced first (sidebar edge and gap) so SPEC-004's vertical
  padding lands on the same `.app-dashboard-layout__conteudo` padding declaration without
  conflicting edits.

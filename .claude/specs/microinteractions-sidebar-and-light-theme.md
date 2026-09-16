---
name: microinteractions-sidebar-and-light-theme
author: jhotiori
date: 2026-09-16
---

# TASK
Three batches of frontend-only polish on `trimly/frontend`: (1) app-wide microinteraction
fixes (input-bar focus border, MDB modal title casing, SweetAlert2 button/text styling,
login/register heading spacing, Serviços create-icon swap, `.app-cartao` hover shadow +
new inactive-opacity token); (2) sidebar-only fixes (collapse/expand icon-gap bug, bold-on-
hover nav items, a new serif token for the sidebar logo); (3) a dark/light theme system
that removes the Configurações feature in favor of a persisted theme toggle in the same
sidebar slot, built entirely from the existing base/derived token architecture.

# GOAL
Every input bar, modal, alert, and the auth/sidebar/Serviços screens read as more
deliberately finished (correct casing, matching iconography, calmer focus/hover feedback)
without changing any layout, DOM structure, or unrelated token; the sidebar's collapse/
expand animation and hover feedback read as smooth and bug-free; and the app supports a
persisted light theme that is a pure base-token override of the existing
`color-mix()`-derived architecture, with Configurações fully removed and replaced by the
theme toggle in its former nav slot.

# SPECS

## SPEC-001 - Input Bars: Full Focus Border, Bottom-Border Removal

### Goal
- Every input bar app-wide (MDB `.form-outline` fields and the `.app-busca` search bar)
  shows a small full-perimeter accent border only on focus/active, with only a background
  color change on hover; no bottom-only border remains anywhere.

### Problem
- SITUATION: `styles.scss` implements focus feedback as a bottom-only line: `.form-outline
  .form-control` has no border at all (feedback comes from a `.form-outline::after`
  pseudo-element pinned to `bottom: 0`, animating `background-color`/`height` on hover
  (`--border-hover`), focus-within (`--accent-hover`, `--border-width-md`), and invalid
  (`--danger-base`)); `.app-busca` uses a literal `border-bottom: var(--border-width-sm)
  solid transparent`, switching to `border-bottom-color: var(--accent-hover)` on
  `:focus-within`. `mdb-form-control` (used by `login-form`, `registrar-form`,
  `agendamento-form`, `disponibilidade-form`, `servico-form`) renders its own
  `.form-outline` wrapper, so this is the single implementation behind every input bar in
  the app, not just modals.
- IMPACT: feedback is a heavy, asymmetric underline instead of a small full-border micro
  cue; fixing `.form-outline`/`.app-busca` once in `styles.scss` fixes every consumer.

### Plan
- Remove `.form-outline::after` and its three state rules (hover/focus-within/invalid) from
  `styles.scss` (current lines 376-401).
- On `.form-outline .form-control` (`styles.scss` lines 347-372): add `border:
  var(--border-width-sm) solid transparent;` and change `border-radius` to the uniform
  `var(--border-radius-md)` (drop the `0 0` bottom-flush corners, now meaningless with a
  full border); keep the existing `&:hover, &:focus { background-color: var(--bg-surface);
  color: var(--text-primary); }` color-only hover feedback unchanged; add `&:focus {
  border-color: var(--accent-hover); }`; replace the removed `:has(.form-control.is-
  invalid)::after` rule with `&.is-invalid, &.is-invalid:hover, &.is-invalid:focus {
  border-color: var(--danger-base); }` so the invalid border always wins over hover/focus.
- On `.app-busca` (`styles.scss` lines 512-536): replace `border-bottom: var(--border-
  width-sm) solid transparent;` with `border: var(--border-width-sm) solid transparent;`
  and its uniform `border-radius` (drop the `0 0` bottom-flush corners); keep the existing
  `&:hover { background-color: var(--bg-surface); }` unchanged; replace `border-bottom-
  color: var(--accent-hover);` inside `&:focus-within` with `border-color: var(--accent-
  hover);`.
- Drop `.form-outline { position: relative; }` (`styles.scss` line 343-345) — it existed
  only to position the removed `::after` line.

### Scenario
- GIVEN any MDB-backed input (`login-form`, `registrar-form`, `agendamento-form`,
  `disponibilidade-form`, `servico-form`) or the `.app-busca` search bar.
- WHEN the user hovers it, THEN only its background color shifts (`--bg-subtle` ->
  `--bg-surface`), no border appears.
- WHEN the user focuses/activates it, THEN a full `--border-width-sm` accent-colored
  (`--accent-hover`) border appears around the entire input, replacing the old bottom line.
- AND an invalid MDB field shows a full `--danger-base` border regardless of hover/focus.

### Expected
- EXPECTED: no element in `frontend/src` still declares a bottom-only border/underline for
  an input bar.
- NOT EXPECTED: any layout shift on hover/focus (border is transparent at rest, same width
  always, per the project's existing "border only marks focus/active, transparent at rest"
  convention).

### Acceptance
- MUST: `.form-outline::after` and its three state rules no longer exist in `styles.scss`.
- MUST: `.form-outline .form-control` and `.app-busca` use a full `border`, transparent at
  rest, accent-colored on focus/focus-within.
- MUST NOT: any `border-bottom`/`border-top`/`border-left`/`border-right` remain on either
  selector.
- MUST NOT: `.form-outline .form-control~.form-label` positioning (`top: var(--spacing-
  lg)`) change.

### Tasks
- [ ] Remove `.form-outline::after` + hover/focus-within/invalid `::after` rules.
- [ ] Add full transparent border + `:focus` accent border + `.is-invalid` border to
      `.form-outline .form-control`; unify its `border-radius`.
- [ ] Swap `.app-busca`'s `border-bottom` for a full `border`; unify its `border-radius`;
      update `:focus-within` to set `border-color` instead of `border-bottom-color`.
- [ ] Remove the now-unused `.form-outline { position: relative; }`.

### Constraints
- DO: keep every change inside `styles.scss` — this is a global-token-consumer fix, no
  `.html`/`.ts` edits, no new BEM class.
- DO NOT: touch `.form-outline .form-control~.form-label` color states (focus/invalid
  label color rules stay as-is).

## SPEC-002 - MDB Modal Titles: Title Case

### Goal
- Every hard-coded MDB modal title (`.modal-title`) reads in Title Case.

### Problem
- SITUATION: three templates hard-code `.modal-title` text in sentence case:
  `agendamento-form.component.html:2-4` (`{{ isEditing ? "Editar agendamento" : "Novo
  agendamento" }}`), `disponibilidade-form.component.html:2` (`Nova disponibilidade`),
  `servico-form.component.html:2` (`{{ isEditing ? "Editar serviço" : "Novo serviço" }}`).
- IMPACT: casing is wrong in exactly these 3 template locations; per explicit instruction,
  fix in place — no pipe, no centralized title-casing logic.

### Plan
- `agendamento-form.component.html:3`: `"Editar agendamento" : "Novo agendamento"` ->
  `"Editar Agendamento" : "Novo Agendamento"`.
- `disponibilidade-form.component.html:2`: `Nova disponibilidade` -> `Nova Disponibilidade`.
- `servico-form.component.html:2`: `"Editar serviço" : "Novo serviço"` -> `"Editar Serviço"
  : "Novo Serviço"`.

### Scenario
- GIVEN a gestor opens any of the three modals (create or edit mode).
- WHEN the modal renders, THEN its `.modal-title` reads in Title Case in every mode.

### Expected
- EXPECTED: only the 3 literal strings above change.
- NOT EXPECTED: a new pipe, directive, or shared casing utility introduced.

### Acceptance
- MUST: all 3 titles are Title Case in both their ternary branches (where applicable).
- MUST NOT: any centralized/pipe-based title-casing mechanism added.

### Tasks
- [ ] Update `agendamento-form.component.html` title strings.
- [ ] Update `disponibilidade-form.component.html` title string.
- [ ] Update `servico-form.component.html` title strings.

### Constraints
- DO: edit each string in place, per-template.
- DO NOT: introduce a pipe or centralized casing logic (explicit user instruction).

## SPEC-003 - SweetAlert2: Semibold Buttons, Italic/Muted Descriptive Text

### Goal
- SweetAlert2 dialog buttons render semibold; the descriptive text under the title
  (`confirm`'s `texto`, `error`'s `mensagem`) renders italic and at reduced contrast,
  matching the app's existing italic/`--text-muted` treatment for secondary descriptive
  text (`.app-tela__descricao`).

### Problem
- SITUATION: `AlertService` (`src/app/core/services/alert.service.ts:13-24`) configures
  `swalTema` via `Swal.mixin` with `customClass: { popup: "app-alert", title: "app-
  alert__titulo", confirmButton: "app-alert__botao", cancelButton: "app-alert__botao" }` —
  no `customClass.htmlContainer` entry exists for the descriptive text, and `.app-
  alert__botao` (`styles.scss:332-335`) declares only `border-radius`/`transition`, no
  `font-weight`.
- IMPACT: buttons inherit SweetAlert2's default (non-semibold) button weight; the
  descriptive text inherits the popup's plain `color: var(--text-primary)`, with no italic
  or contrast reduction.

### Plan
- Add `font-weight: var(--font-weight-semibold);` to `.app-alert__botao` in `styles.scss`.
- Add `htmlContainer: "app-alert__texto"` to `swalTema`'s `customClass` in
  `alert.service.ts`.
- Add a new rule in `styles.scss`, alongside the other `.app-alert*` rules (near line 328):
  `.app-alert__texto { font-style: italic; color: var(--text-muted); }` — the same
  italic + `--text-muted` pairing already used by `.app-tela__descricao`.

### Scenario
- GIVEN any confirm or error dialog fires via `AlertService`.
- WHEN it renders, THEN "Confirmar"/"Voltar"/"Entendi" render semibold, and the body text
  (`texto`/`mensagem`) renders italic in `--text-muted`.

### Expected
- EXPECTED: only `.app-alert__botao` and the new `.app-alert__texto` rule change/are added
  in `styles.scss`; only `customClass.htmlContainer` is added in `alert.service.ts`.
- NOT EXPECTED: any change to `AlertService`'s public API (`confirm`/`error` signatures).

### Acceptance
- MUST: `.app-alert__botao` includes `font-weight: var(--font-weight-semibold)`.
- MUST: descriptive text under the title is italic and colored `var(--text-muted)`.
- MUST NOT: `swalTema`'s `background`/`color`/`confirmButtonColor`/`cancelButtonColor` or
  the `popup`/`title` custom classes change.

### Tasks
- [ ] Add `font-weight: var(--font-weight-semibold)` to `.app-alert__botao`.
- [ ] Add `htmlContainer: "app-alert__texto"` to `swalTema`'s `customClass`.
- [ ] Add `.app-alert__texto { font-style: italic; color: var(--text-muted); }` to
      `styles.scss`.

### Constraints
- DO: keep all SweetAlert2 theming in `styles.scss`/`alert.service.ts` only (no other file
  imports `sweetalert2`, per existing convention).
- DO NOT: touch `AlertService`'s `confirm`/`error` method signatures.

## SPEC-004 - Login/Register: Smaller Heading, Added Vertical Margin

### Goal
- The auth screen's heading (`Login`/`Registrar`) is a step smaller and visually separated
  from the form below by a small added margin.

### Problem
- SITUATION: `auth.component.html:2` renders `<h2 class="app-auth__titulo">{{ mode() ===
  "login" ? "Login" : "Registrar" }}</h2>`; `h2` resolves `--font-size-2xl` (2.5rem) from
  the global rule in `styles.scss:230-237`; spacing to the form below comes only from
  `.app-auth__cartao`'s `display: grid; gap: var(--spacing-2xl);` (`auth.component.scss:12-
  22`), shared uniformly across all 3 grid rows (title, form, alternar-link paragraph).
- IMPACT: the heading has no dedicated spacing beyond the grid's uniform row gap, and sits
  at the full `h2` size with no smaller, auth-specific override.

### Plan
- Add to `auth.component.scss`: a `.app-auth__titulo` rule overriding `font-size:
  var(--font-size-xl)` (one step down from the inherited `--font-size-2xl`) and adding
  `margin-bottom: var(--spacing-md)` on top of the existing `--spacing-2xl` grid gap.

### Scenario
- GIVEN the auth screen renders in either `login` or `registrar` mode.
- WHEN the heading renders, THEN it is one type-scale step smaller than before and has
  extra vertical space before `.app-auth__formulario`.

### Expected
- EXPECTED: only `.app-auth__titulo` gains `font-size` and `margin-bottom`; no other
  `h2` elsewhere in the app is affected (scoped to `auth.component.scss`).
- NOT EXPECTED: any change to `.app-auth__cartao`'s grid `gap`.

### Acceptance
- MUST: `.app-auth__titulo`'s `font-size` resolves to `var(--font-size-xl)`.
- MUST: `.app-auth__titulo` has a `margin-bottom` using an existing `--spacing-*` token.
- MUST NOT: any global `h2` rule in `styles.scss` change.

### Tasks
- [ ] Add `.app-auth__titulo { font-size: var(--font-size-xl); margin-bottom: var(--spacing-md); }`
      to `auth.component.scss`.

### Constraints
- DO: scope the change to `auth.component.scss` only.
- DO NOT: modify `styles.scss`'s global `h2` rule.

## SPEC-005 - Serviços: Replace "Novo Serviço" Icon

### Goal
- The Serviços screen's create button icon visually matches its domain (priced service
  listings), the way Agendamentos' `ti-calendar-plus` matches its own.

### Problem
- SITUATION: `servico-screen.component.html:25` uses `<i aria-hidden="true" class="ti ti-
  plus"></i>` — a generic plus, unlike Agendamentos' domain-matched `ti-calendar-plus`
  (`agendamento-screen.component.html:29`, also mirrored in the sidebar's own
  Agendamentos entry). `@tabler/icons-webfont` (`node_modules/@tabler/icons-webfont/dist/
  tabler-icons.css`) has no `scissors-plus`; `.ti-tag-plus:before` exists (confirmed at
  line 18684) and fits the screen's own description ("Os serviços da barbearia, com preço e
  duração" — price/duration, i.e. a priced-listing/tag concept).
- IMPACT: `ti-plus` reads generically next to Agendamentos' domain-specific icon.

### Plan
- `servico-screen.component.html:25`: replace `class="ti ti-plus"` with `class="ti ti-tag-
  plus"`.

### Scenario
- GIVEN the Serviços screen renders for a gestor.
- WHEN the "Novo serviço" button renders, THEN its icon is `ti-tag-plus` instead of `ti-
  plus`.

### Expected
- EXPECTED: only the icon class changes; `aria-label`/`title="Novo serviço"` stay as-is.
- NOT EXPECTED: any other Serviços icon change.

### Acceptance
- MUST: `servico-screen.component.html`'s create button uses `ti-tag-plus`.
- MUST NOT: `app-tela__criar` structure/behavior change.

### Tasks
- [ ] Swap `ti-plus` for `ti-tag-plus` in `servico-screen.component.html:25`.

### Constraints
- RECOMMENDATION, not final: `ti-tag-plus` is the best current match in the installed
  Tabler set; swap to a closer icon later if a better fit surfaces (e.g. a future Tabler
  version ships a scissors/razor-plus icon).

## SPEC-006 - `.app-cartao`: Hover Shadow and `--opacity-inactive` Token

### Goal
- A new `--opacity-inactive: 0.75` token exists in `styles.scss`'s opacity block;
  `.app-cartao` rests at that opacity (instead of the semantically-unrelated
  `--opacity-disabled`) and gains a very subtle hover `box-shadow` alongside its existing
  hover treatment.

### Problem
- SITUATION: `styles.scss:96-98` declares `--opacity-visible: 1`, `--opacity-disabled:
  0.5`, `--opacity-hidden: 0` — no intermediate "inactive but not disabled" step.
  `.app-cartao` (`styles.scss:622-642`) rests at `opacity: var(--opacity-disabled)` and
  already brightens to `var(--opacity-visible)` on `:hover`, alongside `background-color`
  and `transform: scale(1.02)`; it declares no `box-shadow`. A global reset
  (`styles.scss:200-204`) sets `box-shadow: none` on every `[class^="app-"]` element,
  specificity `(0,1,0)`.
- IMPACT: reusing `--opacity-disabled` (meant for disabled controls, e.g. `button:disabled`
  at `styles.scss:170-173`) for a resting card is a semantic mismatch; adding a card
  `box-shadow` at rest would visually conflict with the flat design language, so it must be
  hover-only. `.app-cartao:hover` has specificity `(0,2,0)` (class + pseudo-class), which
  already beats the `(0,1,0)` global reset, so a hover-only `box-shadow` renders correctly
  without touching the reset rule.

### Plan
- Add `--opacity-inactive: 0.75;` to `styles.scss`'s opacity block (after `--opacity-
  disabled`, before `--opacity-hidden`).
- Change `.app-cartao`'s resting `opacity` from `var(--opacity-disabled)` to
  `var(--opacity-inactive)`; keep `&:hover { opacity: var(--opacity-visible); }` unchanged.
- Add to `.app-cartao:hover`: `box-shadow: 0 var(--spacing-xs) var(--spacing-lg) color-
  mix(in srgb, var(--bg-base), transparent 70%);` — token-built, no raw hex/px, very low
  spread/opacity given the 70% transparency mix.
- Add `box-shadow` to `.app-cartao`'s existing `transition` list.

### Scenario
- GIVEN an `.app-cartao` at rest.
- WHEN unhovered, THEN its opacity is `0.75` (`--opacity-inactive`), no `box-shadow`.
- WHEN hovered, THEN opacity reaches `1`, it scales `1.02`, and a faint `box-shadow`
  fades in over `--animation-fast`.

### Expected
- EXPECTED: `--opacity-inactive` is consumed only by `.app-cartao`'s resting state (no
  other selector is required to adopt it by this spec).
- NOT EXPECTED: any visible `box-shadow` at rest, or on any other `[class^="app-"]`
  element.

### Acceptance
- MUST: `--opacity-inactive: 0.75` exists in `styles.scss`'s opacity token block.
- MUST: `.app-cartao`'s resting `opacity` reads `var(--opacity-inactive)`.
- MUST: `.app-cartao:hover` declares a token-built `box-shadow`; `.app-cartao` (rest) does
  not.
- MUST NOT: `--opacity-disabled`'s value or its other consumers (`button:disabled`) change.

### Tasks
- [ ] Add `--opacity-inactive: 0.75;` to the opacity token block.
- [ ] Swap `.app-cartao`'s resting `opacity` to `var(--opacity-inactive)`.
- [ ] Add the hover `box-shadow` and include `box-shadow` in `.app-cartao`'s `transition`.

### Constraints
- DO: keep the new token adjacent to the existing 3 opacity tokens, same naming style.
- DO NOT: change `.app-cartao`'s hover `background-color`/`transform` behavior.

## SPEC-007 - Sidebar: Fix Collapse/Expand Icon-Gap Bug

### Goal
- Nav icons hold the exact same horizontal position whether the sidebar is collapsed or
  expanded — no icon "jump"/extra gap appears when re-expanding after a collapse.

### Problem
- SITUATION (root cause, confirmed by reading `sidebar.component.scss`): `.app-sidebar__item`
  is a flex row with `gap: var(--spacing-md)` between its icon (`i`) and
  `.app-sidebar__rotulo` (lines 73-97). While collapsed, `.app-sidebar--recolhida
  .app-sidebar__rotulo { display: none; }` removes the label from flex layout entirely (a
  `display: none` item does not participate in `gap`), and `.app-sidebar--recolhida
  .app-sidebar__item { justify-content: center; }` (lines 164-178) re-centers the lone
  icon inside the full row width. Neither `display` nor `justify-content` can be
  transitioned/interpolated (only `width`, on `.app-sidebar` itself, animates over
  `--animation-medium`). So collapsing/expanding does not smoothly reposition the icon: it
  snaps between two entirely different layout algorithms (centered-alone vs. flex-start-
  plus-`--spacing-md`-gap-plus-label) at the instant the class toggles, independent of and
  out of sync with the sidebar's own 250ms width transition.
- IMPACT: right after collapsing, the icon sits centered and "tidy"; right after
  re-expanding, the icon snaps to flex-start and a new `gap` appears before the label pops
  in — read by the user as the icon "gaining extra gap/spacing" compared to its settled
  collapsed position, because the icon's own X position was never fixed, only re-derived
  per state.

### Plan
- Stop toggling `justify-content` on `.app-sidebar__item`: remove `justify-content:
  center;` from `.app-sidebar--recolhida .app-sidebar__item` (`sidebar.component.scss`
  lines 164-178) and from the `@media (max-width: 48rem)` icon-rail block (lines 182-200).
- Give the icon (`i` inside `.app-sidebar__item`, lines 90-97) a fixed-width column instead
  of relying on `justify-content` for centering: keep `flex: none;` and `font-size: var(--
  font-size-md)`, and set `width` to the icon column's collapsed content width so the icon
  renders at the same X offset whether `.app-sidebar__rotulo` is visible or `display:
  none`. Concretely: keep `.app-sidebar__item`'s `justify-content` at its default
  (flex-start, i.e. remove the property entirely rather than setting it explicitly), and
  size the icon column with `display: grid; place-items: center;` over a fixed `width`
  equal to `.app-sidebar--recolhida`'s available content width (row width minus the
  item's own horizontal padding), so the icon is centered *within its own reserved column*
  rather than the row re-centering around it.
- Result: the icon's box never moves; only the label's box (still `display: none` when
  collapsed) appends after the fixed icon column and the `gap`, so re-expanding only
  reveals the label sliding in — the icon itself is never repositioned.

### Scenario
- GIVEN the sidebar is expanded, WHEN the user collapses it, THEN each icon stays at the
  same X position it already had (only the label disappears).
- GIVEN the sidebar is collapsed, WHEN the user expands it again, THEN each icon stays at
  that same X position (only the label reappears) — no snap, no extra gap.

### Expected
- EXPECTED: the icon's rendered horizontal position is identical in both collapsed and
  expanded states.
- NOT EXPECTED: any `justify-content` toggle remaining on `.app-sidebar__item` in either
  the `.app-sidebar--recolhida` block or the `@media (max-width: 48rem)` block.

### Acceptance
- MUST: `.app-sidebar__item`'s icon column has a fixed width, unaffected by
  `.app-sidebar__rotulo`'s visibility.
- MUST NOT: `justify-content: center` remain anywhere targeting `.app-sidebar__item`.
- MUST NOT: `.app-sidebar__marca`'s equivalent icon/label pairing (`.app-sidebar__simbolo`
  + `.app-sidebar__logotipo`) regress — apply the same fixed-column treatment there if it
  shares the same `justify-content: center` toggle (it does, via the same
  `.app-sidebar--recolhida .app-sidebar__marca { justify-content: center; }` rule).

### Tasks
- [ ] Remove `justify-content: center` from `.app-sidebar--recolhida .app-sidebar__item`
      and `.app-sidebar__marca`, and from the `@media (max-width: 48rem)` equivalents.
- [ ] Give the icon (`.app-sidebar__item i` and `.app-sidebar__simbolo`) a fixed-width,
      centered column so its position no longer depends on the row's `justify-content`.
- [ ] Verify visually: collapse, then expand — icons must not shift.

### Constraints
- DO NOT: change anything else in the sidebar beyond this bug fix, SPEC-008, and SPEC-009
  (explicit scope limit).
- DO NOT: change the collapsed rail width (`4.5rem`) or the expanded width (`15rem`).

## SPEC-008 - Sidebar: Bold-on-Hover Nav Items

### Goal
- `.app-sidebar__item`/`.app-sidebar__rotulo` read bolder on hover, with as smooth a
  transition as CSS allows given `font-weight` cannot itself be interpolated.

### Problem
- SITUATION: `.app-sidebar__rotulo` (`sidebar.component.scss:110-113`) is statically
  `font-weight: var(--font-weight-semibold)` (600); `.app-sidebar__item`'s hover rule
  (lines 99-107) transitions `background-color`, `border-color`, `color` via `--animation-
  fast`, all real interpolatable properties.
- IMPACT (investigated): `font-weight` is not interpolated between two static weights by
  any current browser for this app's fonts — Inter is loaded via Google Fonts at fixed
  static weights (300/400/600/800, per `index.html`'s `<link>`), not as a single variable-
  font file with a continuous `wght` axis, so a `transition: font-weight` here would still
  snap instantly between 600 and 800 regardless of duration. A true smooth weight ramp is
  not feasible without switching Inter's delivery to a variable-font file, which is out of
  scope. Feasible workaround: pair the (instant) `font-weight` snap with a synthetic-bold
  `text-shadow` that *does* interpolate, giving the impression of a gradual thickening even
  though the underlying weight change itself is a hard cut.

### Plan
- On `.app-sidebar__item:hover .app-sidebar__rotulo`: set `font-weight: var(--font-weight-
  bold)` (snaps instantly, unavoidable) and `text-shadow: 0 0 0.02em currentColor, 0 0
  0.02em currentColor` (a synthetic-bold double-shadow that reinforces the stroke).
- On `.app-sidebar__rotulo` (base rule): add `transition: text-shadow var(--animation-
  fast);` so the `text-shadow` component fades in smoothly even though `font-weight` itself
  cannot; this overrides the global `*, *::before, *::after { text-shadow: none; }` reset
  (`styles.scss:114-121`) via the higher-specificity class selector, same pattern already
  used for `.app-sidebar`'s deliberate border exception.

### Scenario
- GIVEN a sidebar nav item at rest (label semibold, no shadow).
- WHEN hovered, THEN the label's `font-weight` snaps to bold instantly and its
  `text-shadow` fades in over `--animation-fast`, together reading as a gradual bolding.
- WHEN unhovered, THEN both revert (weight snaps back, shadow fades out).

### Expected
- EXPECTED: the label visibly reads bolder on hover.
- NOT EXPECTED: any claim/attempt to make the literal `font-weight` value interpolate
  smoothly — it cannot, with the current static-weight Inter delivery; only the shadow
  fades.

### Acceptance
- MUST: `.app-sidebar__item:hover .app-sidebar__rotulo` sets `font-weight: var(--font-
  weight-bold)`.
- MUST: the `text-shadow` addition transitions via `var(--animation-fast)`.
- MUST NOT: Inter's font delivery (`index.html`'s `<link>`) change to a variable-font
  request as part of this spec.

### Tasks
- [ ] Add `font-weight: var(--font-weight-bold)` + synthetic-bold `text-shadow` to
      `.app-sidebar__item:hover .app-sidebar__rotulo`.
- [ ] Add `transition: text-shadow var(--animation-fast);` to the base `.app-sidebar__rotulo`
      rule.

### Constraints
- DO NOT: change anything else in the sidebar beyond SPEC-007, this spec, and SPEC-009
  (explicit scope limit).
- DO NOT: introduce a variable-font Inter request to chase a true smooth weight
  transition — flagged as infeasible within this spec's scope.

## SPEC-009 - Sidebar: `--font-family-serif` Token for the Logo

### Goal
- A new `--font-family-serif` token, set to Playfair Display, applies only to the
  sidebar's `Trimly` logotype.

### Problem
- SITUATION: `styles.scss:9-14`'s font-role block declares exactly 3 tokens (`--font-
  family-display`: Geist; `--font-family-interface`: Inter; `--font-family-mono`: Geist
  Mono); `index.html:12-14` loads all 3 via one Google Fonts `<link>`. The sidebar's
  `.app-sidebar__logotipo` (`sidebar.component.scss:52-59`) currently reads `font-family:
  var(--font-family-display)` (Geist) at `font-weight: var(--font-weight-bold)` (800). The
  app's prior display face, Fraunces, was already migrated away from in
  `vercel-style-redesign.md` SPEC-001 — Playfair Display is a deliberately different serif
  choice for this one element, not a Fraunces reinstatement.
- IMPACT: introducing a 4th font-role token, used by exactly one element, is an explicit,
  narrow exception the user has approved (unlike SPEC-003 of `vercel-style-redesign.md`,
  which renamed rather than added a token).

### Plan
- Add `--font-family-serif: "Playfair Display", "Georgia", serif;` to `styles.scss`'s font
  block (alongside `--font-family-display`/`-interface`/`-mono`, lines 12-14).
- Update `index.html:12-14`'s Google Fonts `<link>` href to add `&family=Playfair+Display:
  wght@600;700` (matching the logo's current 800-weight display, at the closest weights
  Playfair Display ships; use `700` where `.app-sidebar__logotipo`'s current `font-weight:
  var(--font-weight-bold)` (800) is applied, since Playfair Display's heaviest static cut is
  700).
- Update `.app-sidebar__logotipo` (`sidebar.component.scss:52-59`): change `font-family:
  var(--font-family-display)` to `font-family: var(--font-family-serif)`.

### Scenario
- GIVEN the sidebar renders, WHEN the logo text mounts, THEN "Trimly" renders in Playfair
  Display instead of Geist.
- GIVEN any other element using `--font-family-display` (h2-h4), WHEN it renders, THEN it
  is unaffected — still Geist.

### Expected
- EXPECTED: `--font-family-serif` is consumed only by `.app-sidebar__logotipo`.
- NOT EXPECTED: any h2-h4 or other `--font-family-display` consumer switching to serif.

### Acceptance
- MUST: `--font-family-serif: "Playfair Display", "Georgia", serif;` exists in
  `styles.scss`.
- MUST: `index.html`'s font `<link>` requests Playfair Display at the weight(s)
  `.app-sidebar__logotipo` uses.
- MUST: `.app-sidebar__logotipo` is the only selector reading `var(--font-family-serif)`.
- MUST NOT: `--font-family-display`'s value or any of its other consumers change.

### Tasks
- [ ] Add `--font-family-serif` token to `styles.scss`.
- [ ] Add Playfair Display to `index.html`'s font `<link>` href.
- [ ] Switch `.app-sidebar__logotipo`'s `font-family` to `var(--font-family-serif)`.

### Constraints
- DO NOT: change anything else in the sidebar beyond SPEC-007, SPEC-008, and this spec
  (explicit scope limit).
- DO NOT: reintroduce Fraunces or touch `--font-family-display`.

## SPEC-010 - Remove Configurações Feature

### Goal
- The Configurações feature (component, route, sidebar entry) no longer exists anywhere in
  the app.

### Problem
- SITUATION: `ConfiguracoesComponent` lives at `src/app/features/configuracoes/`
  (`configuracoes.component.ts/.html/.scss/.spec.ts`); it is routed at `app.routes.ts:6,43-
  45` (`path: "configuracoes"`, imported line 6); `RoutePaths.DASHBOARD_CONFIGURACOES_
  ROUTE` is defined in `core/config/route-paths.config.ts`; the sidebar links to it at
  `sidebar.component.html:51-60`.
- IMPACT: this feature is being fully replaced by the theme toggle (SPEC-011) in the exact
  same nav slot.

### Plan
- Delete `src/app/features/configuracoes/` entirely (all 4 files).
- Remove `ConfiguracoesComponent`'s import (`app.routes.ts:6`) and its route object
  (`app.routes.ts:42-45`).
- Remove `DASHBOARD_CONFIGURACOES_ROUTE` from `RoutePaths`
  (`core/config/route-paths.config.ts`).
- Remove the Configurações `<li>` (`sidebar.component.html:51-60`) — replaced in the same
  position by SPEC-011's theme-toggle `<li>`.

### Scenario
- GIVEN the app is built after this spec, WHEN any route table or nav is inspected, THEN
  no reference to Configurações/`configuracoes` remains.

### Expected
- EXPECTED: `/dashboard/configuracoes` is no longer a valid route.
- NOT EXPECTED: any other `/dashboard/*` route affected.

### Acceptance
- MUST: `src/app/features/configuracoes/` no longer exists.
- MUST: no `.ts`/`.html` file references `Configuracoes`/`configuracoes` afterward, except
  the theme-toggle replacement's own new code.
- MUST NOT: `DASHBOARD_VIEW_ROUTE`/`DASHBOARD_AGENDAMENTOS_ROUTE`/
  `DASHBOARD_SERVICOS_ROUTE` change.

### Tasks
- [ ] Delete the `features/configuracoes/` directory.
- [ ] Remove its import + route from `app.routes.ts`.
- [ ] Remove `DASHBOARD_CONFIGURACOES_ROUTE` from `route-paths.config.ts`.
- [ ] Remove its `<li>` from `sidebar.component.html`.

### Constraints
- DO: sequence before or alongside SPEC-011 (the sidebar slot it frees is reused
  immediately).
- DO NOT: remove `authStore.isGestor()`-gated entries (Disponibilidades) — unrelated.

## SPEC-011 - Dark/Light Theme Toggle in the Sidebar

### Goal
- A theme toggle sits in the sidebar's former Configurações slot: labeled "Tema" always,
  icon swaps between `ti-sun` (dark active, offers switching to light) and `ti-moon` (light
  active, offers switching to dark); the chosen theme persists across reloads.

### Problem
- SITUATION: the app has no existing theme-persistence pattern (`localStorage` is not used
  anywhere in `frontend/src`) and no existing root-level class/attribute toggle mechanism.
  Dark is the only theme today (`html, body { color-scheme: dark; }`, `styles.scss:131-
  132`). `@tabler/icons-webfont` confirms both `.ti-sun:before` and `.ti-moon:before` exist.
- IMPACT: a new, small `ThemeService` is needed as the single owner of theme state,
  DOM-attribute toggling, and persistence; nothing to reuse.

### Plan
- Add `ThemeService` at `src/app/core/services/theme.service.ts`
  (`@Injectable({ providedIn: "root" })`, app-shell infra, alongside `AlertService`):
  - Private `signal<"dark" | "light">`, exposed via a readonly `theme` accessor (same
    signal convention as `SidebarComponent.collapsed`).
  - Reads `localStorage.getItem("trimly-theme")` on construction; defaults to `"dark"` when
    absent/invalid.
  - `toggle()`: flips the signal, writes the new value to `localStorage`, and sets/removes
    `data-theme="light"` on `document.documentElement` (dark = no attribute, matching
    "dark is default" with zero markup for the common case).
  - Applies the persisted theme to `document.documentElement` once at construction too, so
    a reload lands on the right theme before the sidebar even renders.
- In `sidebar.component.ts`: inject `ThemeService` as `readonly themeService = inject(ThemeService);`.
- In `sidebar.component.html`, replace the removed Configurações `<li>` (SPEC-010) with:
  ```html
  <li>
      <button
          (click)="themeService.toggle()"
          class="app-sidebar__item"
          title="Tema"
          type="button">
          <i
              [class.ti-sun]="themeService.theme() === 'dark'"
              [class.ti-moon]="themeService.theme() === 'light'"
              aria-hidden="true"
              class="ti"></i>
          <span class="app-sidebar__rotulo">Tema</span>
      </button>
  </li>
  ```

### Scenario
- GIVEN dark theme is active (default), WHEN the sidebar renders, THEN the toggle shows
  `ti-sun` and label "Tema".
- WHEN the user clicks it, THEN the theme switches to light, the icon swaps to `ti-moon`,
  `data-theme="light"` is set on `<html>`, and `localStorage` records `"light"`.
- GIVEN light theme was persisted, WHEN the page reloads, THEN it loads in light theme with
  `ti-moon` shown, before any user interaction.

### Expected
- EXPECTED: the label always reads "Tema", in both themes.
- NOT EXPECTED: any other sidebar entry, route, or store touched by this spec.

### Acceptance
- MUST: `ThemeService` persists the theme via `localStorage` and restores it on load.
- MUST: icon is `ti-sun` exactly when dark is active, `ti-moon` exactly when light is
  active.
- MUST: label text is always "Tema".
- MUST NOT: any new `MdbModalService` modal, route, or additional sidebar entry introduced
  beyond the single toggle button.

### Tasks
- [ ] Create `ThemeService` (`core/services/theme.service.ts`) with signal, `toggle()`,
      localStorage persistence, and initial DOM-attribute application.
- [ ] Inject `ThemeService` into `SidebarComponent`.
- [ ] Add the toggle `<li>` to `sidebar.component.html` in Configurações' former slot.

### Constraints
- DO: use `data-theme="light"` on `document.documentElement` as the toggle mechanism (no
  existing app convention to reuse; picked for direct compatibility with SPEC-012's
  `[data-theme="light"]` token-override scope).
- DO NOT: add a confirmation dialog, animation beyond SPEC-013, or any second toggle
  control.

## SPEC-012 - Light Theme: Base-Token Overrides Only

### Goal
- A `[data-theme="light"]` scope overrides exactly the existing base (raw-value) tokens in
  `styles.scss`, with every derived `color-mix()` token duplicated verbatim underneath —
  no new token, no restructured architecture.

### Problem
- SITUATION: `styles.scss:43-73` holds exactly 4 base (raw `hsl()`) tokens — `--text-
  primary: hsl(0 0 90%)`, `--accent-base: hsl(0 60% 40%)`, `--danger-base: hsl(356 34%
  38%)`, `--bg-base: hsl(0 0 0%)` — and 16 derived tokens computed from them via `color-
  mix(in srgb, var(--base-token), var(--other-base-token) N%)`: `--text-secondary`,
  `--text-tertiary`, `--text-muted`, `--text-faint` (from `--text-primary`/`--bg-base`);
  `--accent-surface`, `--accent-elevated`, `--accent-hover` (from `--accent-base`/`--text-
  primary`); `--danger-hover`, `--danger-surface` (from `--danger-base`/`--text-
  primary`/`--bg-base`); `--bg-hover`, `--bg-highlight`, `--bg-subtle`, `--bg-surface`,
  `--bg-elevated` (from `--bg-base`/`--text-primary`); `--border-base`, `--border-hover`
  (from `--bg-base`/`--text-primary`). No other selector in `styles.scss` declares a raw
  color literal.
- IMPACT: light theme must be exactly these 4 base tokens re-declared with light-mode raw
  values, plus all 16 derived tokens copied byte-for-byte (same `color-mix()` formula) into
  the same scope, so the light theme mathematically mirrors the dark theme's contrast
  ladder.

### Plan
- Add a `[data-theme="light"] { ... }` block in `styles.scss`, placed immediately after the
  `:root` block, containing:
  - The 4 base tokens with light-mode values, same literal `hsl()` formatting style as
    each token's dark counterpart (e.g. `--text-primary` and `--bg-base` omit `%` on the
    saturation component today — preserve that same per-token formatting quirk):
    - `--text-primary: hsl(0 0 10%);` (near-black text, mirrors dark's near-white `hsl(0 0
      90%)`).
    - `--bg-base: hsl(0 0 100%);` (white background, mirrors dark's `hsl(0 0 0%)`).
    - `--accent-base: hsl(0 60% 40%);` (unchanged — brand accent stays identical across
      themes; redeclared here for override-completeness, not because its value differs).
    - `--danger-base: hsl(356 34% 38%);` (unchanged, same reasoning as `--accent-base`).
  - All 16 derived tokens listed above, each copied verbatim from `:root` (identical
    `color-mix(...)` line, unchanged token name, unchanged percentage).
- Do not touch `--font-*`, `--animation-*`, `--spacing-*`, `--border-width-*`,
  `--border-radius-*`, or `--opacity-*` tokens — none of them hold a base color value, so
  none need a light counterpart.

### Scenario
- GIVEN `[data-theme="light"]` is set on `<html>` (SPEC-011).
- WHEN any element resolves `var(--text-secondary)` (or any other derived token), THEN it
  computes from the light-scoped `--text-primary`/`--bg-base`, using the exact same
  `color-mix()` percentage as dark theme.
- GIVEN `data-theme` is absent (dark, default), WHEN the same element resolves the same
  token, THEN it still computes from `:root`'s dark base values, unchanged.

### Expected
- EXPECTED: every screen/component that already consumes `var(--token)` (never raw hex/px,
  per project convention) re-themes automatically with zero component-level edits.
- NOT EXPECTED: any new token name; any token consumer file (`.scss` outside `styles.scss`)
  edited by this spec.

### Acceptance
- MUST: `[data-theme="light"]` declares exactly the 4 base tokens (new light values for
  `--text-primary`/`--bg-base`; identical values for `--accent-base`/`--danger-base`) plus
  all 16 derived tokens, each an unchanged `color-mix()` line copied from `:root`.
- MUST NOT: any derived token's `color-mix()` percentage differ between `:root` and
  `[data-theme="light"]`.
- MUST NOT: any token renamed, removed, or added beyond what already exists in `:root`.

### Tasks
- [ ] Add the `[data-theme="light"]` block to `styles.scss` with the 4 base-token
      overrides.
- [ ] Copy all 16 derived-token `color-mix()` lines verbatim into the same block.
- [ ] Spot-check contrast of `--text-primary`/`--text-secondary`/etc. against the new
      `--bg-base` on a representative screen.

### Constraints
- DO: keep the block colocated in `styles.scss`, directly after `:root`.
- DO NOT: restructure the base/derived split, rename any token, or move any token's
  `color-mix()` formula/percentage.
- NOTE: duplicating the 16 derived tokens verbatim is technically redundant under CSS
  custom-property cascade rules (they would already recompute correctly from just the 4
  base overrides, since `var()` resolves at used-value time against the cascaded value in
  scope) — kept anyway per explicit instruction, for explicitness/robustness.

## SPEC-013 - Light Theme: Smooth Color Transition on Toggle

### Goal
- Switching themes animates every color-related property smoothly, using the existing
  `--animation-medium` token, via one narrowly-scoped rule rather than per-component edits.

### Problem
- SITUATION: there is no `--transition-medium` token in `styles.scss` — the actual token
  is `--animation-medium: var(--animation-ease-style) var(--animation-duration-medium)`
  (`styles.scss:40`, resolving to `cubic-bezier(0.16, 1, 0.3, 1) 250ms`). Colors
  (`background-color`, `color`, `border-color`, etc.) are consumed ad hoc across dozens of
  component-scoped `.scss` files; none of them declare a transition for the theme-switch
  case specifically (their existing `transition:` declarations target hover/focus
  micro-interactions via `--animation-fast`, not a theme change).
- IMPACT: without a transition, `SPEC-011`'s toggle would flip every color instantly;
  adding a `transition:` to every component individually is explicitly rejected by the
  user in favor of one scoped rule.

### Plan
- Extend the existing global reset selector `*, *::before, *::after` (`styles.scss:114-
  121`, already the app's one "applies to everything" selector) with: `transition:
  background-color var(--animation-medium), color var(--animation-medium), border-color
  var(--animation-medium), box-shadow var(--animation-medium);`.
- Rationale for choosing the universal selector over a high-level wrapper: color tokens are
  consumed by dozens of component-scoped selectors this task must not edit individually;
  only a universal selector guarantees every one of them animates on theme switch. The
  overreach is acceptable because (a) these are cheap, paint-only properties, (b) the
  transition only visibly fires during the rare theme-toggle action or an already-existing
  hover/focus state change, and (c) any selector with its own more specific `transition:
  ...` declaration (e.g. `.app-btn`, `.app-cartao`, `.form-outline .form-control`) keeps
  that faster `--animation-fast` timing for its own hover/focus micro-interactions, since a
  class selector's specificity beats the universal selector — this rule only fills the gap
  for elements with no existing transition.

### Scenario
- GIVEN the user clicks the theme toggle (SPEC-011).
- WHEN `data-theme` flips, THEN every element's `background-color`/`color`/`border-color`/
  `box-shadow` that has no more specific transition animates over `--animation-medium`
  (250ms, expo-out).
- GIVEN an element with its own hover transition (e.g. `.app-btn`), WHEN the theme toggles,
  THEN it still animates (via this new rule, since its `--animation-fast` hover transition
  targets the same properties but only fires on `:hover`, not on a token-value change) —
  its own hover/focus interactions remain governed by `--animation-fast` as before.

### Expected
- EXPECTED: a single new `transition` line, added to the existing universal reset block.
- NOT EXPECTED: any transition added to an individual component's `.scss` file.

### Acceptance
- MUST: the new transition targets `background-color`, `color`, `border-color`, and
  `box-shadow` explicitly (never `transition: all`, per project convention).
- MUST: the transition duration/easing come from `var(--animation-medium)`.
- MUST NOT: any per-component `.scss` file edited for this spec.

### Tasks
- [ ] Add the color-property `transition` to the `*, *::before, *::after` reset block in
      `styles.scss`.
- [ ] Verify existing hover/focus micro-interactions (`.app-btn`, `.app-cartao`,
      `.form-outline .form-control`, sidebar items) still use their own `--animation-fast`
      timing, unaffected by the new global rule.

### Constraints
- DO: name every property explicitly in the new `transition` declaration.
- DO NOT: use `transition: all`; do not add a transition to any file other than
  `styles.scss`.

# CONSTRAINTS
- Scope: `frontend/` only; never touch or reference `backend/`.
- Token names in `styles.scss` never change except the one explicit addition
  (`--opacity-inactive`, SPEC-006) and the one explicit new font-role token
  (`--font-family-serif`, SPEC-009) and the light-theme scope's base-token overrides
  (SPEC-012, same names, new scope) — no other token renamed, removed, or restructured.
- SPEC-002 (Title Case) is fixed per-template, never via a pipe or centralized casing
  logic — explicit user instruction.
- Sidebar scope: SPEC-007/008/009 are the only sidebar-visual changes; SPEC-010/011 replace
  the Configurações nav slot with the theme toggle in the same position.
- Follow existing conventions: tokens consumed via `var(--token)`, never raw hex/px; BEM
  `app-` prefixed classes; `transition:` declarations name explicit properties, never
  `transition: all`; MDB/SweetAlert2 theming lives in global `styles.scss`/
  `alert.service.ts`, never `::ng-deep` or per-component overrides.
- Execution order: SPEC-001..006 (independent, any order) -> SPEC-007/008/009 (independent,
  sidebar-only) -> SPEC-010 -> SPEC-011 (needs SPEC-010's freed nav slot) -> SPEC-012
  (independent of SPEC-011, but both required before light theme is usable end-to-end) ->
  SPEC-013 (needs SPEC-011/012 in place to have something to animate).

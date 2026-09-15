---
name: vercel-style-redesign
author: jhotiori
date: 2026-09-15
---

# TASK
Apply a Vercel-inspired visual redesign to the Trimly frontend: retune the typography, spacing
scale, and motion/animation-timing tokens in `src/styles.scss` and propagate the resulting
values through global selectors and colocated component SCSS. Layout, DOM structure, existing
components, existing animations' functional behavior, and existing accent colors stay exactly
as they are; only visual/token-level values change, and token *names* never change.

# GOAL
`src/styles.scss` (the project's single authoritative design-token source) expresses a
Vercel-inspired design language — confident sans-serif display type, Inter as the interface
face, a tight spacing rhythm, and snappy cubic-bezier motion — while every existing screen keeps
its current layout, markup, component boundaries, and accent palette untouched.

# SPECS

## SPEC-001 - Typography: Display Font Role (Sans-Serif Migration)

### Goal
- `--font-family-display` (currently `"Fraunces", "Georgia", serif`, used by h2-h4) resolves to
  **Geist** (Vercel's own sans-serif display face) instead, with the token name unchanged.

### Problem
- SITUATION: `--font-family-display` is a serif face; Vercel's design language uses a confident
  sans-serif for display type.
- IMPACT: headline type doesn't match the target design language until the token's value is
  migrated; leaving the fallback chain or `index.html` font `<link>` stale after the swap would
  break h2-h4 rendering.

### Plan
- Audit current `--font-family-display` consumers (h1-h6 block in `styles.scss`: h2, h3, h4).
- Swap the token *value* to `"Geist", "Inter", sans-serif` (name `--font-family-display`
  unchanged).
- Update the `index.html` font `<link>` to load Geist at the weights currently used on h2-h4
  (600/800) and drop the Fraunces request once no selector needs it.

### Scenario
- GIVEN a page renders h2-h4 headings via `var(--font-family-display)`.
- WHEN the token's value is updated to Geist.
- THEN headings render in Geist at their existing font-size/weight/letter-spacing tokens with no
  layout shift.
- AND no component-level SCSS needs editing, since every heading resolves through the token.

### Expected
- EXPECTED: a single `:root` value change in `styles.scss` updates every heading.
- NOT EXPECTED: any selector hardcodes a font-family string instead of
  `var(--font-family-display)`.

### Acceptance
- MUST: token name stays exactly `--font-family-display`.
- MUST: new value is `"Geist", "Inter", sans-serif` (or another Geist-first fallback chain with
  >=2 fallbacks).
- MUST NOT: change font-size, font-weight, letter-spacing, or line-height on h1-h6 (SPEC-004).
- MUST NOT: introduce a second display-font token.

### Tasks
- [ ] Update `--font-family-display` value to Geist in `styles.scss`.
- [ ] Update `index.html` font `<link>` to load Geist (600/800) and drop the Fraunces request.
- [ ] Visually verify h2-h4 rendering across screens.

### Constraints
- RESOLVED (2026-09-15): Display font is **Geist**. Interface stays **Inter** (SPEC-002,
  unchanged).
- DO: source Geist via the same `<link>`-based loading mechanism already used for Inter/Fraunces
  (project convention, per `frontend/CLAUDE.md`'s "Fonts ... load via `<link>` in
  `src/index.html`").

## SPEC-002 - Typography: Interface Font Verification (Inter)

### Goal
- Confirm Inter remains the interface-role font and lightly calibrate its consuming selectors'
  rhythm, without touching the token name or value.

### Problem
- SITUATION: `--font-family-interface` already resolves to `"Inter", "Segoe UI", sans-serif`
  and drives `html`, `body`, `p`, `h1`, `h5`, `h6`; `index.html` already loads Inter at weights
  300/400/600/800.
- IMPACT: the role is already correct; the risk is scope creep either changing the family
  unnecessarily or blurring the Display/Interface split established in SPEC-001.

### Plan
- Verify `index.html`'s Inter `<link>` still covers 300/400/600/800.
- Audit `h1`, `h5`, `h6`, `p`, `body` letter-spacing/line-height against Vercel's typical tight
  heading tracking and 1.5-1.6 body line-height (current values already sit close).
- Tune only literal letter-spacing/line-height numbers where they visibly diverge; no token
  value changes.

### Scenario
- GIVEN `html`, `body`, `p`, `h1`, `h5`, `h6` read `var(--font-family-interface)`.
- WHEN the audit confirms Inter is retained.
- THEN `--font-family-interface`'s value is untouched; only non-token spacing/line-height
  literals may be fine-tuned.

### Expected
- EXPECTED: `--font-family-interface` value stays exactly
  `"Inter", "Segoe UI", sans-serif`.
- NOT EXPECTED: any element moves between the interface and display roles (h1/h5/h6/p stay
  interface; h2-h4 stay display, per SPEC-001).

### Acceptance
- MUST: token name and value both unchanged.
- MUST: any tuning stays within existing `--font-size-*`/`--font-weight-*` token usage.
- MUST NOT: introduce px values outside the current rem-based scale.

### Tasks
- [ ] Verify `index.html` Inter weights cover 300/400/600/800.
- [ ] Audit interface-styled selectors against Vercel tracking targets.
- [ ] Apply value-only letter-spacing/line-height tuning if divergence is found.

### Constraints
- DO: treat this as a verification pass, not a rewrite.
- DO NOT: touch h2-h4 (display-font) selectors here.

## SPEC-003 - Typography: Third Font Role (Mono, Renamed from `--font-family-sans`)

### Goal
- Rename `--font-family-sans` to `--font-family-mono` and repoint its value to **Geist Mono**
  (Geist's own companion monospace face), satisfying the "exactly 3 font roles" requirement
  without introducing a 4th token.

### Problem
- SITUATION: `styles.scss` currently exposes three font tokens: `--font-family-display`
  (headings), `--font-family-interface` (Inter, body/UI), and `--font-family-sans`
  (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`, consumed only by
  `.form-outline .form-control` and its `.form-label`). None is a monospace/code family.
- IMPACT: `--font-family-sans` is renamed to `--font-family-mono` per explicit user decision
  (2026-09-15); this is the one authorized exception to "token names never change" (the task's
  own open-questions gate for new/renamed tokens). Every selector currently reading
  `var(--font-family-sans)` must be updated to `var(--font-family-mono)` — same selectors, same
  properties, only the token identifier changes.

### Plan
- Rename the token: `--font-family-sans` -> `--font-family-mono` in the "Famílias tipográficas"
  `:root` block.
- Set its value to `"Geist Mono", "SFMono-Regular", Consolas, monospace` — Geist Mono is the
  canonical companion mono face to SPEC-001's Geist display pick (both shipped by Vercel as one
  matched family), so no separate typeface decision is needed here.
- Grep `styles.scss` and every component SCSS file for `var(--font-family-sans)` and replace
  each occurrence with `var(--font-family-mono)` (same selectors: `.form-outline .form-control`,
  `.form-outline .form-label` — do not move them to `--font-family-interface`).
- Update the `index.html` font `<link>` to load Geist Mono at the weight(s) `.form-outline`
  currently needs (check current declared `font-weight` on those selectors).

### Scenario
- GIVEN `.form-outline .form-control` and `.form-label` read `var(--font-family-sans)`.
- WHEN the token is renamed to `--font-family-mono` and repointed to Geist Mono.
- THEN both selectors compile against `var(--font-family-mono)` and render form text in Geist
  Mono, with no other selector or property touched.

### Expected
- EXPECTED: exactly 3 font-role tokens exist afterward: `--font-family-display`,
  `--font-family-interface`, `--font-family-mono`.
- NOT EXPECTED: any remaining reference to `--font-family-sans` anywhere in `frontend/`, or a
  4th font-family token.

### Acceptance
- MUST: `--font-family-sans` no longer exists after this spec; `--font-family-mono` replaces it
  1:1 in every consuming selector.
- MUST: `--font-family-mono`'s value is a monospace stack headed by Geist Mono.
- MUST: the renamed token is documented in the "Famílias tipográficas" root comment block.
- MUST NOT: introduce a 4th font-family token.

### Tasks
- [ ] Rename `--font-family-sans` to `--font-family-mono` in `styles.scss`.
- [ ] Set its value to the Geist Mono stack.
- [ ] Grep and replace every `var(--font-family-sans)` usage with `var(--font-family-mono)`.
- [ ] Update `index.html`'s font `<link>` to load Geist Mono.

### Constraints
- RESOLVED (2026-09-15): rename `--font-family-sans` -> `--font-family-mono`; value is Geist
  Mono; existing consumers (`.form-outline`) keep referencing the token under its new name
  rather than moving to `--font-family-interface`.
- DO NOT: leave any stale `--font-family-sans` reference after this spec completes.

## SPEC-004 - Typography: Type Scale Rhythm Refinement

### Goal
- Calibrate h1-h6/`p` letter-spacing and line-height toward Vercel's dense, confident type
  rhythm, using only the existing `--font-size-*`/`--font-weight-*` tokens' consuming selectors'
  non-token properties.

### Problem
- SITUATION: h1-h6 already declare per-level letter-spacing (-0.02em to 0.02em) and line-height
  (1.1-1.6).
- IMPACT: these values were tuned for the current serif display face; SPEC-001's sans-serif
  migration changes the optical spacing a sans-serif display face needs (typically tighter
  negative tracking than serif).

### Plan
- Revisit h1-h6 and `p` letter-spacing/line-height only after SPEC-001's font is finalized.
- Keep `--font-size-*` and `--font-weight-*` token values and names untouched; adjust only the
  literal em/line-height numbers already declared per selector.

### Scenario
- GIVEN SPEC-001's display font is finalized.
- WHEN h2-h4 render in the new sans-serif face.
- THEN letter-spacing/line-height per level reads correctly at each `--font-size-*` step without
  clipping or excessive gap.

### Expected
- EXPECTED: rhythm changes are confined to the letter-spacing/line-height literals already
  present per selector.
- NOT EXPECTED: any `--font-size-*` or `--font-weight-*` token value change.

### Acceptance
- MUST: `--font-size-*` and `--font-weight-*` tokens unchanged in name and value.
- MUST NOT: alter which selector uses which token (h1 stays `--font-size-3xl`, etc.).
- MUST: sequenced after SPEC-001.

### Tasks
- [ ] Finalize SPEC-001's font choice.
- [ ] Recalibrate h1-h6/`p` letter-spacing and line-height literals.
- [ ] Visual check against Vercel reference (if user supplies any).

### Constraints
- DO: depend on SPEC-001 completion.
- DO NOT: touch `--font-size-*`/`--font-weight-*` tokens.

## SPEC-005 - Spacing Scale: Vercel Rhythm Audit

### Goal
- Confirm or refine the `--spacing-*` scale's rem values toward Vercel's tight, consistent
  4px-based rhythm, without renaming any `--spacing-*` token or changing which components
  consume which step.

### Problem
- SITUATION: `--spacing-xs` through `--spacing-3xl` = 0.125/0.25/0.5/0.75/1/1.5/2rem
  (2/4/8/12/16/24/32px) — already a near-4px-multiple scale.
- IMPACT: broadly Vercel-compatible already; `--spacing-xs` at 2px is the sole off-grid step
  (used for icon-row gaps like `.app-cartao__cabecalho`). Adjusting it, or adding new steps,
  risks unflagged scope creep.

### Plan
- Audit each `--spacing-*` value against a strict 4px (0.25rem) grid.
- Move `--spacing-xs` from `0.125rem` (2px) to `0.25rem` (4px) so the full scale sits on the
  4px grid.
- Leave all other steps as-is; do not add new steps (e.g. a `4xl`) unless SPEC-007's
  application pass surfaces a concrete need, and flag that separately before adding it.

### Scenario
- GIVEN `--spacing-xs` was the only sub-4px step (2px).
- WHEN its value is updated to `0.25rem`.
- THEN every consumer of `var(--spacing-xs)` (icon-row gaps like `.app-cartao__cabecalho`, and
  the `:focus-visible` `outline-offset` per SPEC-008) reflects the new 4px value with no other
  token touched.

### Expected
- EXPECTED: all seven existing `--spacing-*` token names remain exactly as-is; only `xs`'s value
  changes.
- NOT EXPECTED: a new spacing step introduced without flagging it first.

### Acceptance
- MUST: token names `--spacing-xs` through `--spacing-3xl` unchanged.
- MUST: `--spacing-xs`'s value becomes `0.25rem`.
- MUST NOT: add `--spacing-4xl` or any new step without a separate flagged confirmation.

### Tasks
- [ ] Update `--spacing-xs` from `0.125rem` to `0.25rem` in `styles.scss`.
- [ ] Re-check every `var(--spacing-xs)` consumer (icon-row gaps, focus-ring offset) for the
      resulting 2px-larger gap/offset.

### Constraints
- RESOLVED (2026-09-15): `--spacing-xs` moves to `0.25rem`, sitting on the 4px grid.
- DO NOT: introduce new spacing tokens without a separate confirmation.

## SPEC-006 - Motion & Animation Timing: Easing & Duration Refinement

### Goal
- Refine the animation vocabulary's easing curve and duration values toward Vercel's snappy,
  cubic-bezier-driven motion, preserving every existing animation's functional behavior
  (trigger, animated property, reduced-motion fallback).

### Problem
- SITUATION: `--animation-ease-style` is a single global `ease-out` keyword shared by all four
  durations (60/120/250/400ms); every transition/animation in `styles.scss`
  (`.form-outline` underline, `.app-btn`, `.app-tela__criar`, `.app-busca`, `.app-cartao` hover,
  `.app-grade` fade-in, `.app-cartao__acao`) composes duration+ease via `--animation-instant`
  through `--animation-slow`.
- IMPACT: Vercel's interface motion typically uses a custom `cubic-bezier()` rather than the
  `ease-out` keyword for a snappier feel; swapping it is low-risk since every consumer already
  references the composed `--animation-*` properties instead of hardcoding easing.

### Plan
- Replace `--animation-ease-style`'s keyword value with `cubic-bezier(0.16, 1, 0.3, 1)` (a
  snappy ease-out-expo curve: fast start, strong deceleration into the resting state).
- Introduce differentiated in/out curves only if a concrete need surfaces during SPEC-007, and
  flag that as a separate open question before adding a token.
- Keep the four duration values (60/120/250/400ms) unless a specific interaction, audited in
  SPEC-007, proves too slow/fast against Vercel's typical ~100-200ms micro-interaction range.
- Leave the `prefers-reduced-motion` overrides untouched.

### Scenario
- GIVEN every transition/animation already composes `var(--animation-fast)` etc.
- WHEN `--animation-ease-style`'s value changes.
- THEN all consuming selectors' motion curve updates uniformly with zero edits outside
  `styles.scss`'s `:root`.
- AND the `app-surgir` fade-in keyframes and `.app-cartao` hover scale keep identical trigger
  conditions and reduced-motion opt-out.

### Expected
- EXPECTED: one token-value change propagates the new easing everywhere.
- NOT EXPECTED: any animation gains/loses a trigger, a new keyframe, or a changed animated
  property as part of this spec.

### Acceptance
- MUST: `--animation-ease-style`, `--animation-duration-*`, and
  `--animation-instant`/`fast`/`medium`/`slow` token names unchanged.
- MUST: `@media (prefers-reduced-motion: reduce)` block behavior unchanged.
- MUST NOT: add a second easing token without a separate flagged decision.
- MUST NOT: change which CSS property any transition/animation targets.

### Tasks
- [ ] Update `--animation-ease-style` to `cubic-bezier(0.16, 1, 0.3, 1)` in `styles.scss`.
- [ ] Verify duration values against Vercel's typical range; adjust only if justified.
- [ ] Regression-check every consumer listed above.

### Constraints
- RESOLVED (2026-09-15): `--animation-ease-style` value is `cubic-bezier(0.16, 1, 0.3, 1)`.
- DO NOT: introduce a second `--animation-ease-*` token without a separate flagged decision.

## SPEC-007 - Apply Refined Tokens Across Component SCSS

### Goal
- Propagate the confirmed token-value changes from SPEC-001 through SPEC-006 across every
  consuming selector in `styles.scss` and colocated component SCSS, with zero DOM/layout/
  structural edits.

### Problem
- SITUATION: tokens are consumed both globally in `styles.scss` (h1-h6, `.app-*` utility
  classes, `.modal-content`, `.form-outline`, `.app-alert*`) and in component-scoped SCSS (e.g.
  `app.component.scss`, `dashboard.component.scss`, `configuracoes.component.scss`) per the
  project's colocated-SCSS convention.
- IMPACT: a token value change auto-propagates to any selector already using `var(--token)`;
  any selector found hardcoding a raw literal instead of a token must be flagged, not silently
  rewritten beyond this redesign's scope.

### Plan
- After SPEC-001/002/003/004/005/006 values are confirmed, apply them in `styles.scss`.
- Re-render and visually verify every screen (Dashboard, Agendamentos, Serviços,
  Configuracoes) for regressions.
- Grep component SCSS for hardcoded font-family/spacing/duration/easing literals bypassing
  tokens; flag any found rather than silently converting them if doing so would touch selectors
  beyond this redesign's scope.
- Leave `features/configuracoes` as-is per its documented exemption from the shared `.app-*`
  vocabulary, unless it independently references one of the changed tokens.

### Scenario
- GIVEN all six token specs are confirmed and applied in `styles.scss`.
- WHEN every screen renders.
- THEN headings, buttons, cards, search bars, and modals reflect the new type/spacing/motion
  values with identical layout, DOM structure, and accent colors to before.

### Expected
- EXPECTED: the visual diff is confined to font-family, letter-spacing/line-height, spacing
  values, and motion curves.
- NOT EXPECTED: any change to component template HTML, class names, grid structure, or accent
  tokens (`--accent-base`/`-surface`/`-elevated`/`-hover`).

### Acceptance
- MUST: no `.html` or `.ts` file is touched.
- MUST: `--accent-*` token values stay byte-identical.
- MUST: `bun run check` (Biome) passes on every touched `.scss` file.
- MUST NOT: any new BEM class or selector introduced.

### Tasks
- [ ] Apply confirmed SPEC-001..006 values in `styles.scss`.
- [ ] Grep component SCSS for non-token literals colliding with the changed properties.
- [ ] Visually verify Dashboard, Agendamentos, Serviços, Configuracoes, and modals/alerts.
- [ ] Run `bun run check` on touched files.

### Constraints
- DO: touch only `.scss` files.
- DO NOT: modify `.html` templates, `.ts` component classes, or any `--accent-*`/`--bg-*`/
  `--text-*`/`--border-*`/`--danger-*` color token.

## SPEC-008 - Non-Regression & Accessibility Verification

### Goal
- Verify the redesign meets a Vercel-caliber design-quality bar (contrast, motion
  accessibility, focus visibility) without regressing existing behavior.

### Problem
- SITUATION: the app already implements a `:focus-visible` outline, `prefers-reduced-motion`
  overrides, and `color-mix()`-derived text/background contrast.
- IMPACT: token-value changes (new display font, new easing, spacing tweaks) can unintentionally
  reduce heading legibility, break the focus ring's offset math (tied to `--spacing-xs`), or
  desync the reduced-motion fallback if durations/easing change without re-checking it.

### Plan
- Re-check `:focus-visible`'s `outline-offset` (`var(--spacing-xs)`) against any SPEC-005
  spacing-xs change.
- Re-check heading/body contrast against `--bg-base` with the new display font's weight/x-height.
- Confirm `@media (prefers-reduced-motion: reduce)` still fully disables `.app-grade`'s
  animation and `.app-cartao`'s hover transform regardless of the new easing/duration values.
- Confirm no animation's functional trigger (hover, focus-within, mount) changed.

### Scenario
- GIVEN `prefers-reduced-motion` is enabled, WHEN a user loads any screen, THEN `.app-grade`
  shows no fade-in and `.app-cartao` shows no hover scale, identical to pre-redesign behavior.
- GIVEN a keyboard user tabs to a focusable element, WHEN focus lands, THEN the
  `:focus-visible` ring renders with the correct offset and radius using current-value tokens.

### Expected
- EXPECTED: heading/body contrast against `--bg-base` stays at or above pre-redesign levels.
- NOT EXPECTED: any new motion introduced outside the existing four animation/transition
  declarations already in `styles.scss`.

### Acceptance
- MUST: reduced-motion behavior unchanged.
- MUST: focus-visible ring unchanged in trigger and behavior.
- MUST NOT: any accent, background, text, border, or danger color token value change (out of
  this redesign's scope).
- MUST: sign-off checklist covers every screen listed in SPEC-007.

### Tasks
- [ ] Verify focus-visible offset/radius after any spacing change.
- [ ] Verify the reduced-motion block still neutralizes fade/hover-scale.
- [ ] Spot-check contrast on the new display font weight.
- [ ] Final review against the Vercel-style bar (density, restraint, snappy motion, confident
      type).

### Constraints
- DO: run this pass only after SPEC-007 is complete.
- DO NOT: expand scope to color-token changes even if contrast could be marginally improved —
  flag any contrast concern as a new open question instead of silently adjusting
  `--text-*`/`--bg-*` tokens.

# CONSTRAINTS
- Scope: `frontend/` only; never touch or reference `backend/`.
- Scope: `spacing scale, motion/animation timing, typography` only — no layout, no DOM/
  structural elements, no new components, no new shell/wrapper elements.
- Preserve exactly: current layout, existing elements, existing components, existing
  animations' functional behavior (trigger/property/reduced-motion fallback), existing accent
  colors (`--accent-*`).
- Token names in `styles.scss` never change, with one explicit exception confirmed by the user
  on 2026-09-15: `--font-family-sans` is renamed to `--font-family-mono` (SPEC-003). No other
  token is renamed, added, or removed.
- Follow existing conventions: SCSS colocated/scoped per component, tokens consumed via
  `var(--token)` never raw hex/px, BEM `app-` prefixed classes, `transition:` names explicit
  properties (never `transition: all`).
- Execution order: SPEC-001 -> SPEC-002/003 (parallel) -> SPEC-004 -> SPEC-005/006 (parallel) ->
  SPEC-007 -> SPEC-008.

## Resolved Decisions (2026-09-15)
- SPEC-001: Display font is **Geist** (`--font-family-display` value).
- SPEC-002: Interface font stays **Inter** (`--font-family-interface`, unchanged).
- SPEC-003: `--font-family-sans` renamed to `--font-family-mono`, value **Geist Mono**;
  `.form-outline` selectors keep referencing the token under its new name.
- SPEC-005: `--spacing-xs` moves from `0.125rem` to `0.25rem` (onto the 4px grid).
- SPEC-006: `--animation-ease-style` value is `cubic-bezier(0.16, 1, 0.3, 1)`.

No open questions remain; this spec is implementation-ready.

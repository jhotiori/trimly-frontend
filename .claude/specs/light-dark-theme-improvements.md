---
name: light-dark-theme-improvements
author: jhotiori
date: 2026-09-16
---

# TASK
Six theme-system fixes on `trimly/frontend`: the sidebar brand mark (icon color +
logotype weight) not responding correctly to the theme toggle; light theme's base
background sitting at pure white; every button styled with an accent-colored background
losing text contrast in light theme (SweetAlert2's confirm button and every other
accent-background button app-wide); the dashboard/sidebar depth gradient reading as flat
in light theme; `.app-cartao`'s hover shadow reading as invisible in dark theme; and
removing the sidebar nav item's hover bold-weight effect (and its transition) entirely.

# GOAL
The sidebar brand mark, every accent-background button, the dashboard/sidebar gradient,
and the card hover shadow all read correctly and with proper contrast in both
`[data-theme="light"]` and the default dark theme, using only the existing
base/derived-token architecture (`styles.scss`); the sidebar nav item hover no longer
changes `font-weight`.

# PLAN
Fix the sidebar's inline-`<img>` logo (swap to an inline, `currentColor`-driven SVG) and
its unavailable font-weight; lighten light theme's `--bg-base` off pure white; add one new
theme-invariant `--text-on-accent` token and apply it everywhere an accent color is used as
a button background; give `.app-dashboard-layout`/`.app-sidebar`'s gradients a light-theme
override with a stronger stop, mirroring the existing `.app-cartao:hover` light-theme
shadow override; swap `.app-cartao:hover`'s default shadow source from `--bg-base` to
`--text-primary`; strip the sidebar hover bold-weight rule and its transition.

# SPECS

## SPEC-001 - Sidebar Brand Mark: Theme-Responsive Icon Color, Reliable Bold Logotype

### Goal
- The sidebar's scissor icon changes color with the theme toggle, same as the "Trimly"
  text beside it; the "Trimly" logotype renders at an actually-available bold weight in
  every theme, light theme included.

### Problem
- SITUATION: `sidebar.component.html:3` renders the icon as `<img alt="" class="app-sidebar__simbolo" src="/icons/scissor.svg" />`. `public/icons/scissor.svg` hardcodes `fill="#E6E6E6"` on every one of its 14 `<path>` elements. An externally-referenced SVG loaded via `<img>` renders in an isolated context: it never inherits the host page's CSS `color`, so no `currentColor`/CSS-variable value can reach it regardless of theme. `.app-sidebar__logotipo` (`sidebar.component.scss:52-59`) already uses `color: var(--text-primary)` and does change correctly with the theme.
- IMPACT: the icon stays the fixed gray `#E6E6E6` in both themes while the adjacent text correctly recolors, so the two halves of the brand mark visibly desync on toggle.
- SITUATION: `.app-sidebar__logotipo` sets `font-weight: var(--font-weight-bold)`, which resolves to `800` (`styles.scss:19`). `index.html:13`'s Google Fonts `<link>` requests Playfair Display only at `wght@600;700` — no `800` face is ever loaded for that family.
- IMPACT: the logotype can never render the weight the rule asks for; it's confined to whatever weight `700` (or `600`, if the browser fails to select `700`) produces, an unreliable, unspecified fallback rather than a deliberately chosen bold cut, in every theme.

### Expected
- EXPECTED: `.app-sidebar__simbolo`'s icon recolors immediately when `themeService.toggle()` fires, tracking `var(--text-primary)` the same way the logotype text already does.
- EXPECTED: `.app-sidebar__logotipo` renders at Playfair Display's heaviest loaded static cut (`700`) in both themes, including light theme.
- NOT EXPECTED: any change to `.app-sidebar__simbolo`'s `width`/`height` (`var(--font-size-lg)`, `sidebar.component.scss:46-50`) or to the icon's visual shape/paths.
- NOT EXPECTED: a new font weight added to `index.html`'s Playfair Display request.

### Acceptance
- MUST: `sidebar.component.html` renders the scissor mark as an inline `<svg>` (not an `<img src="...">`), with every path's `fill` set to `currentColor`.
- MUST: `.app-sidebar__simbolo` declares `color: var(--text-primary)` so the inline SVG's `currentColor` resolves through the existing theme token.
- MUST: `.app-sidebar__logotipo`'s `font-weight` is the literal `700`, not `var(--font-weight-bold)`.
- MUST NOT: `index.html`'s Google Fonts `<link>` request an `800` weight for Playfair Display.
- MUST NOT: `--font-weight-bold`'s value or any of its other consumers change.

### Constraints
- DO: keep the inlined SVG's `viewBox="0 0 36 36"` and path geometry byte-for-byte identical to `public/icons/scissor.svg`; only the `fill` attributes change.
- DO NOT: delete `public/icons/scissor.svg` from `public/icons/` unless confirmed unused elsewhere.

## SPEC-002 - Light Theme: Off-White Base Background

### Goal
- Light theme's base surface is a very light off-white, not pure white.

### Problem
- SITUATION: `styles.scss:134`, inside `[data-theme="light"]`, declares `--bg-base: hsl(0 0 100%)` (pure white). Every other `--bg-*` token in that scope (`--bg-hover`, `--bg-highlight`, `--bg-subtle`, `--bg-surface`, `--bg-elevated`, lines 135-140) is a `color-mix()` derived from this one base value, per the project's base/derived token architecture (`frontend/CLAUDE.md`, "Themes").
- IMPACT: every light-theme surface ultimately traces back to a literal pure white.

### Expected
- EXPECTED: `[data-theme="light"]`'s `--bg-base` resolves to `hsl(0 0 90%)` — mirroring the exact lightness (and same no-`%`-on-saturation formatting) already used by dark theme's `--text-primary: hsl(0 0 90%)` (`styles.scss:46`), i.e. roughly `rgb(230, 230, 230)`.
- EXPECTED: all 5 derived `--bg-*` tokens in `[data-theme="light"]` recompute automatically from the new base value, with zero edit to their own `color-mix()` lines.
- NOT EXPECTED: any new token; any change to `--text-primary`, `--accent-base`, or `--danger-base` in either theme scope.

### Acceptance
- MUST: `[data-theme="light"] --bg-base` reads `hsl(0 0 90%)`.
- MUST NOT: any `color-mix()` formula/percentage on `--bg-hover`/`--bg-highlight`/`--bg-subtle`/`--bg-surface`/`--bg-elevated` change.
- MUST NOT: the dark-theme (`:root`) `--bg-base` value change.

### Constraints
- DO: edit only the single `hsl()` literal on `[data-theme="light"] --bg-base` (`styles.scss:134`).
- DO NOT: touch `ThemeService`'s `COR_BARRA.light` mobile browser-bar color (`theme.service.ts:16`) as part of this spec — out of scope.

## SPEC-003 - Accent-Background Buttons: Contrasting Text Token

### Goal
- Every button whose background is an accent color renders its label with a token that
  contrasts against that background in both themes, SweetAlert2's confirm button included.

### Problem
- SITUATION: `--accent-base`/`--accent-surface`/`--accent-elevated`/`--accent-hover` are declared with the identical literal `hsl(0 60% 40%)` base in both `:root` (lines 54-57) and `[data-theme="light"]` (lines 123-126) — the accent ladder never changes between themes. Every button that uses one of these as its background pairs it with `color: var(--text-primary)`: `.app-tela__criar` (`styles.scss:538,540`), `.app-auth__enviar` (`login-form.component.scss:17-18`, `registrar-form.component.scss:17-18`), `.app-agendamento-form__acao--principal` (`agendamento-form.component.scss:114-115`), `.app-disponibilidade-form__acao--principal` (`disponibilidade-form.component.scss:109-110`), `.app-servico-form__acao--principal` (`servico-form.component.scss:105-106`). `--text-primary` is near-white in dark theme (`hsl(0 0 90%)`) but near-black in light theme (`hsl(0 0 10%)`, `styles.scss:115`), so it flips while the accent background it sits on does not.
- IMPACT: in light theme, all of the above buttons render near-black text on a still-dark accent background — the same low-contrast pairing the user flagged on the SweetAlert2 confirm button, occurring on every accent-background button app-wide.
- SITUATION (SweetAlert2 specifically): `alert.service.ts:13-24`'s `swalTema` sets `confirmButtonColor: "var(--accent-hover)"` but declares no button `color` at all; `customClass.confirmButton`/`customClass.cancelButton` both map to the same `.app-alert__botao` (`styles.scss:391-395`), which itself declares no `color`. SweetAlert2's own default styling sets `.swal2-confirm`'s text color via `:where(.swal2-confirm) { color: var(--swal2-confirm-button-color) }` (`node_modules/sweetalert2/dist/sweetalert2.css:337-342`) — a `:where()`-wrapped selector, specificity `(0,0,0)`. The project's global reset `button, input, select, textarea { color: inherit; }` (`styles.scss:235-241`, specificity `(0,0,1)`) beats it, so the confirm button's actual rendered color is inherited from its ancestor `.swal2-popup`, which carries `color: var(--text-primary)` as an inline style via `swalTema`'s `color: "var(--text-primary)"` option.
- IMPACT: the confirm button ends up textPrimary-colored on an accent-hover background for the exact same base-token-flip reason as every other accent-background button above.

### Expected
- EXPECTED: a new token `--text-on-accent`, declared once in `:root`'s "Acento" block only (not re-declared in `[data-theme="light"]`, since the accent ladder it contrasts against is itself theme-invariant), valued `hsl(0 0 90%)` — the same near-white already proven to contrast correctly against these exact accent tokens in dark theme today.
- EXPECTED: every selector listed under Problem's first SITUATION reads `color: var(--text-on-accent)` instead of `color: var(--text-primary)`.
- EXPECTED: a new rule `.app-alert__botao.swal2-confirm { color: var(--text-on-accent); }` in `styles.scss`, using SweetAlert2's own always-present `.swal2-confirm` class (verified in `sweetalert2.css`) to target only the confirm button.
- NOT EXPECTED: the SweetAlert2 cancel button (`.swal2-cancel`, background `--danger-hover`) or `.app-cartao__acao--perigo` affected — out of scope, background isn't an accent color.
- NOT EXPECTED: `--accent-base`/`--accent-surface`/`--accent-elevated`/`--accent-hover`'s values changed in either theme.

### Acceptance
- MUST: `--text-on-accent: hsl(0 0 90%);` exists in `:root` only.
- MUST: all 6 listed component selectors (`.app-tela__criar`, both `.app-auth__enviar` rules, `.app-agendamento-form__acao--principal`, `.app-disponibilidade-form__acao--principal`, `.app-servico-form__acao--principal`) use `var(--text-on-accent)` for `color`.
- MUST: `.app-alert__botao.swal2-confirm` declares `color: var(--text-on-accent)`.
- MUST NOT: `AlertService`'s `confirm`/`error` method signatures or `swalTema`'s `background`/`confirmButtonColor`/`cancelButtonColor` change.
- MUST NOT: `.swal2-cancel`/`.app-alert__botao`'s base rule gain a `color` declaration from this spec.

### Constraints
- DO: place `--text-on-accent` beside the other `--accent-*` tokens in `:root`, same naming/comment style.
- DO NOT: introduce a shared class/mixin beyond the token itself — each consumer keeps its own selector, only the `color` value changes.

## SPEC-004 - Light Theme: Visible Dashboard/Sidebar Gradient

### Goal
- The dashboard shell and sidebar's depth gradients read as a visible, gentle band in
  light theme, not as flat.

### Problem
- SITUATION: `.app-dashboard-layout`'s `background: linear-gradient(var(--bg-base), var(--bg-surface))` (`dashboard-layout.component.scss:12`) and `.app-sidebar`'s `background: linear-gradient(90deg, var(--bg-surface), transparent)` (`sidebar.component.scss:26`) both reuse `--bg-base`/`--bg-surface` unchanged in every theme; `--bg-surface` is always an 8% `color-mix()` step off `--bg-base` (`styles.scss:70,139`). In dark theme this 8% step moves away from a pure-black floor (`hsl(0 0 0%)`) and reads clearly. In light theme, after SPEC-002, the same 8% step sits inside a narrow near-white band (`--bg-base` at `hsl(0 0 90%)` down to `--bg-surface` at roughly `hsl(0 0 83%)`) — the identical relative step reads far fainter near the light end of the scale.
- IMPACT: both gradients are present in the CSS and technically computed in light theme, but the visual band is weak enough to read as flat, unlike dark theme.

### Expected
- EXPECTED: `[data-theme="light"]` overrides both gradients to use `--bg-elevated` (`color-mix()` at 11%, already the next step up from `--bg-surface` in the same derived ladder, `styles.scss:140`) as their lighter/mid stop instead of `--bg-surface`, giving the light-theme gradient a visibly stronger band while staying entirely inside the existing token ladder — mirroring the precedent already set by `[data-theme="light"] .app-cartao:hover`'s box-shadow override (`styles.scss:695-697`), which swaps to a different, stronger-contrast existing token rather than reusing the dark-theme value as-is.
- NOT EXPECTED: a new `--bg-*`/gradient-specific token; any change to the dark-theme (`:root`-scoped) gradient definitions.

### Acceptance
- MUST: a `[data-theme="light"] .app-dashboard-layout` rule overrides `background` to `linear-gradient(var(--bg-base), var(--bg-elevated))`.
- MUST: a `[data-theme="light"] .app-sidebar` rule overrides `background` to `linear-gradient(90deg, var(--bg-elevated), transparent)`.
- MUST NOT: `.app-dashboard-layout`/`.app-sidebar`'s default (dark-theme) `background` declarations change.
- MUST NOT: any new token introduced; only `--bg-base`/`--bg-surface`/`--bg-elevated` (all pre-existing) are referenced.

### Constraints
- DO: place both overrides in their respective component `.scss` files (`dashboard-layout.component.scss`, `sidebar.component.scss`), each scoped under `[data-theme="light"]`.
- DO NOT: add a `prefers-color-scheme` branch — theme selection stays solely driven by `ThemeService`'s `data-theme` attribute.

## SPEC-005 - Dark Theme: Visible Card Hover Shadow

### Goal
- `.app-cartao`'s hover shadow reads as a visible glow in dark theme, matching how it
  already reads as a visible shadow in light theme.

### Problem
- SITUATION: `.app-cartao:hover`'s default box-shadow (`styles.scss:689`) is `color-mix(in srgb, var(--bg-base), transparent 70%)`. In dark theme `--bg-base` is pure black (`hsl(0 0 0%)`), the same tone as the page's own near-black gradient background (`SPEC-004`/`dashboard-layout.component.scss:12`) the card sits on, so a 30%-opacity black shadow is indistinguishable from the surface behind it. The existing `[data-theme="light"] .app-cartao:hover` override (`styles.scss:695-697`) already avoids this exact trap, per its own code comment ("no tema claro a sombra vem do texto: a do fundo seria branca sobre branco, ou seja, nenhuma") — it sources its color from `--text-primary` instead of `--bg-base`, and that override was never mirrored back into the default (dark-theme) rule.
- IMPACT: the card hover shadow is effectively invisible in dark theme (the app's default theme) while working correctly in light theme.

### Expected
- EXPECTED: the default `.app-cartao:hover` box-shadow sources its color from `var(--text-primary)` instead of `var(--bg-base)`, keeping the existing `70%` transparency: `color-mix(in srgb, var(--text-primary), transparent 70%)`. In dark theme `--text-primary` is near-white, producing a visible light glow against the dark card/page — the same technique the light-theme override already uses, mirrored.
- NOT EXPECTED: any change to the `[data-theme="light"] .app-cartao:hover` override (`styles.scss:695-697`), already correct.

### Acceptance
- MUST: `styles.scss:689`'s `box-shadow` reads `color-mix(in srgb, var(--text-primary), transparent 70%)`.
- MUST NOT: the `70%` transparency value, the shadow's offset/blur (`0 var(--spacing-xs) var(--spacing-lg)`), or the light-theme override change.
- MUST NOT: `--bg-base`'s value or any other consumer of it change.

### Constraints
- DO: keep the edit to the single `color-mix()` source token on `styles.scss:689`.

## SPEC-006 - Sidebar: Remove Hover Bold-Weight Effect

### Goal
- Sidebar nav item labels no longer change `font-weight` on hover.

### Problem
- SITUATION: `.app-sidebar__item:hover .app-sidebar__rotulo` (`sidebar.component.scss:119-122`) sets `font-weight: var(--font-weight-bold)` plus a synthetic-bold `text-shadow: 0 0 0.02em currentColor, 0 0 0.02em currentColor`; the base `.app-sidebar__rotulo` rule (`sidebar.component.scss:126-131`) carries `transition: text-shadow var(--animation-fast)` solely to animate that synthetic-bold effect on hover in/out.
- IMPACT: hovering any nav item currently thickens its label; this is the behavior to remove, transition included.

### Expected
- EXPECTED: `.app-sidebar__item:hover .app-sidebar__rotulo`'s `font-weight`/`text-shadow` declarations are removed entirely; the base `.app-sidebar__rotulo` rule loses its `transition: text-shadow ...` declaration.
- EXPECTED: `.app-sidebar__rotulo` stays at its static `font-weight: var(--font-weight-semibold)` in every state (rest, hover, active).
- NOT EXPECTED: any other hover feedback on `.app-sidebar__item` (`background-color`, `border-left-color`, `color`, icon `transform: scale(1.1)`) touched.

### Acceptance
- MUST: `.app-sidebar__item:hover .app-sidebar__rotulo` no longer exists as a nested rule (or exists only if another, unrelated hover property still needs it — none does today, so the block is removed).
- MUST: `.app-sidebar__rotulo`'s base rule no longer declares any `transition`.
- MUST NOT: `.app-sidebar__rotulo`'s `font-weight: var(--font-weight-semibold)` (base) change.

### Constraints
- DO: scope this removal to `sidebar.component.scss` only.
- DO NOT: touch `.app-sidebar__logotipo`'s font-weight (`SPEC-001`) — different selector, different fix.

# CONSTRAINTS
- Scope: `frontend/` only.
- Tokens consumed via `var(--token)`, never raw hex/px, per existing convention — the one exception is `ThemeService`'s `COR_BARRA` map (`theme.service.ts:13-16`), already hex, untouched by this file.
- Only one new token is introduced app-wide: `--text-on-accent` (SPEC-003). No other token is renamed, removed, or restructured.
- Execution order: SPEC-001, SPEC-005, SPEC-006 are independent and may run in any order; SPEC-002 should land before SPEC-004, since SPEC-004's chosen override token values assume SPEC-002's `--bg-base` is already `hsl(0 0 90%)`; SPEC-003 is independent of the others.
- Follow existing conventions: BEM `app-` prefixed classes; `transition:` declarations name explicit properties, never `transition: all`; MDB/SweetAlert2 theming lives in global `styles.scss`/`alert.service.ts`, never `::ng-deep` or per-component overrides.

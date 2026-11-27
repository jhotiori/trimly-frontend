---
paths:
  - "src/**/*.scss"
  - "src/**/*.html"
  - "src/app/infra/services/theme.service.ts"
---

# Styling

## Markup

- Use semantic tags over `div`/`span` wherever one fits (`main`, `section`, `article`, `header`, `nav`, `aside`,
  `search`, `dl`). Each page has one `<main>` and one `<h1>`; modal titles are `<h2>`.
- `aria-*` and `role` ONLY when native semantics fall short: icon-only buttons (`aria-label`), decorative icons
  (`aria-hidden="true"`), toggles (`aria-expanded`), dynamic form errors (`role="alert"`), active links
  (`ariaCurrentWhenActive="page"`).
- Changing a tag MUST come with a component SCSS update that keeps the previous look (global `h1`-`h6` rules in
  `styles.scss` differ per level).

## Design system

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

The Agendamentos, Serviços, Disponibilidades, Recessos and Dashboard screens share one vocabulary, defined once in
`styles.scss` because every screen repeats it: `.app-tela` (page column, header, toolbar
and the accent create button), `.app-busca` (search field), `.app-grade` (4/3/2-column
card grid with a single `--animation-medium` fade-in on mount), `.app-cartao`
(`--border-radius-lg` card, icon-labelled `<dl>` fields, round actions) and `.app-vazio`
(empty state). Items and lists compose these classes instead of restyling cards per
component; component SCSS keeps only what is truly local (the agendamento client menu).
A card whose title must not grow the row (feriados) wraps the name in `.app-cartao__nome` (one line, ellipsis) so every card in a grid row keeps the same height; never un-stretch the grid to fix a tall card. An already-ended item (a past recesso) adds `.app-cartao--encerrado`, which drops its title to `--text-muted`.
A micro-interaction gets an SCSS comment only when its reason is not obvious from the code. Hover and press
read the `--scale-hover` (card), `--lift-hover` (card and accent buttons, `translateY`) and `--scale-press`
(buttons, `:active:not(:disabled)`) tokens; `prefers-reduced-motion` neutralizes all three on `:root` and drops
the grid fade, so a component needs its own reduced-motion rule only for motion outside those tokens (the auth
card entrance and mode-switch blur).

Design conventions:
- Inactive look: at rest, controls sit one step down (text `--text-tertiary`/`--text-secondary`, icons
  `--text-faint`) and light up to `--text-primary` on hover, focus or active. Every `.app-cartao` rests at
  `--opacity-inactive` and lights to full opacity on hover or focus; while one auth field is hovered or focused,
  its siblings drop to `--opacity-inactive`.
- Icons over labels: a Tabler icon replaces a written prefix where it reads clearly (card `<dl>` fields, the
  trailing `.app-campo__icone` in MDB fields, icon-led buttons); the text label stays for accessibility.
- Clean hierarchy: size, weight and tone carry it; no decoration that does not mark a state.
- Motion: subtle and smooth, on the `--animation-*` expo-out curve; entrances use `@starting-style`
  (opacity, a few px of `translate`, at most a light `blur`), never bounce or long travel.

The global reset zeroes every border, and a border only marks focus (the full perimeter border
of `.app-busca` and the MDB `.form-outline` fields) or a hovered card (`--border-width-xs` in `--border-base`),
kept transparent at rest so nothing shifts. Hover shifts the background one tone step, and a card also lifts by
`--lift-hover`/`--scale-hover` and swaps to `--shadow-raised`. Surfaces separate by tone, never by a frame,
including the `.app-sidebar` panel (flat `--bg-subtle`, right corners `--border-radius-xl`, `position: sticky`
so it stays put while the page scrolls). A sidebar item hovers to `--bg-surface`; the active route inverts to an
`--accent-hover` fill with `--bg-base` text and icon, never a side bar. The dashboard shell ends in a
`.app-rodape` footer (`--bg-surface`, `--text-muted`, tall padding, a two-layer upward shadow in its own `--bg-surface` color that blends it into the page). Its GitHub links are faint (`--text-faint`) compact pills with a `currentColor` border, a trailing `ti-external-link` icon and a `--bg-hover` fill on hover or focus. Two elevations, both offset and softly blurred, never a halo: `--shadow-soft` gives
slight contrast at rest (cards, accent buttons, the active sidebar item, focused fields and search);
`--shadow-raised` is for what floats or sits under the cursor (card and accent-button hover, the MDB modal, the
auth card, the agendamento client menu).

- Fonts load via one `<link>` in `src/index.html`, requesting only the weights in use:
  Geist 300/400/600/700/800 (both `--font-family-display` and `--font-family-interface`; 700 is
  `.app-logotipo`, the uppercase, `0.24em`-tracked "Trimly" wordmark shared by the sidebar and the auth card,
  standing in for the original Lemon Milk) and Geist Mono 400 (`--font-family-mono`, the MDB `.form-outline`
  fields). Add a weight to the `<link>` before using it in SCSS.

## Themes

Dark is the default and writes nothing to the DOM (`--bg-base` `#0a0a0a`, `--text-primary`
`#ededed`). Light is a scope, `[data-theme="light"]` on `<html>` (the same element as `:root`),
that re-declares only `--text-primary` (`#171717`), `--bg-base` (`#fff`) and `--shadow-raised`;
every other color is a `color-mix()` derived from those, so the whole palette recomputes with no
component-level edit and no repeated formula. The background ladder climbs in even 3.5% steps (`subtle`,
`surface`, `elevated`, `hover`, `highlight`) and the text ladder in 12% steps (`secondary`, `tertiary`, `muted`
at 36%), so a hover is always exactly one step up. `--text-muted` is the lightest step for text
(placeholders, empty states); `--text-faint` is for icons only. A new color belongs in that
ladder, never as a literal inside a component.

`ThemeService` (`app/infra/services/theme.service.ts`) is the single owner of the theme: a
signal, the `localStorage` key `trimly-theme`, the `data-theme` attribute and the
`<meta name="theme-color">` content. `app.config.ts` instantiates it through
`provideAppInitializer` so the persisted theme lands before the first paint on every route,
including login, which renders no sidebar. The only control is the sidebar's "Tema" entry.
The universal reset carries the `--animation-medium` transition for `background-color`,
`color`, `border-color` and `box-shadow`, which is what makes the switch fade instead of
snap; component rules that declare their own `transition` keep their `--animation-fast`
hover timing.

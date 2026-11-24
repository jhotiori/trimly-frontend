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

## Themes

Dark is the default and writes nothing to the DOM. Light is a scope, `[data-theme="light"]`
on `<html>`, that re-declares only the four base tokens `--text-primary`, `--bg-base`,
`--accent-base` and `--danger-base`; every other color is a `color-mix()` derived from those,
so the whole palette recomputes with no component-level edit. A new color belongs in that
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

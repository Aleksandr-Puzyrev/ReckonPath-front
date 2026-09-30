# Design index

HTML export of the Reckon Path design made in claude.ai/design. Each `*.dc.html` file contains frames (`id="fNN"`), each frame contains screens (`data-screen-label="NN.K"`). Every file defines both themes as CSS variables: `[data-theme="dark"]` (default) and `[data-theme="light"]`.

## Sections

| # | Section | File [frames] |
| --- | --- | --- |
| 1 | Sign-in and onboarding | `Reckon Path v2.dc.html` [f1, f4]; `Reckon Path Extra.dc.html` [f29] |
| 2 | Home | `Reckon Path Home.dc.html` [f19] |
| 3 | Daily bearing | `Reckon Path Home.dc.html` [f20] |
| 4 | Levels | `Reckon Path Home.dc.html` [f21] |
| 5 | Game and mechanics | `Reckon Path v2.dc.html` [f5]; `Reckon Path Mechanics.dc.html` [f10, f11]; `Reckon Path Extra.dc.html` [f31] |
| 6 | Level results | `Reckon Path v2.dc.html` [f6]; `Reckon Path Mechanics.dc.html` [f12] |
| 7 | Arena | `Reckon Path Arena.dc.html` [f13, f14]; `Reckon Path Extra.dc.html` [f30] |
| 8 | Search, match, result | `Reckon Path Arena.dc.html` [f15]; `Reckon Path Arena Match.dc.html` [f16, f17]; `Reckon Path Extra.dc.html` [f32] |
| 9 | Leaderboards and season | `Reckon Path Arena Match.dc.html` [f18] |
| 10 | Shop (showroom) | `Reckon Path Shop.dc.html` [f22] |
| 11 | Profile and friends | `Reckon Path Profile.dc.html` [f23, f24] |
| 12 | Events and editor | `Reckon Path Settings.dc.html` [f27] |
| 13 | Settings and account | `Reckon Path Settings.dc.html` [f25, f26] |
| 14 | System screens and states | `Reckon Path Settings.dc.html` [f28]; `Reckon Path Extra.dc.html` [f33] |
| 15 | Draft archive — **not a reference** | `Reckon Path v2.dc.html` [f2, f3, f7, f8, f9] |

Source of this table: `RP_PAGES` in `Reckon Path Screens.dc.html` (the design's navigation page).

## Other files

| Path | What | Use |
| --- | --- | --- |
| `Reckon Path Screens.dc.html` | Navigation page over all sections | Index only |
| `Reckon Path.dc.html` | Early screen set (S1 Splash, S2 Onboarding…) | Not a reference unless a section above points to it |
| `_parts.txt` | Shared fragments: status bar, top bar, tab bar | Reference for the app shell |
| `assets/` | `reckon-logo.png`, `reckon-emblem.png` | Brand assets |
| `shots/`, `screenshots/` | JPEG previews of screens | Quick visual check (`Read` the image) |
| `spec.txt`, `uploads/` | Copy of the spec and earlier inputs (concept v82) | Not used — the spec lives in `docs/spec/` |
| `support.js` | Generated design runtime | Not used |

## How to use the design

* Locate a screen: `Grep` for `data-screen-label="NN.K"` or a visible RU string in the section's file, then read only that fragment.
* Colors: the design's CSS variable names (`--bg`, `--text2`, `--cyan`) are **not** code token names. Map them to the spec's semantic tokens (spec Part 3 §2: `bg.base`, `text.secondary`, `accent.cyan`); an unmapped value is a question for the developer, not a new token.
* Sizes: font sizes and dimensions in the design are not binding — spec Part 1 §8.3 and Part 3 §3–4 define the real scale.
* The live design is at claude.ai/design. When it changes, re-export it into this folder; agents cannot read it directly.

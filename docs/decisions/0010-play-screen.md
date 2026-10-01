# 0010. Board and play screen (stage 1, task 1)

Date: 2026-10-01. Asked by: play screen (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Scope of stage 1 | **Split into sequential tasks**: (1) Skia board + play screen + session saved in MMKV + pause, restart, win and lose sheets; (2) levels list and progress (stars, unlocking); (3) content of worlds 1–2 and `content:check`; (4) «Новый элемент» cards, level 1 tutorial, sound and Lottie. This task is (1), with 3–4 temporary test levels and a temporary «Играть» entry on the Levels tab. | Part 12 §2 stage 1, E1 |
| 2 | Dependencies | Approved: `@shopify/react-native-skia`, `zustand`, `react-native-mmkv`, `expo-haptics`, `@gorhom/bottom-sheet` (stack of Part 8 §2), via `npx expo install`; dev builds are rebuilt. | Part 8 §2 |
| 3 | Levels of worlds 1–2 | Task (3): drafts generated along the Part 6 §8.2 curve (bot norms, limit and stars by formula), checked by the developer by playing. | Part 6 §8 |
| 4 | Continue (no ads SDK, no wallet) | The ad button is shown as «Реклама недоступна», the ◆ button is disabled until the economy exists; plus a free «+3 хода» button in dev builds only, to check LVL-13/15 by hand. | Part 1 §3.5, Part 4 §6.2 |
| 5 | Bomb counter (LVL-08 says «total») | Shows **unexploded** bombs (Part 1 §2.5, Part 4 §5.1, `hud.bombsLeft`, design 10.x). | Part 11 LVL-08 |
| 6 | Tap on an opened cell (E1-1 says «Уже проверено») | Tooltip from design 10.4 («D4: пеленг 3 (до находки цели)»), small shake and haptic per Part 3 §8.2, §9.1. No move spent. | Part 4 §5.2, LVL-02 |
| 7 | Light theme of the board (Part 3 §2.3 vs design) | **Design colours** (decision 0002: design is the main UI reference). | Part 3 §2.3 |
| 8 | Returning to a started level | Entering a level with a saved session shows the choice «Продолжить или начать заново?»; «ПРОДОЛЖИТЬ» on Home (later) restores directly. | Part 1 §3.4, LVL-19 |
| 9 | Sound and Lottie (no assets) | Now: haptics per Part 3 §9.1; board animations (number reveal, shake, explosion, win) simplified on Reanimated/Skia with motion tokens. Sound and Lottie in task (4). | Part 3 §8–9 |
| 10 | Board elements | The board draws every element and state of the design (stream, bridge, ×2, rock, fence, beacon, buoy, fog, target order, direction and hot/cold modes, bomb-near badge, flags); rule cards later. | Part 3 §6, design 10.x |
| 11 | Heat thresholds | Relative, as the engine (Part 6 §3.1 is normative); the absolute ≤2 / 3–4 / ≥5 of Part 3 is not used. | Part 6 §3.1 |
| 12 | Texts missing from Part 5 | Taken from the design and the spec as RU keys; EN drafts reviewed by the developer. | Part 5 |
| 13 | Coordinates | Letter = column A–I, number = row from 1 («D4»); labels around the board hidden until the «Показывать координаты» setting exists. | Part 1 §2.1, Part 3 §6.5 |
| 14 | Route | `/play/[mode]/[id]` outside the tabs, `fullScreenModal`, gesture disabled, Android Back opens pause. Only `mode = campaign` now; other modes and unknown ids show an error state with «К уровням». | Part 8 §7 |
| 15 | Out of this task | Attempt sync (local result only), ● and XP rewards on the win sheet, double-for-ad, analytics, interstitials, level 1 tutorial, 9×9 magnifier. | — |

## Implementation notes

* Board geometry (padding, gap, radius, number size) follows the Part 3 §4.2 table, as Part 8 §8.2 prescribes; the design mock uses slightly different gaps (8/7/6). Board colours are the default `skin.json` (Part 8 §3.4) with the design values (#7).
* The saved game is the action log (taps, continue) plus flags, replayed through the engine on resume, so restoring is exact and needs no serialisation of engine state.
* Simplified until task (4): no sound or Lottie; reveal pop, cell and board shake, and the danger pulse of the moves counter are Reanimated/Skia; no HUD «−2» pop, no stream waves, pressed cell is a tint instead of the 3 pt press; the star bar fill is `accent.cyan` (the design's cyan → gold gradient has no token).
* `feedback.hot/warm/cold` (Part 3 §2.3) were added to the theme for the answer line under the board.

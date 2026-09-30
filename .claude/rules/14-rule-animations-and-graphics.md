---
paths:
  - "src/widgets/board/**"
  - "src/**/ui/**"
  - "src/screens/**"
  - "src/widgets/**"
  - "src/shared/audio/**"
  - "src/shared/haptics/**"
---

# Animations, Graphics, Sound, Haptics

Source: spec Part 8 §4 and §8, Part 3 §6 (board) and §8–§9 (motion, sound), Part 1 §8.4.

## Tool boundaries (Part 8 §4.1)

| What | Tool |
| --- | --- |
| Buttons, cards, counters, progress, list enter/exit, sheets | Reanimated 4 (CSS animations, `withSpring`, `withTiming`, layout animations) |
| Board: cells, elements, fences, numbers, tap ripple, particles | Skia `Canvas` driven by Reanimated shared values |
| Designer animations: explosion, victory, league-up, cosmetic effects | Lottie |
| Interactive state-machine animations: search radar, animated avatars | Rive |
| Screen transitions | Native (react-native-screens) + tab fade on Reanimated |

Forbidden: `Animated` from RN core, Moti, animations via `setState`, GIF/APNG, video effects, custom stack transitions.

## Rules

* All durations, easings, and springs come from motion tokens (Part 3 §8.1: `duration.*`, `easing.*`, `spring.*`). Numeric literals are rejected in review.
* Game logic never waits for an animation: state changes immediately, animation reflects it. Input is blocked only where the spec says so (e.g. 300 ms after finding a target).
* `useReducedMotion()` → simplified version per the design spec: fade instead of shake, no particles, Lottie shows the last frame.
* Lottie files are preloaded before the screen; at most 2 Lottie at once.
* Performance budget: ≥ 55 fps (target 60/120) on the reference Android; a tap renders ≤ 50 ms to animation start; a cell tap does not re-render the screen tree (Part 8 §13).

## Board (`widgets/board`, Part 8 §8)

* One Skia `Canvas` with one gesture handler for the whole board; layers as in Part 8 §8.1 (`BoardFrame`, `CellsLayer`, `StateLayer`, `NumbersLayer`, `FlagsLayer`, `FencesLayer`, `FxLayer`).
* Geometry computed once from width and the design-system table; hit-test maps gesture coordinates to a cell (gaps belong to the nearest cell; edges within 12 pt in the editor).
* Cell visuals live in a shared value array — animating one cell must not re-render React.
* With a screen reader on, an overlay of transparent `Pressable`s provides labels and actions (`15-rule-i18n-and-accessibility.md`).
* Preview mode = the same `BoardView` without gestures and numbers; many previews → cached `SkImage` snapshots.

## Sound and haptics

* The event → animation → sound → haptic map is fixed by Part 1 §8.4 and Part 3 §9. An event not in the map gets no effect until the developer says otherwise.
* Haptics only through the `shared/haptics` wrapper (respects settings, 80 ms throttle); sound through `shared/audio` (`expo-audio`, preloaded pool, respects iOS silent mode and other apps' music).

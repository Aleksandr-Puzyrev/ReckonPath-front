# 0008. Game engine, stage C (level codes, match vectors)

Date: 2026-10-01. Asked by: engine stage C (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Code prefix (`PELENG2-` in the spec) | **`RP2-`** (product name, shorter code). The decoder still accepts the prototype's `PELENG1-`. | Part 6 §7.2 |
| 2 | Compression for `deflateRaw` | **`fflate`** (pure JS, works on Hermes). Encoders may produce different bytes than Go's `compress/flate`; vectors check decoding of fixed codes and encode→decode round trips, not identical strings. | Part 6 §7.2 |
| 3 | `crc8` variant | **CRC-8/SMBUS**: polynomial 0x07, init 0x00, no reflection, xorout 0, over the UTF-8 bytes of the base64url part; two lowercase hex characters. Format `RP2-<base64url>-<crc>`. | Part 6 §7.2 |
| 4 | `x: challenge` | Not encoded for now; ignored when decoding. Added with the «Play by code» challenge feature once its format is defined. | Part 6 §7.2 |
| 5 | Match state machine in TS | **Not implemented in TS.** The match is server-authoritative (Part 8 §6.3); stage C delivers hand-derived match vectors (`kind: "match"`, from PVP-01…31) for the Go engine. | Part 6 §4.2, §9 |
| 6 | Code contents | `v, n, r, c, t, b, s, g, h, k, f, m, l` + `bc, by, fg, or` + `bh`; `n` is the `{ru, en}` title object; stars are not encoded. | Part 6 §7.1–7.2, §2.5 |
| 7 | Id of a decoded level | `u-` + FNV-1a-32 of the base64url part (base 36), so a code gives the same norm on every device. | — |
| 8 | Decoding errors | `CODE_INVALID`: wrong prefix, longer than 600 characters, bad crc, corrupt data, or a level that fails the validator. `CODE_NEWER`: `v > 2` or an unknown key. | Part 6 §7.2 |
| 9 | `PELENG1` | `w` → fences, `k` → streams, `n` (string) → `title.ru`, probe mode `distance`; prototype levels outside v2 limits (2×2 boards, 6 targets) are `CODE_INVALID`. | Part 6 §7.2 |
| 10 | Match vector model | Two maps; a turn is a tap on the opponent's map with the PvP variant of `applyTap`; first player, timers, connection wait and intro come from the server; turn limit `arena.maxTurns` (40); end reasons `targets`, `afk`, `turnLimit`, `surrender`, `annulled`. | Part 6 §4.2, Part 1 §5.4 |

## Answered after implementation

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 11 | `PELENG1` titles longer than 40 characters | **Truncated to 40** UTF-16 units (the v2 limit), never splitting a surrogate pair. Safe: the level id comes from the payload, not the title. | Part 6 §7.1 |
| 12 | Checking match vectors in TS | A **test-only** reference of `endTurn` (`src/test-utils/simulate-match.ts`) replays every match vector; not part of the engine API (#5 stands). | Part 6 §4.2 |
| 13 | Match vector coverage | **All engine-level cases** of the state machine (PVP-01, 03–07, 09–15, 17 and edge cases). | Part 11 §4 |
| 14 | Third timeout in a row during `finalTurn` | Reason **`afk`** (winner is the same: the player who found all targets). The AFK check comes first in `endTurn`. | Part 6 §4.2 |
| 15 | Turn limit reached by a skipped turn | **Check the limit again after skipped turns**: if both players have `MAX_TURNS`, the match ends by `turnLimit` at once — no 41st turn. Deviation from the literal pseudocode, which checks the limit only before the skips; the Go backend must do the same. | Part 6 §4.2 |

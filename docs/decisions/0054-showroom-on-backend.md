# 0054. Showroom on the backend: first answers

Date: 2026-11-02. Asked by: `check-backend` audit of backend 37a55cc (register «Showroom»). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Skin colours (S8) | Wait for the backend to send light and dark palettes per part (or mark a skin as one-theme, Part 3 §10.3 #5); the client does not build one palette for both themes. Until then equipped skins on the backend fall back to the default skin. | 0024 #1, Part 3 §10.3 #5 |
| 2 | Items no source describes: rarity `exclusive`, kinds `buoy`, `beacon`, `number` (S3, S5) | Shown in the showroom; `exclusive` is drawn as the legendary rarity until its own look is decided. | Part 1 §6.2 |
| 3 | Equip after a bundle purchase (S18) | Only the first part of the bundle is equipped. | 0023 #15 |
| 4 | «Видно в матче» (S6) | Derived from the item kind on the client; the mapping is set in the showroom connection task. | 0022 #2 |
| 5 | Connect before the backend fixes idempotency, bundle price, grace, stock | Yes — the showroom connects with these gaps; they stay in the backend list. | 0048 #6 |

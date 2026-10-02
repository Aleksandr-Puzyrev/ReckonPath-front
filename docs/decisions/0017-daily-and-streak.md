# 0017. Daily level and streak (stage 2 task 5a)

Date: 2026-10-02. Asked by: stage 2 task 5 (clarify-task). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | Split | **5a now:** the daily screen (design 20.1, 20.2, 20.5; 20.3 / 20.4 without restore buttons — the «Серия прервалась» card and the weekly note only), the daily game (20.6) and result (20.7), the streak from `GET /streak`, the 30-day calendar, the day leaderboard preview (top, median, my row from `GET /daily`). **5b later:** streak restore for ◆ (with task 6) and for an ad (stage 3), the full leaderboard with «Все / Страна / Друзья», sharing (20.8), push reminders. | Part 4 §7, design 20.1–20.8 |
| 2 | 30-day calendar source | A new client endpoint proposed to the backend, `GET /daily/history?days=30`, added to `contracts/openapi.yaml` as a proposal and mocked until the backend has it. The calendar is account data, not device data. | Part 4 §7.1 |
| 3 | Entry point | Only the daily card of the Home screen (design 19.1) is built now; the rest of Home stays for its own task. | Part 4 §7, design 19.1 |
| 4 | «Дейли закрыт (уровень < 6)» | Campaign level 6 passed. Works offline and matches Part 1 §7.6 («после уровня 6»). | Part 4 §7.2, Part 1 §7.6 |
| 5 | Admin overrides (DLY-13) | On launch `GET /daily/{date}` for today and the next 6 days, cached; an `override` level is played instead of the generated one. | Part 1 §4.1, Part 7 §4 |
| 6 | Result (20.7) | The place shows «Считаем…» until the attempt is sent, then the server's rank; offline — «Результат отправится, когда появится сеть». No rewards on the result yet (no wallet). Only the percentile is shown: the API sends no player count for «из 48 210 игроков». | design 20.7, Part 7 §4 |
| 7 | Local streak forecast | `GET /streak` plus today's counted attempt while it has not been sent. | Part 1 §4.3 |
| 8 | Texts | From Part 5; missing ones from the design («Последние 30 дней», «Твоё место — после попытки», «Считаем…», «Пеленг дня пройден»…); a text that neither has is asked separately. | Part 5, design 20.x |

Already fixed by the spec: the game day is UTC by server time, by the phone clock offline (NET-08); the level is the engine's `generateDaily`, id `d-YYYY-MM-DD` (0007 #15); one counted attempt a day, replays without reward or leaderboard; «Заново» during the counted attempt warns and counts it as a loss (DLY-05, 20.6); the timer runs during a pause (20.6), so `durationMs` is from the first tap to the end; an attempt started before midnight counts for its start day (DLY-03); daily attempts go through the outbox with `mode: "daily"`, rank / streak / `ranked` come from the server.

## Implementation notes

Date: 2026-10-02. Taken by the agent while implementing; to be confirmed by the developer.

| # | Topic | Decision | Spec reference |
| --- | --- | --- | --- |
| 9 | Top share on the result | «Топ N%» with N = 100 − `percentile` (at least 1), reading `percentile` as the share of players beaten; no «из N игроков», the API sends no player count (confirmed by the developer). | Part 7 §4, design 20.7 |
| 10 | When the place appears | The result shows «Считаем…» until the outbox is sent by its own triggers (Part 8 §6.4: start, network, background, every 60 s), so it may take up to a minute; finishing an attempt does not send it at once. | Part 8 §6.4 |
| 11 | «Восстановление — раз в неделю» | Not shown yet: `GET /streak` does not tell a missed day that cannot be restored from no missed day. Comes with restoring (5b), when the contract is agreed. | Part 7 §4, design 20.4 |
| 12 | Leaderboard preview rows | `leaderboardPreview.top` uses the `GET /leaderboards` row shape (`rank`, `user`, `value` = moves); the design's time column is not in that shape, so only moves are shown. | Part 7 §4, §6 |
| 13 | Missing English text | `daily.offline` «Результат отправится, когда появится сеть» is only in Part 4 (RU); EN draft «Your result will be sent once you are online». | Part 4 §7.2 |
| 14 | Visual simplifications | One-colour flame icon (theme `feedback.warm`), no lock icon on the locked Home card (none in the assets), no tabs on the day leaderboard (5b). | design 19.1, 20.1 |
| 15 | Dev mocks | The dev mock server keeps its accepted attempts and daily days in MMKV between launches, so reconciliation does not wipe progress on every reload. | 0014 #7 |
| 16 | Game start of a deep link | `/play/daily/d-<date>` opens only today's daily, or a game of another day that is still saved (DLY-03). | Part 4 §7.1 |
| 17 | Place after the review | A replay shows no place («—») and «Переигровка — без награды и лидерборда» (text from design 20.6). The counted attempt shows «Считаем…» only while it is still in the outbox; once sent without a place it shows «—». | Part 11 DLY-04, design 20.6 |
| 18 | DLY-06 mark | The server's `ranked = false` is kept with the day; the result then shows «Продолжение — без места в лидерборде» / "Continued — not ranked" (agent's draft, kept by the developer for now on 2026-10-02). | Part 11 DLY-06 |
| 19 | Re-rendering | The day key changes only at UTC midnight; only the countdown text ticks every second, so the screens (and the daily generator) do not re-render each second. | Part 8 §13 |
| 20 | Yesterday's attempt not sent yet | The local streak forecast counts only today's unsent attempt: a counted attempt from yesterday still in the outbox shows the streak as broken until it is sent. | 0017 #7 |

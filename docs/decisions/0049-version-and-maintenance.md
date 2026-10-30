# 0049. Version and maintenance from the backend (backend task 2)

Date: 2026-10-25. Asked by: clarify-task, backend connection task 2 (0048 #5). Answered by: developer.

| # | Question | Decision | Spec reference |
| --- | --- | --- | --- |
| 1 | What comes from the backend | Version and maintenance from `GET /version` and `GET /maintenance`; `/bootstrap` stays on the mocks for the remote config, ads network, content version, and day key (the backend is asked to add them). The splash waits for version and maintenance as well, still at most 2.5 s. | Part 4 §2.1, Part 7 §3, 0042 #3 |
| 2 | Who decides on updates | The backend's flags: `force_update` → forced update, `show_modal` → soft update; the version in the soft sheet is `current_version`. | Part 7 §3 |
| 3 | Update texts | The client's own texts only (Part 4/5, RU/EN); the backend's `title`, `description`, `button_text` are ignored. | Part 5 |
| 4 | Maintenance | `active: false` → the maintenance screen with the backend's `message` when it is not empty, else the client text; no end time (the backend has none). A 503 `maintenance` on any request still opens the screen. | 0042 |
| 5 | 426 `app_update_required` | Any request → the update screen; the store link from the error's data. | Part 7 §2 |
| 6 | Store link | Own Expo module `modules/install-source` (Kotlin): Android asks the system which store installed the app — RuStore (`ru.vk.store`) → `ru_store`, otherwise `play_market`; iOS → `app_store`. An empty link hides the «Обновить» button. Needs a dev build rebuild. | 0047 #5 |
| 7 | Routes | `GET /version` and `GET /maintenance` join `BACKEND_ROUTES`; they need no session. | 0048 #1 |

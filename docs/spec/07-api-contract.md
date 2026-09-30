# Часть 7. API-контракт

Вкладка — исходник для `contracts/openapi.yaml` и `contracts/ws/*.schema.json`. После переноса в YAML источником истины становится YAML, а эта вкладка — обзором.

## 1. Общие соглашения

| Тема | Правило |
| --- | --- |
| Базовый URL | `https://api.pelenge.app/v1`, WebSocket `wss://game.pelenge.app/v1/ws` |
| Формат | JSON UTF-8, `camelCase`, время — RFC 3339 в UTC (`2026-09-26T12:00:00Z`), ID — UUID v7 строкой, клетки — `[r, c]` |
| Заголовки запроса | `Authorization: Bearer <access>`, `X-App-Version: 1.2.0`, `X-Platform: ios\|android`, `X-Locale: ru\|en`, `X-Request-Id: <uuid>`, `Idempotency-Key: <uuid>` (для POST/PUT/DELETE) |
| Заголовки ответа | `X-Request-Id`, `X-Server-Time` (для синхронизации часов), `Retry-After` при 429/503 |
| Статусы | 200 / 201 успех; 400 валидация; 401 токен; 403 бан / нет прав; 404; 409 конфликт состояния; 422 бизнес-правило; 426 обновить приложение; 429 лимит; 503 техработы |
| Ошибка | `{"error": {"code": "INSUFFICIENT_FUNDS", "message": "Не хватает валюты", "details": {"need": 240}}}`; `message` локализован по `X-Locale`, но клиент показывает свой текст по `code` |
| Пагинация | Курсорная: `?limit=50&cursor=<opaque>` → `{"items": [...], "nextCursor": "..." \| null}` |
| Идемпотентность | Повтор с тем же `Idempotency-Key` и тем же телом → сохранённый ответ (24 ч); с другим телом → 409 `IDEMPOTENCY_MISMATCH` |
| Версионирование | Добавление полей — без смены версии (клиент игнорирует неизвестные поля); удаление или смена смысла — только в `/v2` или после повышения минимальной версии клиента |
| Деньги и валюты | Целые числа; каждый ответ, меняющий баланс, содержит `wallet: {emeralds, coins}` |

## 2. Каталог кодов ошибок

| Код | HTTP | Когда | Действие клиента |
| --- | --- | --- | --- |
| `VALIDATION` | 400 | Тело не соответствует схеме (`details.fields`) | Баг — Sentry, общий текст |
| `UNAUTHORIZED` | 401 | Нет / истёк access | Refresh и повтор |
| `SESSION_REVOKED` | 401 | Refresh отозван или переиспользован | Выход; привязанный — экран входа |
| `BANNED` | 403 | Бан (`details.scope`: `all` / `arena`, `until`, `reason`) | Экран бана |
| `FORBIDDEN` | 403 | Нет прав (админ-API) | — |
| `NOT_FOUND` | 404 | Сущность не найдена | Тост / назад |
| `IDEMPOTENCY_MISMATCH` | 409 | Тот же ключ, другое тело | Баг — Sentry |
| `ALREADY_OWNED` | 409 | Предмет уже есть | Кнопка → «Экипировать» |
| `IN_MATCH` / `ALREADY_QUEUED` | 409 | Активный матч / билет | Предложить вернуться |
| `NICK_TAKEN` | 409 | Ник занят | Ошибка под полем |
| `ACCOUNT_CONFLICT` | 409 | Apple/Google уже привязан к другому аккаунту (`details.other`: краткая сводка) | Диалог выбора |
| `INSUFFICIENT_FUNDS` | 422 | Не хватает валюты (`details.need`) | Лист «Как заработать» |
| `OFFER_ENDED` / `SOLD_OUT` | 422 | Окно продаж закрыто / тираж | Обновить каталог |
| `PRICE_CHANGED` | 422 | Клиентская цена устарела (`details.price`) | Показать новую, подтвердить |
| `LIMIT_REACHED` | 422 | Дневной лимит (`details.kind`, `resetAt`) | Скрыть кнопку |
| `MAP_INVALID` | 422 | Карта не прошла валидатор (`details.errors[]` с кодами из «Спецификации движка» 6.1) | Подсветить на поле |
| `ATTEMPT_REJECTED` | 422 | Пересчёт попытки не совпал (в батче — на уровне элемента) | Принять серверный результат |
| `STREAK_NOT_RESTORABLE` | 422 | Пропущено > 1 дня или кулдаун | — |
| `FRIENDS_LIMIT` | 422 | 200 друзей | Тост |
| `LINK_REQUIRED` | 422 | Действие доступно только привязанным (друзья) | Лист привязки |
| `UPGRADE_REQUIRED` | 426 | Версия ниже минимальной | Экран обновления |
| `RATE_LIMITED` | 429 | Лимит запросов | Повтор после `Retry-After` |
| `MAINTENANCE` | 503 | Техработы (`details.until`, `message`) | Экран техработ |
| `INTERNAL` | 500 | Непредвиденная ошибка | Общий текст, повтор |

## 3. Авторизация, bootstrap, профиль

### `GET /bootstrap` (без авторизации допустим)

```json
{
  "serverTime": "2026-09-26T12:00:00Z",
  "version": { "min": "1.1.0", "recommended": "1.2.0", "storeUrl": "https://apps.apple.com/app/id000", "message": "Новые скины и быстрее поиск" },
  "maintenance": null,
  "config": { "arena.maxTurns": 40, "ads.interstitial.everyN": 3, "features.events": true },
  "contentVersion": "2026.09.20-1",
  "adsNetwork": "yandex",
  "dayKey": "2026-09-26", "nextDayAt": "2026-09-27T00:00:00Z"
}
```

### `POST /auth/guest`

```json
// запрос
{ "deviceId": "d9a3…", "platform": "android", "integrityToken": "…" }
// 201
{ "accessToken": "eyJ…", "refreshToken": "r_8f…", "expiresIn": 900, "user": { "id": "0192…", "nickname": "Player4821", "isGuest": true } }
```

### `POST /auth/apple` · `POST /auth/google` · `POST /auth/link`

```json
// /auth/link — привязать провайдера к текущему гостю
{ "provider": "apple", "identityToken": "eyJ…", "nonce": "…" }
// 200 — привязано;  409 ACCOUNT_CONFLICT — у этого Apple ID уже есть аккаунт:
{ "error": { "code": "ACCOUNT_CONFLICT", "details": { "other": { "level": 58, "league": "GOLD I", "stars": 212 } } } }
// далее клиент выбирает: POST /auth/apple → вход в сохранённый (гостевой брошен)
```

### `POST /auth/refresh` · `POST /auth/logout`

`{ "refreshToken": "r_8f…" }` → новая пара токенов; старый refresh больше не действует.

### `GET /me`

```json
{
  "id": "0192…", "nickname": "Nova", "isGuest": false, "providers": ["apple"],
  "level": 18, "xp": 340, "xpToNext": 475,
  "wallet": { "emeralds": 2640, "coins": 18420 },
  "arena": { "trophies": 2640, "league": "GOLD", "division": 2, "peak": 2910, "rp": 340, "seasonId": 7 },
  "loadout": { "field": "neon_signal_field", "fence": "default", "avatar": "orbit_avatar", "frame": "signal_frame", "badges": ["streak_7"], "title": "master", "fxClick": "comet_tap" },
  "flags": { "nickChangeFreeAvailable": false, "nickChangeAvailableAt": "2026-10-20T00:00:00Z", "deletionScheduledAt": null },
  "friendCode": "K7F2QX9M"
}
```

### Прочее

| Метод | Тело | Ответ / ошибки |
| --- | --- | --- |
| `PATCH /me` | `{ "nickname"?: "Nova", "locale"?: "en" }` | `me`; `NICK_TAKEN`, `VALIDATION`, `INSUFFICIENT_FUNDS` (платная смена), `LIMIT_REACHED` (30 дней) |
| `DELETE /me` | `{ "confirmNickname": "Nova" }` | `{ "deletionScheduledAt": "…" }` |
| `POST /me/restore` | — | Отмена удаления |
| `GET /users/{id}` | — | Публичный профиль + `headToHead: {wins, losses, draws}` + `friendship: none\|pending_out\|pending_in\|friends\|blocked` |
| `PUT /push-token` | `{ "platform": "ios", "token": "…", "tz": "Europe/Moscow", "locale": "ru", "channels": {"daily": true, "friends": true, "arena": true, "events": false} }` | 204 |

## 4. Прогресс, дейли, серия

### `POST /attempts:batch`

Клиент отправляет завершённые попытки из outbox (до 50 за раз). Сервер переигрывает каждую и возвращает результат по каждой + итоговое состояние.

```json
// запрос
{
  "attempts": [
    {
      "attemptId": "0192a…", "mode": "campaign", "ref": "c-27", "contentVersion": "2026.09.20-1",
      "startedAt": "2026-09-26T08:01:10Z", "finishedAt": "2026-09-26T08:03:02Z",
      "taps": [[3,1],[5,2],[4,4],[4,5]], "continued": false, "continueMethod": null,
      "claimed": { "result": "won", "movesUsed": 5, "stars": 3 }
    },
    { "attemptId": "0192b…", "mode": "daily", "ref": "d-2026-09-26", "taps": [[2,2],[0,4]], "claimed": { "result": "won", "movesUsed": 2, "stars": 3 }, "durationMs": 41800 }
  ]
}
// 200
{
  "results": [
    { "attemptId": "0192a…", "status": "accepted", "result": "won", "stars": 3, "rewards": [{ "currency": "coin", "amount": 50, "reason": "level_first_win" }, { "xp": 10 }] },
    { "attemptId": "0192b…", "status": "accepted", "daily": { "rank": 134, "percentile": 88, "ranked": true }, "streak": { "current": 13, "best": 19 } }
  ],
  "progress": { "currentLevel": 28, "totalStars": 217 },
  "wallet": { "emeralds": 2640, "coins": 18470 }
}
```

Статусы элемента: `accepted`, `duplicate` (уже принят, возвращается прошлый результат), `corrected` (сервер пересчитал иначе — в ответе серверный итог), `rejected` (неизвестный уровень, тапы вне поля), `late` (офлайн-попытка старше 7 дней — прогресс без наград).

### Остальные

| Метод | Тело / параметры | Ответ |
| --- | --- | --- |
| `GET /progress` | — | `{ currentLevel, levels: [{id, bestStars, bestMoves}], worldsCompleted: [1,2,3,4] }` |
| `POST /continue` | `{ attemptId, method: "emeralds" }` или `{ attemptId, method: "ad", adIntentId }` | `{ granted: true, bonusMoves: 3, wallet }`; `LIMIT_REACHED`, `INSUFFICIENT_FUNDS` |
| `GET /content/manifest` | `?since=2026.09.01-1` | `{ version, levels: [{id, url, sha256}], dailyOverrides: [{date, url}] }` — файлы на CDN |
| `GET /daily/{date}` | — | `{ date, override: null \| level, leaderboardPreview: {top: [...], median: 9}, me: {played, result, rank} }` |
| `GET /streak` | — | `{ current, best, lastDay, restorable: true, restoreUntil, restoreMethods: ["ad","emeralds"], price: 30 }` |
| `POST /streak/restore` | `{ method: "emeralds" }` / `{ method: "ad", adIntentId }` | `{ streak, wallet }`; `STREAK_NOT_RESTORABLE` |
| `GET /levels/custom` · `POST` · `PUT /{id}` · `DELETE /{id}` | level v2 | Список / сохранённый уровень; `LIMIT_REACHED` (20), `MAP_INVALID` |

## 5. Арена (REST)

### `GET /arena`

```json
{
  "profile": { "trophies": 2640, "league": "GOLD", "division": 2, "divisionMin": 2400, "divisionMax": 2800, "peak": 2910, "rp": 340, "wins": 37, "losses": 24, "draws": 3 },
  "season": { "id": 7, "endsAt": "2026-10-08T00:00:00Z", "track": [{ "step": 1, "rp": 50, "reward": { "currency": "coin", "amount": 200 }, "state": "claimed" }, { "step": 7, "rp": 350, "reward": { "item": "season7_frame" }, "state": "locked" }] },
  "format": { "size": 7, "targets": 2, "turnSec": 7, "bombHint": true, "limits": { "fence": 8, "stream": 7, "heavy": 3, "rock": 6, "bridge": 2, "bomb": 4 } },
  "activeMapId": "0192c…", "unlocked": true, "onboardingDone": true
}
```

### Карты

| Метод | Тело | Ответ |
| --- | --- | --- |
| `GET /arena/maps` | — | `[{ id, name, format, map, valid, active, botNorm, plays, defended }]` |
| `POST /arena/maps` | `{ name, format: 7, map: level v2 без moveLimit }` | Карта; сервер считает `valid`, `errors[]`, `botNorm`; `LIMIT_REACHED` (3 на формат) |
| `PUT /arena/maps/{id}` | то же | Карта |
| `DELETE /arena/maps/{id}` | — | 204; активную удалить нельзя → 409 |
| `POST /arena/maps/{id}/activate` | — | `{ activeMapId }`; `MAP_INVALID` |
| `POST /arena/maps/validate` | `{ format, map }` | `{ valid, errors: [{code, cells}], botNorm }` — без сохранения |
| `POST /arena/maps/random` | `{ format }` | `{ map, botNorm }` |

### Асинхронный матч

```json
// POST /arena/async  → 201
{ "asyncId": "0192d…", "author": { "id": "…", "nickname": "Kira", "league": "GOLD", "avatar": "…" },
  "map": { "rows": 7, "cols": 7, "fences": [...], "streams": [...], "rocks": [...], "heavy": [...], "bridges": [...] },
  "bombCount": 3, "targetsCount": 2, "norm": 11, "turnSec": 7, "bombHint": true, "skin": { "field": "storm_holiday_field" } }

// тапы идут по одному, сервер отвечает результатом (цели не уходят на клиент)
// POST /arena/async/{id}/tap  { "turn": 3, "cell": [4,2] }
{ "turn": 3, "outcome": "pelang", "value": 2, "bombNear": true, "turnsUsed": 3, "deadline": "2026-09-26T12:00:05.300Z" }

// итог — когда найдены все цели или 40 ходов
{ "finished": true, "result": "win", "turnsUsed": 9, "norm": 11, "trophiesDelta": 16, "rp": 5, "rewards": [...], "map": { "targets": [[1,5],[4,2]], "bombs": [[3,3]] } }
```

Тайм-ауты в асинхроне считает сервер по `deadline`: если следующий тап пришёл позже, пропущенные ходы добавляются к `turnsUsed`. Закрытое приложение > 60 с — поражение.

### Прочее

| Метод | Ответ |
| --- | --- |
| `GET /arena/matches?cursor` | `{ items: [{ matchId, mode, opponent, result, reason, turns, trophiesDelta, endedAt }], nextCursor }` |
| `GET /arena/matches/{id}` | Полная история: обе карты, ходы с результатами |
| `POST /arena/season/claim` | `{ step }` → `{ reward, wallet, inventoryAdded }`; повтор — `duplicate` без ошибки |
| `GET /leaderboards/{board}?scope=global\|country\|friends&cursor` | `{ items: [{ rank, user: {id, nickname, avatar, frame, league}, value }], me: { rank, value, neighbors: [...] }, resetsAt }`; board = `weekly` \| `season` \| `daily:2026-09-26` |

## 6. Витрина, инвентарь, реклама

### `GET /shop`

```json
{
  "featured": { "id": "drop_storm", "image": "https://cdn.pelenge.app/b/storm.webp", "title": "STORM SIGNAL", "subtitle": "Поле, забор, ручей и победный эффект", "endsAt": "2026-10-02T12:00:00Z", "target": { "bundle": "storm_set" } },
  "tabs": [
    { "id": "exclusive", "items": [
      { "id": "neon_signal_field", "type": "FIELD", "slot": "field", "rarity": "epic", "name": "Neon Signal Field", "description": "…",
        "price": { "emeralds": 1180 }, "preview": "https://cdn…/neon/preview.webp", "package": { "url": "https://cdn…/neon.zip", "sha256": "…", "version": 3 },
        "availableTo": null, "stockLeft": null, "owned": false, "equipped": false }
    ] }
  ],
  "bundles": [{ "id": "storm_set", "items": ["storm_field", "storm_fence", "storm_stream", "thunder_victory"], "basePrice": { "emeralds": 2400 }, "price": { "emeralds": 1400 }, "ownedItems": ["storm_fence"], "availableTo": "2026-10-02T12:00:00Z" }],
  "cacheTtlSec": 300
}
```

### `POST /shop/purchase`

```json
// запрос (Idempotency-Key обязателен)
{ "itemId": "neon_signal_field", "expectedPrice": { "emeralds": 1180 } }      // или { "bundleId": "storm_set", "expectedPrice": {...} }
// 200
{ "purchaseId": "0192e…", "granted": ["neon_signal_field"], "wallet": { "emeralds": 1460, "coins": 18420 } }
// ошибки: INSUFFICIENT_FUNDS, ALREADY_OWNED, OFFER_ENDED, SOLD_OUT, PRICE_CHANGED
```

| Метод | Тело | Ответ |
| --- | --- | --- |
| `GET /inventory` | — | `{ items: [{ itemId, slot, acquiredAt, source }] }` |
| `PUT /loadout` | `{ "field": "neon_signal_field", "fxVictory": null }` (частично) | `loadout`; предмета нет в инвентаре → 422 `NOT_OWNED` |

### Реклама (rewarded)

```json
// 1. POST /ads/intent  { "placement": "gems" | "continue" | "double" | "streak" | "event", "ref": "attemptId / eventId" }
{ "adIntentId": "0192f…", "customData": "0192f…", "network": "yandex", "unitId": "R-M-XXXX-1", "leftToday": 3 }
// 2. клиент показывает рекламу с customData = adIntentId
// 3. сеть вызывает GET /ads/ssv/{network}?...&custom_data=0192f…&signature=…  (сервер ↔ сервер)
// 4. GET /ads/intent/{id}  (клиент опрашивает раз в секунду до 10 с)
{ "status": "pending" | "rewarded" | "expired", "reward": { "currency": "emerald", "amount": 5 }, "wallet": {...} }
```

Intent живёт 15 минут. Для `continue` / `streak` награда — право вызвать `POST /continue` или `POST /streak/restore` с этим `adIntentId` (одноразово).

## 7. Друзья, события, прочее

| Метод | Тело / параметры | Ответ / ошибки |
| --- | --- | --- |
| `GET /friends` | — | `{ friends: [{ user, status: online\|in_match\|offline, lastSeenAt, headToHead }], incoming: [...], outgoing: [...] }` |
| `GET /friends/search?q=kir` | ≥ 3 символа | До 20 пользователей с `friendship` |
| `POST /friends/requests` | `{ userId }` или `{ friendCode }` | `{ state: pending_out \| friends }` (встречная заявка → friends); `LINK_REQUIRED`, `FRIENDS_LIMIT`, `NOT_FOUND` |
| `POST /friends/requests/{userId}:accept` · `:decline` | — | `{ state }` |
| `DELETE /friends/{userId}` | — | 204 |
| `POST /friends/{userId}/block` · `DELETE .../block` | — | 204; блокировка удаляет дружбу и заявки |
| `POST /invites` | — | `{ code: "INV-7Q2K", url: "https://pelenge.app/i/INV-7Q2K", rewardedLeft: 7 }` |
| `POST /invites/redeem` | `{ code }` | `{ friendAdded: true, reward }`; повторно — `duplicate` |
| `GET /events/current` | — | `{ event: { id, title, description, banner, startsAt, endsAt, tokens, track: [{step, tokens, reward, state}], maps: [{ id, level, unlocked, stars }], sources: [...] } \| null, next: { startsAt } \| null }` |
| `POST /events/{id}/claim` | `{ step }` | `{ reward, wallet }` |
| `POST /reports` | `{ targetUserId, matchId?, reason: "nickname"\|"cheating"\|"other", comment? }` | 204; не более 10 в сутки |
| `POST /analytics/events` | `{ events: [{ name, ts, sessionId, props }] }` — до 200 | 202 |
| `POST /support/tickets` | `{ topic, message, diagnostics: { appVersion, device, userId } }` | `{ ticketId }` |

## 8. WebSocket

### 8.1 Конверт и подключение

- Общий вход: `wss://game.pelenge.app/v1/ws?token=<access>` — поиск, вызовы, присутствие. Матч: `wss://game-N.pelenge.app/v1/match/{matchId}?ticket=<одноразовый>`.
- Каждое сообщение: `{ "t": "<тип>", "id": "<uuid клиента>"?, "seq": <серверный порядковый номер>?, "d": { … } }`. Клиентские сообщения с `id` получают `ack` или `error` с тем же `id`.
- Коды закрытия: 4001 токен, 4003 бан, 4009 подключение с другого устройства, 4010 матч на другой ноде (`reason` = новый endpoint), 4026 обновить приложение, 4503 техработы.

### 8.2 Сообщения с примерами

```json
// → клиент
{ "t": "queue.join", "id": "c1", "d": { "format": 7, "mapId": "0192c…" } }
{ "t": "queue.leave", "id": "c2" }
{ "t": "challenge.send", "id": "c3", "d": { "friendId": "…", "format": 7, "mapId": "…" } }
{ "t": "challenge.answer", "id": "c4", "d": { "challengeId": "…", "accept": true, "mapId": "…" } }
{ "t": "match.tap", "id": "c5", "d": { "turn": 7, "cell": [4, 2] } }
{ "t": "match.emote", "d": { "emote": "gg" } }
{ "t": "match.surrender", "id": "c6" }
{ "t": "match.resync", "id": "c7" }
{ "t": "ping", "d": { "c": 1727352000123 } }

// ← сервер
{ "t": "ack", "id": "c1" }
{ "t": "queue.status", "d": { "waitedSec": 7, "range": 150, "asyncAvailable": false } }
{ "t": "match.found", "d": { "matchId": "…", "endpoint": "wss://game-3.pelenge.app/v1/match/…", "ticket": "…",
   "opponent": { "id": "…", "nickname": "Kira", "league": "GOLD", "division": 1, "trophies": 2710, "avatar": "…", "frame": "…", "title": "…", "isBot": false, "label": null },
   "format": { "size": 7, "targets": 2, "turnSec": 7, "bombHint": true, "maxTurns": 40 } } }
{ "t": "match.state", "seq": 1, "d": { "state": "intro", "opponentMap": { "fences": [...], "streams": [...], "bridges": [...], "heavy": [...], "rocks": [...] },
   "opponentBombs": 3, "opponentSkin": { "field": "storm_holiday_field" }, "introEndsAt": "…" } }
{ "t": "match.turn", "seq": 2, "d": { "turn": 1, "player": "me", "deadline": "2026-09-26T12:00:08.000Z", "skipped": [] } }
{ "t": "match.tapResult", "seq": 3, "d": { "turn": 1, "player": "me", "cell": [4,2], "outcome": "pelang", "value": 3, "bombNear": false, "found": { "me": 0, "opponent": 0 } } }
{ "t": "match.tapResult", "seq": 9, "d": { "turn": 3, "player": "opponent", "cell": [2,5], "outcome": "bomb" } }
{ "t": "match.turn", "seq": 10, "d": { "turn": 4, "player": "me", "deadline": "…", "skipped": [{ "player": "opponent", "reason": "bomb" }] } }
{ "t": "match.turn", "seq": 15, "d": { "turn": 6, "player": "opponent", "deadline": "…", "final": true } }
{ "t": "match.opponent", "seq": 16, "d": { "connection": "reconnecting" } }
{ "t": "match.emote", "d": { "player": "opponent", "emote": "gg" } }
{ "t": "match.snapshot", "seq": 21, "d": { "state": "playing", "turn": 8, "current": "me", "deadline": "…", "myTaps": [...], "opponentTaps": [...], "found": {...}, "timeoutsRow": { "me": 1 }, "skip": {...} } }
{ "t": "match.end", "seq": 30, "d": { "result": "win", "reason": "targets", "turns": { "me": 9, "opponent": 8 },
   "maps": { "mine": { "targets": [...], "bombs": [...] }, "opponent": { "targets": [...], "bombs": [...] } },
   "trophies": { "before": 2640, "after": 2672, "delta": 32 }, "league": { "changed": false }, "rp": 10, "rewards": [...] } }
{ "t": "error", "id": "c5", "d": { "code": "NOT_YOUR_TURN" } }   // также CELL_REVEALED, CELL_ROCK, STALE_TURN, MATCH_OVER
{ "t": "challenge.incoming", "d": { "challengeId": "…", "from": { … }, "format": 7, "expiresAt": "…" } }
{ "t": "presence", "d": { "userId": "…", "status": "online" } }
{ "t": "pong", "d": { "c": 1727352000123, "s": 1727352000180 } }
```

### 8.3 Последовательности

```mermaid
sequenceDiagram
  participant A as Клиент A
  participant G as game (общий вход)
  participant N as game-3 (нода матча)
  participant B as Клиент B
  A->>G: queue.join
  B->>G: queue.join
  G-->>A: match.found (endpoint, ticket)
  G-->>B: match.found
  A->>N: connect(ticket)
  B->>N: connect(ticket)
  N-->>A: match.state intro
  N-->>B: match.state intro
  N-->>A: match.turn (me)
  N-->>B: match.turn (opponent)
  A->>N: match.tap
  N-->>A: match.tapResult
  N-->>B: match.tapResult
  Note over N: бомба → skip; последняя цель → finalTurn / end
  N-->>A: match.end
  N-->>B: match.end
```

Реконнект: клиент подключается к `endpoint` с `?resume=1` (билет не нужен, достаточно access-токена участника) → сервер сразу шлёт `match.snapshot`. Если у клиента пропущен `seq`, он отправляет `match.resync`.

### 8.4 Индикатор бомбы, таймер и бот

- `bombNear` приходит в каждом `match.tapResult` и ответе `POST /arena/async/{id}/tap` с `outcome` = `pelang` или `target`. Если в формате `bombHint = false`, поле всегда `false`. Правило — Спецификация движка, 2.4.
- `format.turnSec` берётся из `arena.formats`: 5×5 → 5, 7×7 → 7, 9×9 → 10. `deadline` в `match.turn` = начало хода + `turnSec` + 300 мс.
- Бот: `opponent.isBot = true`, `label = "training"`. Клиент показывает подпись «Тренировочный соперник» на VS, в матче и в истории (`GET /arena/matches` отдаёт те же поля). `match.end.trophies.delta` уже учитывает ×0,5.

## 9. Админ-API (`/admin/v1`)

Отдельный роутер с cookie-сессией администратора, CSRF-токеном и RBAC. Каждый записывающий запрос требует поле `comment` и пишется в аудит.

| Группа | Эндпоинты |
| --- | --- |
| Сессия | `POST /auth/login {email, password}` → `POST /auth/totp {code}` · `POST /auth/logout` · `GET /me` (роль, права) |
| Витрина | `GET/POST /catalog/items` · `GET/PATCH /catalog/items/{id}` · `POST /catalog/items/{id}:schedule {availableFrom, availableTo, stockLimit, countries, minAppVersion}` · `POST .../{id}:unpublish` · `POST /assets:presign {filename, contentType}` → `{uploadUrl, assetKey}` · `POST /assets/{key}:validate` → результат автопроверок · `GET/POST/PATCH /bundles` · `GET/PUT /featured` · `GET /catalog/items/{id}/stats` |
| Версии и конфиг | `GET/PUT /app-versions/{platform}` (ответ содержит `affectedShare` — долю игроков ниже новой минимальной) · `GET/PUT /maintenance` · `GET /config` · `PUT /config/{key} {value, targeting: {platforms, countries, minVersion, rolloutPct}}` · `GET /config/history` · `POST /config/{key}:rollback {version}` |
| Контент | `GET/PUT /content/levels/{id}` · `POST /content/levels:validate` · `POST /content/releases` (публикация пакета) · `POST /content/releases/{v}:rollback` · `GET /daily/calendar?from&to` · `PUT /daily/{date}/override` |
| Игроки | `GET /users?q=` · `GET /users/{id}` · `GET /users/{id}/ledger` · `POST /users/{id}/grant {currency, amount}` · `POST /users/{id}/items {itemId}` · `POST /users/{id}/ban {scope, until, reason}` · `DELETE /users/{id}/ban` · `POST /users/{id}/reset-nickname` · `POST /users/{id}/export` |
| Модерация | `GET /reports?status=open` · `PATCH /reports/{id} {status, decision}` · `GET /flags` (античит) · `GET /matches/{id}` |
| События и сезоны | `GET/POST/PATCH /events` · `GET/POST/PATCH /seasons` · `PUT /arena/formats` |
| Push | `POST /push/campaigns {segment, texts: {ru, en}, url, sendAt}` · `POST /push/campaigns/{id}:test` · `GET /push/campaigns/{id}` (охват) |
| Отчёты | `GET /reports/{name}?from&to&platform&country&version&groupBy&format=json\|csv` |
| Система | `GET/POST /admins` · `PATCH /admins/{id} {role}` · `POST /admins/{id}:reset-totp` · `GET /audit?actor&entity&from&to` |



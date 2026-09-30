# Часть 9. Бэкенд: архитектура и стек (Go)

## 1. Архитектура

Бэкенд — **модульный монолит на Go** с чистой (гексагональной) архитектурой внутри модулей, собирается в три бинарника: `api` (REST), `game` (WebSocket, матчи), `worker` (фоновые задачи). Микросервисы на старте не нужны: одна команда, одна БД, а нагрузка разная только у игрового сервера — он и масштабируется отдельно.

### 1.1 Модули

| Модуль | Отвечает за | В каком бинарнике |
| --- | --- | --- |
| `auth` | Гости, Apple/Google, сессии, JWT | api |
| `user` | Профиль, ник, XP, баны, удаление | api, worker |
| `engine` | Go-порт движка, валидатор, бот-решатель, генератор дейли (без I/O) | все |
| `content` | Пакеты уровней, переопределения дейли, манифест | api |
| `progress` | Попытки, звёзды, награды кампании | api |
| `daily` | Дейли, серии, дневной лидерборд | api, worker |
| `arena` | Карты, подбор, матчи, боты, асинхрон, рейтинг, сезоны | game, api, worker |
| `economy` | Кошелёк, журнал, награды | все |
| `shop` | Каталог, покупки, инвентарь, экипировка | api |
| `social` | Друзья, приглашения, вызовы, присутствие (онлайн) | api, game |
| `events` | Live Events, токены, трек | api, worker |
| `ads` | Intent, SSV-колбэки, лимиты | api |
| `notify` | Push-токены, рассылки, лимиты, тихие часы | worker |
| `analytics` | Приём событий, запись в ClickHouse, агрегаты | api, worker |
| `config` | Версии приложения, remote config, техработы | api |
| `admin` | Админ-API, роли, аудит | api (отдельный роутер `/admin/v1`) |

### 1.2 Слои внутри модуля

```
internal/<module>/
  domain/      # сущности, правила, ошибки домена (без импортов инфраструктуры)
  app/         # use cases (сервисы): PurchaseItem, SubmitAttempts, JoinQueue…; интерфейсы репозиториев
  adapters/
    postgres/  # реализация репозиториев (sqlc)
    redis/
    http/      # хендлеры, сгенерированные oapi-codegen
    ws/        # только в arena/social
  module.go    # сборка зависимостей (ручной DI)
```

- Модули общаются только через публичные интерфейсы `app`-слоя (например, `arena` вызывает `economy.Grant`), без доступа к чужим таблицам.
- Доменные события (`MatchFinished`, `ItemPurchased`, `DailyCompleted`) пишутся в таблицу `outbox` в той же транзакции; worker разбирает их для аналитики, push, событий и лидербордов.
- Границы проверяются линтером `depguard` (запрет импорта `internal/<other>/adapters` и `domain` чужих модулей).

### 1.3 Когда делить на сервисы

Выделять модуль в отдельный сервис только при одном из условий: отдельная команда, нагрузка на порядок выше остальных, свой цикл релизов. Первые кандидаты — `analytics` и `arena/game`.

## 2. Стек

| Задача | Библиотека | Почему | Альтернатива (не берём) |
| --- | --- | --- | --- |
| Язык | Go (последняя стабильная, ≥ 1.24) | Горутины для тысяч матчей, простой деплой одним бинарником | — |
| HTTP-роутер | `go-chi/chi` v5 | Совместим с `net/http`, middleware | Gin, Echo, Fiber (Fiber не на `net/http`) |
| Контракт REST | `oapi-codegen` (strict server) + `kin-openapi` (валидация запросов) | Contract-first: один `openapi.yaml` → сервер, клиент и админка | gRPC (неудобен для RN и админки), ручные хендлеры |
| WebSocket | `github.com/coder/websocket` | Современный API с `context`, конкурентная запись | gorilla/websocket (меньше удобств), socket.io |
| PostgreSQL драйвер | `jackc/pgx` v5 (pgxpool) | Быстрый, нативные типы, `COPY`, батчи | database/sql + lib/pq |
| SQL | `sqlc` | Типобезопасный Go из SQL, никакой магии ORM | GORM, ent |
| Миграции | `pressly/goose` | SQL-миграции + Go-миграции для данных | golang-migrate, Atlas |
| Redis | `redis/go-redis` v9 + `go-redis/redis_rate` | Очереди подбора, лидерборды, присутствие, rate limit | — |
| Фоновые задачи | `riverqueue/river` | Очередь в Postgres (транзакционная постановка задачи), cron, ретраи, UI | Asynq (на Redis), Temporal (избыточен) |
| JWT | `golang-jwt/jwt` v5 | Подпись access-токенов (EdDSA) | — |
| Проверка Apple/Google | `lestrrat-go/jwx` v3 (JWKS с кэшем) | Проверка `identityToken` / `idToken` по ключам провайдеров | — |
| Push | `sideshow/apns2` (APNs), `firebase.google.com/go/v4/messaging` (FCM) | Прямая отправка без посредников | Expo Push, OneSignal |
| Аналитика | `ClickHouse/clickhouse-go` v2 | Батч-вставка событий | Хранить события в Postgres |
| Файлы | `aws/aws-sdk-go-v2` (S3-совместимое) | Ассеты витрины, пакеты контента, presigned upload из админки | — |
| Конфигурация | `knadh/koanf` | ENV + файлы, валидация при старте | viper (тяжелее) |
| Логи | `log/slog` (JSON) | Стандартная библиотека | zap, zerolog |
| Трассировка / метрики | OpenTelemetry Go SDK, `prometheus/client_golang` | Сквозные трейсы api → Postgres/Redis, метрики матчей | — |
| Ошибки | `getsentry/sentry-go` | Паники и 5xx с контекстом | — |
| UUID | `google/uuid` (v7) | Сортируемые ID для индексов | — |
| Тесты | `testing` + `stretchr/testify`, `testcontainers-go`, `mockery` | Интеграционные тесты на настоящих Postgres/Redis | — |
| Линтеры | `golangci-lint` (govet, staticcheck, errcheck, gosec, depguard, revive) | — | — |
| Нагрузка | k6 (+ xk6-websockets) | Сценарии REST и матчей | — |

Инфраструктура: PostgreSQL 16+ (managed, с PITR), Redis 7+ (managed, с репликой), ClickHouse (managed или один узел на старте), S3 + CDN, Kubernetes.

## 3. Структура репозитория

```
server/
  cmd/
    api/main.go             # REST + админ-API
    game/main.go            # WebSocket, подбор, матчи
    worker/main.go          # River-воркеры и cron
    tools/                  # validate-content, gen-daily, seed, loadbot
  internal/
    auth/ user/ content/ progress/ daily/ arena/ economy/ shop/ social/ events/ ads/ notify/ analytics/ config/ admin/
    engine/                 # Go-порт движка (чистый пакет) + тесты на packages/engine/vectors
    platform/               # общая инфраструктура
      db/ (pgxpool, tx helper)  redis/  httpx/ (middleware: auth, locale, version, rate limit, request id, recover)
      wsx/ (обвязка websocket)  observability/ (slog, otel, prometheus, sentry)  clock/ (интерфейс времени для тестов)
      i18n/ (серверные строки ошибок и push)  outbox/  idempotency/
  api/
    openapi.gen.go          # сгенерировано из contracts/openapi.yaml
  db/
    migrations/             # goose, 0001_init.sql …
    queries/                # *.sql для sqlc (по модулям)
    sqlc.yaml
  deploy/
    helm/ (api, game, worker)  docker/ (Dockerfile distroless)  k6/
  Makefile                  # gen, lint, test, migrate, run
```

Сборка — один Docker-образ (multi-stage, distroless) с тремя бинарниками; в Kubernetes запускаются три Deployment с разными `command`.

## 4. Данные

Полный список таблиц — во вкладке «Продукт», раздел 10.2. Здесь — правила и ключевые схемы.

### 4.1 Кошелёк и журнал (пример DDL)

```sql
CREATE TABLE wallets (
  user_id   uuid PRIMARY KEY REFERENCES users(id),
  emeralds  bigint NOT NULL DEFAULT 0 CHECK (emeralds >= 0),
  coins     bigint NOT NULL DEFAULT 0 CHECK (coins >= 0),
  version   bigint NOT NULL DEFAULT 0
);

CREATE TABLE wallet_ledger (
  id              uuid PRIMARY KEY,            -- uuid v7
  user_id         uuid NOT NULL REFERENCES users(id),
  currency        text NOT NULL CHECK (currency IN ('emerald','coin')),
  delta           bigint NOT NULL,
  balance_after   bigint NOT NULL,
  reason          text NOT NULL,               -- level_reward, purchase, ad_reward, admin_grant…
  ref_id          text,                        -- id покупки / матча / попытки
  idempotency_key text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, idempotency_key)
);
CREATE INDEX ON wallet_ledger (user_id, created_at DESC);
```

Изменение баланса: `BEGIN` → `INSERT INTO wallet_ledger … ON CONFLICT (user_id, idempotency_key) DO NOTHING RETURNING id` (пусто = дубль, вернуть прошлый результат) → `UPDATE wallets SET coins = coins + $delta, version = version + 1 WHERE user_id = $1 AND coins + $delta >= 0` (0 строк = не хватает) → `COMMIT`. Уровень изоляции — Read Committed, условный `UPDATE` защищает от гонок.

### 4.2 Индексы и партиции

| Таблица | Индексы / партиции |
| --- | --- |
| `users` | unique `lower(nickname)`, `friend_code` unique |
| `identities` | unique `(provider, subject)` |
| `attempts` | PK `id` (attemptId клиента — идемпотентность), `(user_id, created_at)`; партиции по месяцу, хранение 180 дней |
| `daily_results` | PK `(date, user_id)`, `(date, ranked, moves, duration_ms)` для рейтинга |
| `level_progress` | PK `(user_id, level_id)` |
| `arena_profiles` | `(season_id, trophies DESC)` |
| `arena_maps` | `(format, active, user_id)`; `(format, active, benchmark_moves)` для асинхрона |
| `matches` | `(p1, ended_at DESC)`, `(p2, ended_at DESC)`; партиции по месяцу |
| `match_moves` | PK `(match_id, turn, player)`; партиции по месяцу, хранение 180 дней |
| `inventory` | PK `(user_id, item_id)` |
| `catalog_items` | `(status, available_from, available_to)` |
| `friends` | PK `(user_id, friend_id)`, `(friend_id, status)` |
| `ad_rewards` | unique `(network, ssv_tx_id)` |
| `outbox` | `(processed_at NULLS FIRST, id)` |

### 4.3 Правила

- Все ID — UUID v7; время — `timestamptz` в UTC; деньги и валюты — `bigint`.
- Каждая операция, меняющая несколько таблиц (покупка, итог матча, награда), — одна транзакция + запись в `outbox`.
- Миграции обратно совместимые: expand → деплой кода → backfill → contract. Индексы — `CREATE INDEX CONCURRENTLY`. Миграции запускает отдельный Job до деплоя.
- Удаление аккаунта: через 30 дней персональные данные стираются (ник → `deleted_xxxx`, identities и push-токены удаляются), агрегаты матчей и журнал валюты остаются обезличенными.
- Реплика на чтение — для админских отчётов и тяжёлых выборок (история матчей).

## 5. Redis: ключи и структуры

Redis — только для быстрых и восстанавливаемых данных: потеря Redis не теряет прогресс и валюту (источник истины — Postgres).

| Ключ | Тип | TTL | Назначение |
| --- | --- | --- | --- |
| `mm:queue:{format}` | Sorted set (score = кубки) | — | Очередь подбора |
| `mm:ticket:{userId}` | Hash (format, trophies, joinedAt, region, mapId, node) | 120 с | Билет в очереди |
| `match:{id}:snapshot` | String (JSON) | 1 ч | Снапшот матча после каждого хода (восстановление при падении ноды) |
| `match:{id}:owner` | String (id ноды game) | 1 ч, продлевается | Маршрутизация реконнекта на нужную ноду |
| `user:{id}:active_match` | String | 1 ч | Запрет второго матча / поиска |
| `presence:{userId}` | String (online / in\_match) | 60 с, продлевается heartbeat | Статус для друзей |
| `challenge:{id}` | Hash | 60 с | Вызов друга |
| `lb:weekly:{yyyy-ww}` | Sorted set | 14 дней | Недельный лидерборд (ZINCRBY после матча) |
| `lb:weekly:{yyyy-ww}:{country}` | Sorted set | 14 дней | Срез по стране |
| `lb:season:{id}` | Sorted set | до конца сезона + 7 дней | Сезонный лидерборд (зеркало `arena_profiles`, перестраивается из БД) |
| `lb:daily:{date}` | Sorted set (score = moves · 10⁸ + duration\_ms) | 3 дня | Дневной лидерборд |
| `rl:{scope}:{key}` | redis\_rate (GCRA) | — | Rate limit по пользователю / IP / эндпоинту |
| `limit:{userId}:{kind}:{date}` | Counter | 48 ч | Дневные лимиты (реклама, продолжения, защита карты) — быстрая проверка, истина — в БД |
| `cache:catalog:{locale}` | String | 60 с | Кэш каталога витрины |
| `cache:bootstrap:{platform}` | String | 30 с | Версии и remote config |
| Pub/Sub `node:{nodeId}` | Channel | — | Доставка событий на ноду, где сидит соединение игрока (вызовы, присутствие) |
| `conn:{userId}` | String (nodeId) | 60 с | На какой ноде соединение игрока |

Атомарность операций подбора (взять двух игроков из очереди и удалить их билеты) обеспечивается Lua-скриптами.

## 6. Игровой сервер

Каждый матч — отдельная горутина-актор с входящим каналом. Все изменения состояния матча происходят в одной горутине, поэтому блокировки не нужны, а логика тестируется с фейковыми часами.

### 6.1 Модель

```go
type Match struct {
    ID        uuid.UUID
    Format    Format
    Players   [2]*Player        // Player{UserID, Conn, Map (с целями и бомбами), Revealed, Found, Timeouts, SkipNext, IsBot}
    Turn      int
    Current   int               // индекс ходящего
    State     State             // Intro, Playing, FinalTurn, Ended, Annulled
    Deadline  time.Time
    inbox     chan Command      // Tap, Emote, Surrender, Connect, Disconnect, Resync, TimerFired
    clock     clock.Clock
}

func (m *Match) Run(ctx context.Context) {
    for {
        select {
        case cmd := <-m.inbox:  m.handle(cmd)       // правила из «Продукт» 5.4
        case <-m.turnTimer.C:   m.onTimeout()
        case <-ctx.Done():      m.annul("shutdown"); return
        }
        if m.State == Ended || m.State == Annulled { m.persist(); return }
    }
}
```

Обработка тапа: проверка очереди, номера хода и дедлайна (+300 мс) → `engine.ResolveTap(opponentMap, revealed, cell)` → обновление состояния → `match.tapResult` обоим → проверка победы / правила равных ходов → выбор следующего ходящего с учётом `SkipNext` (бомба) → новый таймер → снапшот в Redis → запись хода в буфер (сброс в `match_moves` в конце).

### 6.2 Соединения и маршрутизация

- Ноды `game` — StatefulSet, у каждой свой адрес (`game-0`, `game-1`, …). Общий вход `wss://game.pelenge.app/v1/ws` — для поиска, вызовов и присутствия (любая нода).
- Матч создаётся на наименее загруженной ноде. `match.found` содержит `endpoint` (`wss://game-3.pelenge.app/v1/match/{id}`) и одноразовый билет; клиенты подключаются к ноде матча напрямую.
- Реконнект: клиент снова идёт на `endpoint`; если нода недоступна — на общий вход с `matchId`; нода смотрит `match:{id}:owner` и отвечает актуальным `endpoint`.
- Доставка событий игроку на другой ноде (вызов друга, «соперник найден») — через `conn:{userId}` → Pub/Sub `node:{nodeId}`.

### 6.3 Отказоустойчивость

| Событие | Поведение |
| --- | --- |
| Плановый деплой | Нода получает SIGTERM → снимается с выбора для новых матчей → доигрывает текущие (`terminationGracePeriodSeconds` = 900; матч не дольше \~8 мин) → завершается |
| Падение ноды | Клиенты реконнектятся на общий вход; первая нода берёт `match:{id}:owner` (SET NX), поднимает актор из снапшота, текущему игроку даёт новые 5 с. Оба не вернулись за 30 с — аннуляция |
| Падение Redis | Новые матчи не создаются (поиск → «Временно недоступно»), текущие доигрываются без снапшотов |
| Падение Postgres в конце матча | Результат кладётся в River-задачу с ретраями (идемпотентно по `matchId`); игроки видят итог, кубки применяются позже |

### 6.4 Метрики игрового сервера

Активные соединения, активные матчи (по форматам), размер очередей и время ожидания (p50/p95), доля ботов, время обработки тапа, тайм-ауты, реконнекты, аннуляции, причины окончания матчей. Метрика активных соединений используется для автомасштабирования (HPA по custom metric).

## 7. Подбор соперника

1. Один лидер-матчмейкер на формат: нода `game` держит блокировку `mm:leader:{format}` (SET NX PX 5000, продлевается каждые 2 с).
2. Тик каждые 500 мс: читает билеты из `mm:queue:{format}`, сортирует по времени ожидания (дольше ждущие — первыми).
3. Для билета считается диапазон `R(wait) = min(400, 100 + 50 · ⌊wait / 5 с⌋)`. Пара допустима, если `|Δкубков| ≤ min(R₁, R₂)`, игроки не встречались в последних 2 матчах (`mm:recent:{userId}`) и не заблокировали друг друга.
4. Среди допустимых — ближайший по кубкам; при равенстве — тот же регион и меньший пинг.
5. Lua-скрипт атомарно удаляет оба билета (если кто-то уже ушёл — пара отменяется), создаётся матч на наименее загруженной ноде, игрокам уходит `match.found`.
6. Билет с ожиданием ≥ 20 с → матч с ботом на той же ноде (карта бота: 50% — случайная валидная, 50% — активная карта игрока с близкими кубками).
7. Повторное `queue.join` при активном билете или матче — ошибка `ALREADY_QUEUED` / `IN_MATCH`.

Параметры (стартовый диапазон, шаг, максимум, время до бота) — в remote config.

## 8. Бот-решатель

Один алгоритм в `engine` (Go и TS) используется для бота в PvP, «Проверить карту», нормы асинхронных карт и проверки лимита ходов уровней.

1. **Предрасчёт**: таблица расстояний между всеми парами проходимых клеток (Дейкстра из каждой клетки; для 9×9 — 81×81, доли миллисекунды).
2. **Гипотезы**: все наборы из k целей среди кандидатов (для 9×9 и 3 целей — до \~85 тыс., для 7×7 и 2 — до \~1,2 тыс.). Найденные цели фиксируются в гипотезах.
3. **Фильтрация** после каждого наблюдения `(клетка c, ответ v)`: оставляем гипотезы, для которых движок дал бы тот же ответ (число / курс / горячо-холодно). Клетка-бомба исключается из кандидатов в цели (ответа не даёт).
4. **Выбор хода**: если в какой-то клетке цель во всех гипотезах — тапнуть её. Иначе — клетка с максимальной ожидаемой информацией (энтропия распределения ответов по гипотезам) с бонусом за вероятность попасть в цель и штрафом за риск бомбы (бомбы распределены равномерно по неоткрытым не-целям).
5. **Сложность**: с вероятностью p (по лиге: Bronze 40%, Silver 30%, Gold 20%, Platinum 10%, Diamond+ 5%) ход выбирается случайно среди клеток, где цель возможна (а не совсем случайно — бот не должен выглядеть глупо). Время «раздумья» 1,2–4 с, 2% тайм-аутов.
6. **Норма карты / оценка**: среднее число ходов идеального бота (p = 0) по 32 прогонам с разным разрешением ничьих, с учётом попаданий на бомбы (+1 ход). Для уровней: `moveLimit ≥ ceil(1.2 · норма)`.
7. **Ограничения**: если гипотез > 200 тыс. (редактор уровней 9×9, 5 целей) — сэмплирование 20 тыс. случайных гипотез. Бюджет на ход — ≤ 20 мс на сервере.

## 9. Экономика

### 9.1 API модуля `economy`

```go
type Wallet interface {
    Grant(ctx context.Context, tx pgx.Tx, g Grant) (Balance, error)   // Grant{UserID, Currency, Amount, Reason, RefID, IdempotencyKey}
    Spend(ctx context.Context, tx pgx.Tx, s Spend) (Balance, error)   // ErrInsufficientFunds
    Balance(ctx context.Context, userID uuid.UUID) (Balance, error)
}
```

Все модули начисляют и списывают валюту только через этот интерфейс, внутри своей транзакции. Ключ идемпотентности строится детерминированно из причины: `level_reward:{userId}:{levelId}:{stars}`, `match_reward:{matchId}:{userId}`, `ad:{ssvTxId}`, `purchase:{clientKey}`.

### 9.2 Покупка (одна транзакция)

1. Проверить `Idempotency-Key` (таблица `idempotency_keys`: user, key, request\_hash, response, 24 ч) — повтор возвращает сохранённый ответ; тот же ключ с другим телом — 409.
2. Товар: `status = live`, окно продаж (с допуском 10 с после конца), страна, минимальная версия приложения.
3. Тираж: `UPDATE catalog_items SET sold = sold + 1 WHERE id = $1 AND (stock_limit IS NULL OR sold < stock_limit)`.
4. Владение: `INSERT INTO inventory … ON CONFLICT DO NOTHING` (уже есть — ответ `ALREADY_OWNED` без списания).
5. Цена набора пересчитывается на сервере с учётом имеющихся предметов (не ниже 30%), клиентская цена только сравнивается (расхождение → `PRICE_CHANGED`).
6. `Wallet.Spend` → `outbox(ItemPurchased)` → `COMMIT`.

### 9.3 Правила наград

Награды (за звёзды, дейли, серии, матчи, треки, рекламу, приглашения) — таблица в remote config (JSON со схемой), а не константы в коде. Изменение в админке действует на новые начисления. Ежедневный отчёт «источники / траты» строится из `wallet_ledger`.

### 9.4 Outbox

Таблица `outbox(id, type, payload jsonb, created_at, processed_at)`. Worker забирает пачки через `SELECT … FOR UPDATE SKIP LOCKED LIMIT 500` и рассылает подписчикам: аналитика (ClickHouse), лидерборды (Redis), токены событий, push. Обработчики идемпотентны (доставка at-least-once).

## 10. Авторизация и безопасность

| Область | Решение |
| --- | --- |
| Гость | `POST /auth/guest {deviceId, platform}` → новый user + identity `device`; лимит 3 гостевых аккаунта на deviceId в сутки |
| Apple / Google | Проверка подписи по JWKS (кэш 1 ч), `aud`, `iss`, `exp`, `nonce` (Apple); subject = `sub` |
| Токены | Access — JWT EdDSA, 15 мин, claims: `sub`, `sid`, `role`; refresh — случайные 32 байта, хранится хэш, 90 дней, ротация при каждом использовании; повторное использование старого refresh → отзыв всей сессии |
| Ключи | Ротация ключей подписи раз в 90 дней (`kid` в заголовке, два активных ключа) |
| Админка | Отдельная таблица `admin_users`, пароль (argon2id) + TOTP, сессия в httpOnly-cookie, RBAC по ролям, allowlist IP, аудит каждого изменения |
| Rate limit | По пользователю и IP: общий 60 запр/мин, `/auth/*` 10/мин, `/shop/purchase` 10/мин, `/friends/search` 20/мин, WS-сообщения 10/с |
| Целостность клиента | App Attest / Play Integrity на наградных эндпоинтах (`attempts:batch`, `ads/intent`, регистрация гостя). Режим включается флагом: `off` / `log` / `enforce` |
| Античит | Пересчёт попыток движком, эвристики (время хода < 200 мс стабильно, невероятно мало ходов относительно нормы, бустинг между аккаунтами) → флаг в очередь модерации |
| Ввод данных | Валидация по OpenAPI (kin-openapi) + доменная валидация; SQL только через sqlc (параметризованные запросы); ники — фильтр стоп-слов RU/EN |
| Секреты | Kubernetes Secrets через External Secrets из менеджера секретов облака; в репозитории секретов нет (gitleaks в CI) |
| Транспорт | TLS 1.2+ на ingress, HSTS; CORS только для домена админки |
| Персональные данные | Минимум (см. «Продукт» 12.2); IP в логах — 14 дней; выгрузка данных по запросу — админ-команда |

## 11. Фоновые задачи (River)

Расписание — во вкладке «Продукт», раздел 10.6. Технические правила:

- Очереди: `default` (10 воркеров), `push` (20), `analytics` (5), `season` (1 — строго последовательно), `match_results` (10).
- Периодические задачи — River `PeriodicJobs` с уникальностью по интервалу (два воркера не запустят смену сезона дважды).
- Каждая задача идемпотентна: смена сезона обрабатывает игроков пачками по 1 000 с отметкой прогресса и может быть перезапущена с любого места.
- Ретраи: экспоненциальные, до 10 попыток; после — алерт и ручной перезапуск из River UI.
- Push-рассылки: одна задача на часовой пояс и тип; токены с ошибкой `Unregistered` / `BadDeviceToken` удаляются.
- Итог матча ставится задачей только при ошибке прямой записи (фолбэк).

## 12. Инфраструктура, деплой, наблюдаемость

### 12.1 Среда

| Компонент | Старт (до 50 тыс. DAU) | Масштабирование |
| --- | --- | --- |
| Kubernetes (managed) | 3 ноды по 4 vCPU / 8 ГБ | Автоскейлинг нод |
| `api` | 2–6 подов | HPA по CPU и RPS |
| `game` | 2–8 подов (StatefulSet) | HPA по числу соединений (цель \~3 000 на под) |
| `worker` | 1–3 пода | По длине очередей River |
| PostgreSQL | Managed, 4 vCPU / 16 ГБ, реплика, PITR 14 дней | Вертикально + реплики чтения |
| Redis | Managed, 2 ГБ, реплика | Вертикально |
| ClickHouse | 1 узел 4 vCPU / 16 ГБ | Шарды при росте |
| S3 + CDN | Ассеты витрины, контент, баннеры | — |

Регион: для игроков из РФ — российское облако (152-ФЗ). На MVP — один регион в РФ (Yandex Cloud, Москва), общий пул игроков. Персональные данные лежат в отдельных таблицах (identities, devices), чтобы после MVP их можно было вынести в регион ЕС для игроков из ЕС («Продукт» 12.6).

### 12.2 Деплой

- GitHub Actions: lint (`golangci-lint`) → unit → интеграционные (testcontainers) → тест-векторы движка → `sqlc diff` и `oapi-codegen` без изменений → сборка образа → push в registry → скан уязвимостей (Trivy).
- Деплой — Helm-чарты + Argo CD (GitOps). staging — автоматически из `main`; prod — по тегу с ручным подтверждением.
- Порядок релиза: Job миграций → `worker` → `api` (rolling) → `game` (по одному поду, с доигрыванием матчей).
- Каждый под: readiness/liveness-пробы, PodDisruptionBudget, graceful shutdown.

### 12.3 Наблюдаемость

- Логи: slog JSON → Loki (или облачный лог-сервис), с `request_id`, `user_id`, `match_id`.
- Метрики: Prometheus + Grafana. Дашборды: API (RPS, ошибки, p50/p95/p99 по эндпоинтам), игровой сервер (раздел 6.4), Postgres, Redis, River, экономика (начисления в минуту — аномалии).
- Трейсы: OpenTelemetry → Tempo / Jaeger, 10% сэмплинг + 100% ошибок.
- Алерты (в Telegram / Slack дежурного): 5xx > 1% 5 мин, p95 > 300 мс, ожидание подбора p95 > 30 с, аннуляции > 2%, резкий рост начислений валюты, очередь River > 10 000, репликация Postgres > 30 с, сертификаты < 14 дней.

## 13. Тестирование и нагрузка

| Вид | Что проверяем | Как |
| --- | --- | --- |
| Unit | Доменные правила: кубки, лиги, серии, награды, цена набора, лимиты бомб | `go test`, табличные тесты |
| Движок | Совпадение с TS по `packages/engine/vectors`, fuzz-тесты валидатора (случайные карты → валидные всегда связны) | `go test`, `testing.F` |
| Интеграционные | Репозитории, кошелёк при конкурентных списаниях (100 горутин), идемпотентность, тираж на границе, смена сезона, outbox | testcontainers (Postgres, Redis) |
| Матч | Все сценарии из вкладки «Сценарии»: тайм-ауты, бомбы, равные ходы, лимит 40, сдача, реконнект, восстановление из снапшота | Актор + фейковые часы + фейковые соединения |
| Контракт | Ответы сервера соответствуют `openapi.yaml` | Schemathesis против staging |
| Нагрузка | 2 000 RPS на api (p95 < 150 мс); 10 000 одновременных матчей (20 000 WS), тап каждые 1–5 с; пик входа в очередь 500/с | k6 + xk6-websockets, боты-клиенты `cmd/tools/loadbot` |
| Хаос | Убийство пода `game` с активными матчами, рестарт Redis, фейловер Postgres | Ручные учения на staging перед релизом |
| Баланс | Бот против бота (100 тыс. матчей): винрейт первого хода 45–55%, влияние бомб, средняя длина матча по форматам | `cmd/tools/simulate` |

Покрытие: `engine`, `economy`, `arena/domain` — ≥ 90%; остальное — ≥ 70%. Падение покрытия в PR — предупреждение в CI.



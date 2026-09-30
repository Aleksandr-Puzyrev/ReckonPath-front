# Часть 6. Спецификация движка и контента

Эта вкладка — нормативная. Если текст в других вкладках расходится с псевдокодом здесь, прав псевдокод. TS (`@pelenge/engine`) и Go (`internal/engine`) реализуют его 1-в-1 и проходят одни и те же тест-векторы (раздел 9).

## 1. Модель данных

Клетки адресуются индексом `i = r · cols + c` (по строкам). Во внешних форматах (JSON, API) — пары `[r, c]`.

```ts
type Idx = number                                   // 0 … rows*cols-1
type CellKind = 'open' | 'stream' | 'heavy' | 'rock'
type EdgeKey = number                               // min(a,b) * 128 + max(a,b), a,b — соседние индексы

interface Board {
  rows: number; cols: number                        // 4–9
  kinds: CellKind[]                                 // длина rows*cols
  bridges: Set<Idx>                                 // только клетки kind = 'stream'
  fences: Set<EdgeKey>
  targets: Idx[]                                    // 1–5, скрыты от игрока
  bombs: Idx[]                                      // 0–5, скрыты от игрока
}

type ProbeMode = 'distance' | 'direction' | 'hotcold'
interface LevelRules {
  probeMode: ProbeMode; moveLimit: number | null; stars: [three: number, two: number] | null
  bombHint: boolean                                 // индикатор «Рядом бомба», по умолчанию true (раздел 2.4)
}

type Reveal =
  | { kind: 'distance'; value: number; heat: 'hot' | 'warm' | 'cold'; epoch: number; bombNear: boolean }
  | { kind: 'direction'; dir: 'N' | 'E' | 'S' | 'W'; epoch: number; bombNear: boolean }
  | { kind: 'hotcold'; cmp: 'warmer' | 'colder' | 'same' | 'none'; value: number; epoch: number; bombNear: boolean }
  | { kind: 'target'; bombNear: boolean }
  | { kind: 'bomb' }

interface GameState {
  board: Board; rules: LevelRules; dist: Int16Array  // таблица расстояний N×N (раздел 2.1)
  revealed: Map<Idx, Reveal>
  found: Set<Idx>; bombsHit: Set<Idx>
  movesUsed: number; bonusMoves: number; continued: boolean
  epoch: number                                     // +1 при каждой найденной цели (старые числа сереют)
  lastValue: number | null                          // для hotcold
  heatD: number                                     // масштаб для HOT/WARM/COLD (раздел 3.1)
  status: 'playing' | 'won' | 'lost'
}
```

Инварианты: `targets ∩ bombs = ∅`; цели и бомбы не на `rock`; каждый `bridge` — на `stream`; все не-`rock` клетки связны (раздел 6.1).

## 2. Пеленг и разрешение тапа

### 2.1 Стоимость и расстояния

```text
enterCost(i):
  rock            → ∞ (непроходимо)
  stream + bridge → 1
  stream          → 3
  heavy           → 2
  open            → 1
  (бомба и цель не меняют стоимость: стоимость определяется kind клетки)

neighbors(i): вверх, вправо, вниз, влево — в пределах поля,
              без ребра в fences и без rock

dijkstra(src): dist[src] = 0 (стоимость самой стартовой клетки НЕ учитывается),
  dist[n] = min(dist[n], dist[u] + enterCost(n)) для каждого n ∈ neighbors(u)

allPairs(board): dist[a][b] = dijkstra(a)[b] для всех проходимых a  — считается один раз при старте

probeValue(state, i) = min { dist[i][t] : t ∈ targets, t ∉ found }
```

Расстояние несимметрично: `dist[a][b] ≠ dist[b][a]`, если у a и b разная стоимость входа (цель на ручье). Используется всегда `dist[тап][цель]`. Целые числа, без float.

### 2.2 Тап в уровне (кампания, дейли, код, событие)

```text
applyTap(s, i) → (s', events[]):
  if s.status ≠ playing              → return (s, [])
  if kind(i) = rock                  → return (s, [blocked(i)])
  if i ∈ s.revealed                  → return (s, [alreadyRevealed(i)])

  if i ∈ bombs:
     s.movesUsed += 2
     s.revealed[i] = {bomb}; s.bombsHit += i
     events += bomb(i, penalty=2)                 // lastValue НЕ меняется
  elif i ∈ targets:
     s.movesUsed += 1
     s.revealed[i] = {target, bombNear: bombNear(s, i)}
     s.found += i; s.epoch += 1; s.lastValue = null
     events += targetFound(i, left = |targets| − |found|)
     if |found| = |targets| → s.status = won; events += win(stars(s)); return
  else:
     s.movesUsed += 1
     s.revealed[i] = probe(s, i) + {bombNear: bombNear(s, i)}   // раздел 3
     events += reveal(i, s.revealed[i])

  if s.rules.moveLimit ≠ null and s.movesUsed ≥ limit(s):
     s.movesUsed = min(s.movesUsed, limit(s))     // счётчик не уходит в минус
     s.status = lost; events += lose()

limit(s) = s.rules.moveLimit + s.bonusMoves

bombNear(s, i) =
  s.rules.bombHint and ∃ n ∈ N4(i): n ∈ bombs and n ∉ s.bombsHit
// N4 — соседи по сетке вверх/вправо/вниз/влево внутри поля; заборы и стоимость клеток не учитываются

continueGame(s):                                  // +3 за рекламу или ◆
  require s.status = lost and s.continued = false
  s.bonusMoves += 3; s.continued = true; s.status = playing   // += : буи тоже пишут в bonusMoves
```

Порядок важен: проверка победы — раньше проверки лимита (последняя цель на последнем ходе = победа).

### 2.3 Тап в PvP

Та же функция с `moveLimit = null` и одним отличием: бомба не добавляет штрафный ход, а возвращает событие `bomb(i, skipNext=1)`. Пропуск и очередь ходов — в автомате матча (раздел 4.2). Режим подсказки в PvP всегда `distance`.

### 2.4 Индикатор «Рядом бомба»

`bombNear` считается один раз, в момент тапа, и больше не пересчитывается. Правила:

- Соседи — только N4 (без диагоналей). Забор на ребре не разрывает соседство.
- Взорванные бомбы (`bombsHit`) не считаются. Уже показанные значки после взрыва не снимаются.
- На самой бомбе значка нет: `Reveal.bomb` не содержит `bombNear`.
- `bombHint = false` → поле всегда `false`, клиент не рисует значок.
- PvP: `bombNear` считает сервер по карте соперника и отдаёт в `match.tapResult`; сами бомбы на клиент не уходят. Флаг арены — `arena.bombHint`.
- Бот и решатель хранят множество кандидатов в бомбы, совместимых со всеми `bombNear`, и выбирают тап по ожидаемой стоимости: `выигрыш информации − P(бомба) · штраф` (штраф = 2 хода в уровне, 1 пропуск в PvP). Норма уровней и асинхронных карт считается с учётом индикатора.

### 2.5 Фишки уровней: маяк, буй, туман, порядок

Расширение типов и изменения в applyTap. В PvP все четыре поля пустые или выключены.

```ts
interface Board {
  // … поля из раздела 1
  beacons: Idx[]            // 0–3, открыты с начала
  buoys: Idx[]              // 0–2, скрыты
  targetOrder: boolean      // true → targets[k] имеет номер k+1
}
interface LevelRules {
  // … поля из раздела 1
  fog: number | null        // сколько последних чисел видно (2–4), null = без тумана
}
```

```text
initGame(board, rules):
  s = … (как раньше)
  for b in board.beacons:                         // бесплатно, movesUsed не меняется
     s.revealed[b] = probe(s, b) + {bombNear: bombNear(s, b), beacon: true}
  // lastValue после маяков остаётся null: «горячо/холодно» сравнивает только тапы игрока

applyTap: новая ветка перед else
  elif i ∈ buoys:
     s.movesUsed += 1; s.bonusMoves += 3
     s.revealed[i] = probe(s, i) + {bombNear: bombNear(s, i), buoy: true}
     events += buoy(i, bonus=3)

probe при targetOrder:
  цель для расчёта = ненайденная цель с наименьшим номером (а не ближайшая)
  тап по цели вне очереди → обычная ветка target (найдена, epoch++), в Reveal пишется order = k+1

туман (fog = N):
  движок хранит все Reveal; представление показывает число/стрелку/сравнение только
  у N последних по времени клеток с пеленгом; маяки видны всегда; bombNear виден всегда
  серверная проверка попыток туман не учитывает — на результат он не влияет
```

Новые коды валидатора: `BEACON_ON_HIDDEN` (маяк на цели, бомбе или буе), `BEACON_ON_ROCK`, `BEACON_LIMIT` (> 3), `BUOY_OVERLAP` (буй на цели, бомбе или скале), `BUOY_LIMIT` (> 2), `FOG_RANGE` (N вне 2–4), `ORDER_SINGLE_TARGET` (порядок при одной цели), `FEATURE_IN_PVP` (любая фишка в контексте pvp). Код уровня: ключи `bc`, `by`, `fg`, `or`; старый декодер видит новые ключи → `CODE_NEWER`. Решатель считает норму с учётом маяков и порядка; буи в норму не входят (игрок может их не найти), туман норму не меняет, но снижает целевой % 3★ в 8.2 на 5 п.п.

## 3. Режимы подсказки

### 3.1 Число и HOT / WARM / COLD

Абсолютные пороги (≤ 2 / 3–4 / ≥ 5) не работают на больших полях с ручьями, поэтому пороги относительные:

```text
heatD  = max { probeValue(все цели не найдены, i) : i проходима }   // считается один раз при старте
hotMax  = max(2, ceil(0.20 · heatD))
warmMax = max(hotMax + 1, ceil(0.45 · heatD))
heat(v) = v ≤ hotMax ? hot : v ≤ warmMax ? warm : cold
```

На поле 5×5 без элементов (heatD ≈ 8) это даёт ≤ 2 / 3–4 / ≥ 5, как раньше; на 9×9 с ручьями (heatD ≈ 24) — ≤ 5 / 6–11 / ≥ 12.

### 3.2 Курс (direction)

```text
direction(s, i):
  cand = [ (d, n) for d, n in [(N,up),(E,right),(S,down),(W,left)] if n ∈ neighbors(i) ]
  best = argmin over cand of probeValue(s, n)      // при равенстве — первый в порядке N, E, S, W
  return best.d
```

Метрика соседа — пеленг **из** соседа, а не стоимость входа в него. Если у клетки нет ни одного соседа (невозможно при валидной карте с ≥ 2 проходимыми клетками), — ошибка валидации.

### 3.3 Горячо / холодно

```text
hotcold(s, i):
  v = probeValue(s, i)
  cmp = s.lastValue = null ? none : v < s.lastValue ? warmer : v > s.lastValue ? colder : same
  s.lastValue = v
  return { cmp, value: v }       // value хранится, но игроку не показывается
```

- Первый тап и первый тап после находки цели — `none` («—»).
- Бомба не меняет `lastValue`: сравнение идёт с последним тапом, давшим ответ.

### 3.4 Устаревшие ответы

Ответ с `epoch < s.epoch` рисуется серым и без обводки HOT/WARM/COLD: он был посчитан с учётом уже найденной цели. Заново не пересчитывается.

## 4. Конечные автоматы

### 4.1 Уровень

| Состояние | Событие | Условие | Новое состояние | Побочные эффекты |
| --- | --- | --- | --- | --- |
| `ready` | первый тап | — | `playing` | старт таймера партии (для дейли), `level_start` |
| `playing` | тап | раздел 2.2 | `playing` / `won` / `lost` | сохранение в MMKV после каждого тапа |
| `playing` | пауза / сворачивание | — | `paused` | — |
| `paused` | продолжить | — | `playing` | — |
| `lost` | продолжение (реклама / ◆) | `continued = false`, лимит рекламы или баланс | `playing` | `continue_used` |
| `won` / `lost` | финализация | — | `finished` | попытка в outbox, `level_end`, награды (прогноз) |
| любое | «Заново» | — | `ready` | новая попытка (новый attemptId) |

### 4.2 Матч

Состояние матча на сервере:

```text
turnsUsed[p]   // ходы игрока p, включая тайм-ауты и пропуски из-за бомбы
skip[p]        // сколько ходов p должен пропустить (бомбы)
timeoutsRow[p] // тайм-ауты подряд
current        // чей ход
MAX_TURNS = 40
```

Завершение хода игрока `p` (после тапа или тайм-аута):

```text
endTurn(p, outcome):
  turnsUsed[p] += 1
  if outcome = timeout: timeoutsRow[p] += 1; if timeoutsRow[p] = 3 → finish(winner = other(p), reason = afk)
  else: timeoutsRow[p] = 0
  if outcome = bomb: skip[p] += 1

  if found[p] = all targets:
     q = other(p)
     while turnsUsed[q] < turnsUsed[p]:
        if skip[q] > 0: skip[q] -= 1; turnsUsed[q] += 1       // пропуск съедает финальный ход
        else: state = finalTurn; current = q; startTimer(q); return
     finish(winner = p, reason = targets)

  if turnsUsed[A] ≥ MAX_TURNS and turnsUsed[B] ≥ MAX_TURNS:
     finish(winner = больше found, иначе draw, reason = turnLimit)

  next = other(p)
  while skip[next] > 0:                                     // не более 2 итераций: взаимные пропуски гасятся
     skip[next] -= 1; turnsUsed[next] += 1; emit turn(next, skipped = bomb)
     next = other(next)
  current = next; startTimer(next)

finalTurn: после хода q → если found[q] = all → draw, иначе winner = p
```

| Состояние | Событие | Новое состояние |
| --- | --- | --- |
| `created` | оба игрока подключились (или 5 с) | `intro` (3 с) |
| `intro` | таймер | `playing`, current = жребий (crypto/rand) |
| `playing` | tap / timeout | `playing` / `finalTurn` / `ended` |
| `playing` | surrender(p) | `ended`, winner = other(p) |
| `playing` | оба офлайн 30 с, падение ноды без восстановления | `annulled` |
| `finalTurn` | tap / timeout / surrender | `ended` |

Если один игрок не подключился за 5 с после `match.found`, матч стартует, и его ходы уходят в тайм-аут (→ AFK через 3 хода).

## 5. Формулы

Все константы — в remote config под указанными ключами; числа ниже — значения по умолчанию. Округление — математическое (half away from zero), одинаково в TS и Go.

### 5.1 Звёзды

```text
stars(s) = s.continued ? 1 : s.movesUsed ≤ rules.stars[0] ? 3 : s.movesUsed ≤ rules.stars[1] ? 2 : 1
```

### 5.2 Кубки (`rating.*`)

```text
Δ = trophies(соперник) − trophies(я)                    // на момент старта матча
win  = +clamp(round(30 + Δ / 25), 10, 50)              // сильнее соперник → больше за победу
loss = −clamp(round(30 − Δ / 25), 10, 50)              // сильнее соперник → меньше потеря
draw = clamp(round(Δ / 50), −5, 5)

modifiers:
  матч с ботом или асинхрон   → × 0.5, round
  дружеский матч                → 0
  поражение в Bronze             → max(loss, −15)
newTrophies = max(0, max(t + δ, seasonFloor))             // seasonFloor = нижняя граница лиги, достигнутой в сезоне
```

Пример: я 2 640, соперник 2 740 → Δ = 100 → победа +34, поражение −26, ничья +2.

### 5.3 Лиги и дивизионы

```text
league(t): Bronze [0, 800) · Silver [800, 2000) · Gold [2000, 3200) · Platinum [3200, 4400) · Diamond [4400, 5600) · Master [5600, ∞)
division(t) = III, II, I — трети диапазона лиги: floor((t − min) / ((max − min) / 3)); Master — без дивизионов
сброс в конце сезона: t > 2000 → 2000 + floor((t − 2000) / 2); иначе t без изменений
```

### 5.4 RP и сезонный трек

```text
rp: победа 10, ничья 4, поражение 3; бот / асинхрон → ceil(× 0.5); дружеский → 0
ступень трека каждые 50 RP, 30 ступеней (1 500 RP ≈ 110 матчей за 28 дней при 50% побед)
```

### 5.5 XP и уровень аккаунта

```text
xp: первая победа в уровне 10, повторная 2, дейли 15, матч 5, победа в матче +5
xpToNext(level) = 50 + 25 · (level − 1)                // 1→2: 50, 10→11: 275, 30→31: 775
```

## 6. Валидатор и генераторы

### 6.1 Валидатор

`validate(board, rules, context) → ValidationError[]` — возвращает все ошибки, а не первую. `context` = `campaign` | `custom` | `pvp(format)` | `daily`.

| Код | Проверка | Данные ошибки |
| --- | --- | --- |
| `SIZE` | rows, cols ∈ \[4, 9\]; в pvp — равны размеру формата | — |
| `OUT_OF_BOUNDS`, `DUPLICATE` | Координаты внутри поля, без повторов | cells |
| `FENCE_NOT_ADJACENT` | Забор между соседними клетками | edge |
| `NOT_CONNECTED` | BFS по проходимым клеткам с учётом заборов покрывает все не-rock | отрезанные cells |
| `TARGET_COUNT` | 1–5; в pvp — ровно по формату | expected, actual |
| `TARGET_ON_ROCK`, `BOMB_ON_ROCK`, `BOMB_ON_TARGET` | Инварианты раздела 1 | cells |
| `BRIDGE_NOT_ON_STREAM` | Мост только на ручье | cells |
| `TOO_MANY_BOMBS` | bombs ≤ min(5, floor(проходимые / 12)) и ≤ лимита формата | max |
| `TOO_MANY_ROCKS` | rocks ≤ 25% клеток | max |
| `ELEMENT_LIMIT` | pvp: лимиты формата по каждому элементу | element, max |
| `TRIVIAL` | pvp/custom: норма бота ≥ 3 хода (карта не решается «сразу») | norm |
| `MOVE_LIMIT` | campaign/daily: moveLimit ≥ ceil(1.2 · норма); stars\[0\] ≤ stars\[1\] ≤ moveLimit | norm |

### 6.2 Детерминированный ГПСЧ

`seed = FNV-1a-32(utf8(key))`, далее **mulberry32** на uint32 (как в текущем daily.js). В Go — та же арифметика на `uint32` с переполнением. `randInt(a, b)` = `a + floor(rng() · (b − a + 1))`. Первые 10 чисел для ключа `"2026-09-26"` фиксируются в тест-векторах.

### 6.3 Генератор дейли

```text
generateDaily(dateKey):
  tier = min(20, 1 + floor(daysSince(EPOCH, dateKey) / 7))
  for attempt in 0..49:
     rng = mulberry32(FNV(dateKey + "#" + attempt))
     board = buildByTier(rng, tier)            // таблица ниже
     if validate(board, context=daily) = []:
        norm = botNorm(board, probeMode)
        return level(board, moveLimit = ceil(1.3 · norm), stars = [ceil(norm), ceil(1.15 · norm)])
  return fallbackLevel(dateKey)                 // фиксированный набор из 30 ручных уровней
```

| Тиры | Поле | Цели | Заборы (линии с проходом) | Ручьи | ×2 | Скалы | Мосты | Бомбы | Режим |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1–2 | 5×5 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | число |
| 3–4 | 6×6 | 1 | 1 | 0–1 линия | 0 | 0 | 0 | 0 | число |
| 5–7 | 6×6 – 7×7 | 1–2 | 1 | 1 | 0–1 | 0 | 0 | 1 | число |
| 8–10 | 7×7 | 2 | 1–2 | 1 | 1–2 | 1–3 | 0 | 1–2 | число / курс |
| 11–14 | 7×7 – 8×8 | 2 | 2 | 1–2 | 1–2 | 2–4 | 1 | 2 | любой |
| 15–20 | 8×8 – 9×9 | 2–3 | 2 | 2 | 2–3 | 3–6 | 1–2 | 2–3 | любой |

Суббота и воскресенье: поле +1 к размеру тира и +1 цель. Заборы строятся только хелперами «линия с одним проходом» (как в текущем levels.js), чтобы не отрезать области.

### 6.4 Случайная PvP-карта (RANDOM, карта бота)

Для каждого элемента количество = randInt(0, floor(0.7 · лимита формата)); цели — ровно по формату, не ближе 2 ходов друг к другу. Принимается карта с нормой бота в диапазоне \[0.8, 1.3\] × медиана норм карт формата (медиана пересчитывается раз в сутки и приходит в remote config). До 30 попыток, иначе — лучшая из них.

## 7. JSON-схемы

Схемы хранятся в `contracts/schemas/*.schema.json` (JSON Schema 2020-12); zod-схемы и Go-структуры генерируются из них.

### 7.1 Уровень (`level.schema.json`)

```json
{
  "$id": "level/v2", "type": "object",
  "required": ["v", "id", "rows", "cols", "targets", "probeMode"],
  "properties": {
    "v": { "const": 2 },
    "id": { "type": "string", "pattern": "^(c|d|e|u)-[a-z0-9-]{1,40}$" },
    "title": { "type": "object", "properties": { "ru": { "type": "string", "maxLength": 40 }, "en": { "type": "string", "maxLength": 40 } } },
    "world": { "type": "integer", "minimum": 1, "maximum": 8 },
    "rows": { "type": "integer", "minimum": 4, "maximum": 9 },
    "cols": { "type": "integer", "minimum": 4, "maximum": 9 },
    "targets": { "$ref": "#/$defs/cells", "minItems": 1, "maxItems": 5 },
    "bombs":   { "$ref": "#/$defs/cells", "maxItems": 5 },
    "streams": { "$ref": "#/$defs/cells" },
    "bridges": { "$ref": "#/$defs/cells" },
    "heavy":   { "$ref": "#/$defs/cells" },
    "rocks":   { "$ref": "#/$defs/cells" },
    "fences":  { "type": "array", "items": { "type": "array", "items": { "$ref": "#/$defs/cell" }, "minItems": 2, "maxItems": 2 } },
    "probeMode": { "enum": ["distance", "direction", "hotcold"] },
    "moveLimit": { "type": ["integer", "null"], "minimum": 1, "maximum": 99 },
    "stars": { "type": ["array", "null"], "items": { "type": "integer" }, "minItems": 2, "maxItems": 2 },
    "introduces": { "enum": [null, "fence", "stream", "multi", "bomb", "rock", "heavy", "bridge", "direction", "hotcold"] }
  },
  "$defs": {
    "cell":  { "type": "array", "items": { "type": "integer", "minimum": 0, "maximum": 8 }, "minItems": 2, "maxItems": 2 },
    "cells": { "type": "array", "items": { "$ref": "#/$defs/cell" }, "uniqueItems": true }
  }
}
```

Префиксы id: `c-` кампания, `d-` дейли, `e-` событие, `u-` пользовательский. Семантические правила (связность и т.д.) проверяет валидатор из раздела 6.1, схема — только форму.

Поле правил `bombHint: boolean` (по умолчанию `true`) хранится рядом с `probeMode`. В коде уровня это ключ `bh`; если ключа нет (в том числе в PELENG1), считается `true`.

### 7.2 Код уровня

```text
code = "PELENG2-" + base64url(deflateRaw(utf8(JSON.stringify(compact(level))))) + "-" + crc8(payload)
compact: { v, n: title, r: rows, c: cols, t: targets, b: bombs, s: streams, g: bridges, h: heavy, k: rocks, f: fences, m: probeMode, l: moveLimit, x: challenge }
```

Декодер принимает и `PELENG1-` (формат прототипа: `w` → fences, `k` → streams). Максимум 600 символов; неверный crc → `CODE_INVALID`, `v` больше поддерживаемого → `CODE_NEWER`.

### 7.3 Скин поля (`skin.schema.json`, сокращённо)

```json
{
  "id": "neon_signal_field", "type": "FIELD", "version": 3, "minAppVersion": "1.2.0", "themes": "both",
  "light": {
    "frame":  { "gradient": ["#183E52", "#081F2F"], "angle": 145 },
    "cell":   { "stops": ["#DFF8FA", "#BFE4EA", "#8EC8D2"], "highlight": 0.38, "radiusPct": 22, "texture": "textures/cell.webp" },
    "number": "#103044",
    "elements": { "stream": "elements/stream.svg", "fence": "elements/fence.svg" }
  },
  "dark": { "…": "те же поля" },
  "fx": { "click": "fx/click.json" }
}
```

### 7.4 Remote config (ключевые ключи)

| Ключ | Тип | По умолчанию |
| --- | --- | --- |
| `arena.formats` | массив {league, size, targets, limits, turnSec} | таблица «Продукт» 5.2 |
| `arena.maxTurns` | int | 40 |
| `arena.botAfterSec` / `asyncAfterSec` | int | 20 / 10 |
| `mm.startRange` / `step` / `stepSec` / `maxRange` | int | 100 / 50 / 5 / 400 |
| `rating.base` / `divisor` / `min` / `max` / `bronzeLossCap` | int | 30 / 25 / 10 / 50 / 15 |
| `rewards.*` | объект | «Продукт» 3.6, 4.4, 5.8, 6.7 |
| `ads.interstitial.everyN` / `minIntervalSec` / `minLevel` | int | 3 / 180 / 10 |
| `ads.rewarded.dailyLimit.*` | объект | continue 2, gems 5, double 5 |
| `continue.gemPrice` / `bonusMoves` | int | 15 / 3 |
| `streak.restoreGemPrice` / `restoreCooldownDays` | int | 30 / 7 |
| `heat.hotPct` / `warmPct` | number | 0.20 / 0.45 |
| `features.*` | bool | фичефлаги (events, friends, asyncMatch, integrityEnforce) |
| `arena.formats[].turnSec` | int | 5×5 → 5, 7×7 → 7, 9×9 → 10 |
| `arena.bombHint / levels.bombHintDefault` | bool | true / true |
| `arena.botLabel` | bool | true (подпись «Тренировочный соперник») |

## 8. Левел-дизайн и кривая сложности

### 8.1 Принципы

1. **Одна новая идея за раз.** Новый элемент вводится тройкой уровней: **показ** (элемент очевидно влияет на число, поле маленькое, запас ходов большой) → **проверка** (без элемента не решить) → **поворот** (элемент в сочетании с уже известными).
2. **Первое число информативно.** Любой первый тап должен отсекать не меньше 40% кандидатов (проверяет скрипт контента).
3. **Бомбы — риск, а не лотерея.** Не ставить бомбу в клетку, которую бот выбирает первым ходом; на уровнях обучения бомбы — в зонах, куда логика не ведёт.
4. **Запас ходов уменьшается плавно** (таблица 8.2) — без резких «стен»; после сложного уровня — лёгкий (ритм «пилой»).
5. **Последний уровень мира — «экзамен»** мира: сочетание всего изученного.

### 8.2 Кривая по мирам

| Мир | Поле | Цели | Запас ходов (moveLimit / норма) | Целевой % побед с 1-й попытки | Целевой % 3★ |
| --- | --- | --- | --- | --- | --- |
| 1 | 4×4 – 5×5 | 1 | 2.0 → 1.6 | 90% | 60% |
| 2 | 5×5 – 6×6 | 1 | 1.7 → 1.5 | 85% | 50% |
| 3 | 6×6 | 1 | 1.6 → 1.45 | 80% | 45% |
| 4 | 6×6 – 7×7 | 2–3 | 1.55 → 1.4 | 75% | 40% |
| 5 | 7×7 | 1–2 | 1.5 → 1.35 | 70% | 35% |
| 6 | 7×7 | 1–2 | 1.45 → 1.3 | 65% | 30% |
| 7 | 7×7 – 8×8 | 2 | 1.4 → 1.25 | 55% | 25% |
| 8 | 8×8 – 9×9 | 2–3 | 1.35 → 1.2 | 45% | 20% |

Пороги звёзд: `stars[0] = ceil(норма)`, `stars[1] = ceil(1.15 · норма)`.

### 8.3 Процесс и контроль

- Уровни создаются в редакторе админки (тот же движок) и хранятся в `packages/content`.
- Скрипт `pnpm content:check` для каждого уровня считает: валидность, норму бота, запас ходов, информативность первого тапа — и строит график кривой для 100 уровней. Отклонение от таблицы 8.2 больше 10% — предупреждение в CI.
- Плейтест: каждый мир проходят 5 тестеров без подсказок; уровни с победой с первой попытки ниже цели на 15+ п.п. переделываются.
- После запуска — отчёт «Воронка кампании» в админке; уровни с оттоком выше соседних в 2 раза балансируются пакетом контента без релиза.

**Производство 100 новых уровней.** Уровни прототипа не переносятся: из них берутся только тест-векторы расстояний. На уровень закладывается 2–3 часа (проект, сборка, правки после плейтеста), всего ≈ 7 недель геймдизайнера. Порядок: миры 1–2 (24 уровня) к концу этапа 1 для первого плейтеста; миры 3–5 — этапы 2–3; миры 6–8 — этапы 4–5; баланс всех 100 — этап 6. Каждый мир оформляется карточкой: фишки, тройки ввода, экзамен, целевые цифры из 8.2.

## 9. Тест-векторы

Файлы `packages/engine/vectors/*.json`. Каждый вектор — уровень + последовательность действий + ожидаемые события и итоговое состояние. TS-тесты (Jest) и Go-тесты читают одни и те же файлы.

```json
{
  "name": "bomb-on-last-move-loses",
  "level": { "v": 2, "id": "u-test", "rows": 4, "cols": 4, "targets": [[3,3]], "bombs": [[0,3]], "probeMode": "distance", "moveLimit": 2, "stars": [1, 2] },
  "actions": [ { "tap": [0,0] }, { "tap": [0,3] } ],
  "expect": {
    "events": [
      { "type": "reveal", "cell": [0,0], "value": 6, "heat": "cold" },
      { "type": "bomb", "cell": [0,3], "penalty": 2 },
      { "type": "lose" }
    ],
    "state": { "movesUsed": 2, "status": "lost" }
  }
}
```

Обязательный набор (≥ 60 векторов):

| Группа | Что покрывает |
| --- | --- |
| Расстояния | Пустое поле; забор с обходом; ручей дешевле обхода и дороже; мост; ×2; скалы; цель на ручье (несимметрия); несколько целей |
| Тапы | Повторный тап; скала; бомба в середине / на предпоследнем / на последнем ходе; последняя цель на последнем ходе; продолжение и второе поражение; маяк рядом с бомбой; буй на последнем ходе (лимит растёт до проверки поражения); буй + продолжение; порядок: цель №2 найдена раньше №1; туман не меняет состояние; bombNear: бомба сбоку (true) / по диагонали (false) / за забором (true) / уже взорвана (false) / на найденной цели / bombHint = false |
| Режимы | HOT/WARM/COLD на 5×5 и 9×9; курс с ничьей; курс у забора; hotcold: первый тап, после бомбы, после находки цели |
| Звёзды | Границы 3★/2★/1★; после продолжения; с бомбой |
| Матч | Пропуск за бомбу; взаимные пропуски; финальный ход → ничья / победа; финальный ход съеден пропуском; 3 тайм-аута; лимит 40 |
| Формулы | Кубки (Δ = −500, −1, 0, 100, 1000), Bronze-cap, пол лиги, бот ×0.5, сброс сезона, дивизионы на границах |
| ГПСЧ и дейли | 10 чисел mulberry32; уровни дейли для 5 дат (включая выходные и тир 20) |
| Валидатор | По одному негативному вектору на каждый код ошибки |
| Коды | PELENG1 → v2; круговой encode/decode; повреждённый crc; более новая версия |



# Часть 5. Тексты интерфейса (RU / EN)

Здесь — базовый словарь строк. Он становится исходником `packages/i18n/ru.json` и `en.json`; дизайнер берёт тексты отсюда, а не придумывает в макете. Новые строки сначала попадают сюда, потом в макет и код.

## 1. Правила

- Ключ = `раздел.сущность.действие` латиницей: `home.play`, `arena.search.cancel`, `errors.INSUFFICIENT_FUNDS`.
- Переменные — в фигурных скобках `{{count}}`, `{{name}}`. Числа форматирует код по локали.
- Множественное число: RU — `_one` / `_few` / `_many`, EN — `_one` / `_other`. В таблицах ниже формы через «/».
- Кнопки — глагол или короткое действие (≤ 18 символов RU). Угадываемые слова вместо общих: «Играть», «Ещё бой», а не «ОК».
- UPPERCASE задаёт стиль, а не текст: в словаре строки в обычном регистре.
- Тон — как в «Креативном брифе», раздел 4.

## 2. Навигация, общие, онбординг

| Ключ | RU | EN |
| --- | --- | --- |
| `tabs.play` | Игра | Play |
| `tabs.levels` | Уровни | Levels |
| `tabs.arena` | Арена | Arena |
| `tabs.shop` | Витрина | Shop |
| `tabs.profile` | Профиль | Profile |
| `common.back` / `close` / `cancel` | Назад / Закрыть / Отмена | Back / Close / Cancel |
| `common.retry` | Повторить | Try again |
| `common.later` | Позже | Later |
| `common.offline` | Нет сети. Кампания и дейли работают без интернета | You’re offline. Campaign and daily work without internet |
| `common.updatedAt` | Обновлено {{time}} | Updated {{time}} |
| `home.eyebrow` | Текущая игра | Now playing |
| `home.level` | Уровень {{n}} | Level {{n}} |
| `home.moves` | {{count}} ход / хода / ходов | {{count}} move / moves |
| `home.play` | Играть | Play |
| `home.continue` | Продолжить | Continue |
| `home.campaignDone` | Кампания пройдена | Campaign complete |
| `home.today` | Сегодня | Today |
| `home.stats.streak` / `trophies` / `rank` | Серия / Кубки / Место | Streak / Trophies / Rank |
| `onboarding.tapCell` | Тапни по любой клетке | Tap any tile |
| `onboarding.number` | Число — сколько шагов до сигнала | The number is how many steps to the signal |
| `onboarding.closer` | Тапни ближе — число уменьшится | Tap closer — the number will drop |
| `onboarding.find` | Теперь найди сигнал сам | Now find the signal yourself |
| `onboarding.skip` | Пропустить | Skip |
| `onboarding.movesLimit` | На уровень даётся ограниченное число ходов. Чем меньше потратишь, тем больше звёзд | Each level has a move limit. Fewer moves, more stars |

## 3. Игра, уровни, элементы, дейли

| Ключ | RU | EN |
| --- | --- | --- |
| `levels.eyebrow` / `title` | Путь сигнала / Уровни | Signal path / Levels |
| `levels.editor` / `playCode` | Редактор / Играть по коду | Editor / Play a code |
| `levels.locked` | Сначала пройди уровень {{n}} | Beat level {{n}} first |
| `levels.worldLocked` | Пройди мир {{n}}, чтобы открыть | Finish world {{n}} to unlock |
| `levels.toCurrent` | К текущему | To current |
| `levels.starsRule` | 3★ — до {{a}} ходов, 2★ — до {{b}} | 3★ in {{a}} moves or fewer, 2★ in {{b}} |
| `play.hud.moves` / `targets` / `bombs` | Ходы / Цели / Бомбы | Moves / Signals / Bombs |
| `play.mode.distance` / `direction` / `hotcold` | Число / Курс / Горячо-холодно | Distance / Heading / Hot & cold |
| `play.probe.hot` / `warm` / `cold` | горячо / тепло / холодно | hot / warm / cold |
| `play.probe.warmer` / `colder` / `same` | теплее / холоднее / так же | warmer / colder / same |
| `play.last` | {{cell}} → {{value}} · {{heat}} | {{cell}} → {{value}} · {{heat}} |
| `play.flagMode` | Флажок | Flag |
| `play.found` | Сигнал найден! | Signal found! |
| `play.bomb` | Бум. Минус два хода | Boom. Two moves lost |
| `play.restartConfirm` | Начать заново? Ходы сбросятся | Restart? Your moves will reset |
| `play.pause.resume` / `restart` / `rules` / `exit` | Продолжить / Начать заново / Правила / К уровням | Resume / Restart / Rules / Back to levels |
| `result.win.title` | Сигнал найден | Signal found |
| `result.win.moves` | {{used}} из {{limit}} · лучший: {{best}} | {{used}} of {{limit}} · best: {{best}} |
| `result.win.record` | Новый рекорд! | New best! |
| `result.win.next` / `again` | Дальше / Ещё раз | Next / Play again |
| `result.double` | Удвоить монеты | Double coins |
| `result.lose.title` | Ходы закончились | Out of moves |
| `result.lose.found` | Найдено {{found}} из {{total}} | Found {{found}} of {{total}} |
| `result.continue.ad` | +3 хода за рекламу | +3 moves for an ad |
| `result.continue.gems` | +3 хода | +3 moves |
| `result.continue.note` | После продолжения — не больше 1★ | After continuing — 1★ max |
| `result.continue.left` | Осталось {{count}} сегодня | {{count}} left today |
| `rules.stream` | Ручей: шаг в него стоит 3. Путь в обход может быть короче | Stream: stepping in costs 3. Going around may be shorter |
| `rules.fence` | Забор стоит между клетками. Сигнал обходит его | A fence sits between tiles. The signal goes around it |
| `rules.bridge` | Мост через ручей: шаг стоит 1 | Bridge over a stream: a step costs 1 |
| `rules.heavy` | Мель (×2): шаг стоит 2 | Shallows (×2): a step costs 2 |
| `rules.rock` | Скала: сюда нельзя ни тапнуть, ни пройти | Rock: you can’t tap it or pass through it |
| `rules.bomb` | Бомба спрятана на поле. Тап по ней стоит 2 хода и не даёт пеленга. Сколько бомб — видно вверху | A bomb is hidden on the board. Tapping it costs 2 moves and gives no reading. The bomb count is shown at the top |
| `rules.bombNear` | Значок мины на открытой клетке — бомба в соседней клетке: сверху, снизу, слева или справа | A mine icon on an opened cell means a bomb is next to it: above, below, left or right |
| `game.bombNear.a11y` | рядом бомба | bomb nearby |
| `hud.bombsLeft` | Осталось бомб: {{count}} | Bombs left: {{count}} |
| `rules.beacon` | Маяк уже светит: число на нём показано бесплатно | The beacon is already lit: its reading is free |
| `rules.buoy` | На поле спрятан буй. Найдёшь — получишь +3 хода | A buoy is hidden on the board. Find it for +3 moves |
| `rules.fog` | Туман: видны только последние {{count}} числа. Ставь флажки, чтобы не забыть | Fog: only the last {{count}} readings stay visible. Use flags to remember |
| `rules.order` | Сигналы ищем по порядку: пеленг ведёт к следующему номеру | Find the signals in order: the reading points to the next number |
| `hud.buoysLeft` | Буёв: {{count}} | Buoys: {{count}} |
| `rules.multi` | Число показывает путь до ближайшего ненайденного сигнала | The number shows the path to the nearest unfound signal |
| `rules.direction` | Стрелка показывает, куда сигнал ближе | The arrow points toward the signal |
| `rules.hotcold` | Теплее или холоднее — по сравнению с прошлым тапом | Warmer or colder — compared to your last tap |
| `daily.title` | Пеленг дня | Daily bearing |
| `daily.next` | Новый через {{time}} | New one in {{time}} |
| `daily.done` | Сыграно: {{moves}} · #{{rank}} | Done: {{moves}} · #{{rank}} |
| `daily.replay` | Сыграть ещё (без награды) | Play again (no reward) |
| `daily.median` | В среднем {{count}} ход / хода / ходов | Average: {{count}} moves |
| `streak.days` | {{count}} день / дня / дней подряд | {{count}}-day streak |
| `streak.lost` | Серия {{count}} дней прервалась | Your {{count}}-day streak ended |
| `streak.restore` | Восстановить серию | Restore streak |
| `streak.weekly` | Восстановление — раз в неделю | Restore is available once a week |
| `daily.share` | Пеленг {{date}} · {{moves}} ходов · серия {{streak}} | PELENGE {{date}} · {{moves}} moves · streak {{streak}} |

## 4. Арена

| Ключ | RU | EN |
| --- | --- | --- |
| `arena.title` | Сигнал против сигнала. | Signal vs signal. |
| `arena.locked` | Пройди уровень 12, чтобы открыть арену | Beat level 12 to unlock the Arena |
| `arena.fight` | В бой | Fight |
| `arena.async` | Против карты | Vs a map |
| `arena.format` | {{size}} · {{count}} цели · {{sec}} с на ход | {{size}} · {{count}} signals · {{sec}}s per turn |
| `arena.myMap` | Моя карта | My map |
| `arena.botEstimate` | Бот решает за \~{{count}} ходов | Bot solves in \~{{count}} moves |
| `arena.defended` | Защита: {{count}} | Defended: {{count}} |
| `map.valid` | Карта в порядке | Map is valid |
| `map.err.isolated` | Клетки {{cells}} отрезаны заборами или скалами | Tiles {{cells}} are cut off by fences or rocks |
| `map.err.targets` | Нужно {{count}} цели | You need {{count}} signals |
| `map.err.limit` | Лимит: {{max}} | Limit: {{max}} |
| `map.err.bridge` | Мост ставится на ручей | Bridges go on streams |
| `map.random.confirm` | Заменить карту случайной? | Replace with a random map? |
| `map.unsaved` | Сохранить изменения? | Save changes? |
| `search.title` | Ищем соперника… | Finding an opponent… |
| `search.stopped` | Поиск остановлен | Search stopped |
| `vs.bot` | Тренировочный соперник | Practice opponent |
| `vs.first` | Первым ходит: {{name}} | {{name}} goes first |
| `match.yourTurn` | Твой ход | Your turn |
| `match.theirTurn` | Ход соперника | Opponent’s turn |
| `match.youSkip` | Ты пропускаешь ход — бомба | You skip a turn — bomb |
| `match.botLabel` | Тренировочный соперник | Training opponent |
| `match.botTrophies` | За матч с тренировочным соперником — половина кубков | Training matches give half trophies |
| `match.turnTime` | На ход: {{sec}} с | Turn time: {{sec}} s |
| `match.theySkip` | Ловушка сработала! Ходи ещё раз | Trap sprung! Go again |
| `match.finalTurn` | Финальный ход! | Final turn! |
| `match.turn` | Ход {{n}} / {{max}} | Turn {{n}} / {{max}} |
| `match.found` | сигналы {{found}}/{{total}} | signals {{found}}/{{total}} |
| `match.timeout` | Время вышло — ход пропущен ({{n}}/3) | Time’s up — turn skipped ({{n}}/3) |
| `match.timeoutWarn` | Ещё один пропуск — поражение | One more skip and you lose |
| `match.reconnecting` | Восстанавливаем связь… | Reconnecting… |
| `match.oppReconnecting` | Соперник переподключается | Opponent is reconnecting |
| `match.surrender.confirm` | Сдаться? Ты потеряешь {{count}} кубков | Give up? You’ll lose {{count}} trophies |
| `result.pvp.win` / `lose` / `draw` | Победа / Поражение / Ничья | Victory / Defeat / Draw |
| `result.pvp.reason.targets` | Все сигналы найдены за {{count}} ходов | All signals found in {{count}} moves |
| `result.pvp.reason.surrender` / `afk` / `turnLimit` / `annulled` | Сдача соперника / Соперник покинул матч / Лимит ходов / Матч отменён, кубки не изменились | Opponent gave up / Opponent left / Turn limit / Match cancelled, trophies unchanged |
| `result.pvp.again` | Ещё бой | Fight again |
| `league.up` / `down` | Новая лига: {{league}} / Ты в лиге {{league}} | New league: {{league}} / You’re in {{league}} |
| `season.ended` / `started` | Сезон {{n}} завершён / Сезон {{n}} начался | Season {{n}} ended / Season {{n}} started |
| `season.claim` | Забрать | Claim |

Правило для RU: о других игроках не используем глаголы прошедшего времени («нашёл / нашла», «сдался / сдалась») — пол игрока неизвестен. Формулировки безличные: «сигналы 1/2», «Сдача соперника», «{{name}} вызывает на дуэль» (настоящее время).

## 5. Витрина, экономика, профиль, друзья, настройки

| Ключ | RU | EN |
| --- | --- | --- |
| `shop.eyebrow` / `title` | Витрина / Собери свой сигнал. | Shop / Build your signal. |
| `shop.subtitle` | Косметика меняет поле, профиль и эффекты. Результат игры остаётся честным | Cosmetics change your board, profile and effects. The game stays fair |
| `shop.tabs.*` | Эксклюзив / Праздничное / Элементы / Поля / Наборы / Профиль / Эффекты | Exclusive / Holiday / Elements / Boards / Sets / Profile / Effects |
| `shop.hideOwned` | Скрыть купленное | Hide owned |
| `shop.drop.left` | Ещё {{time}} | {{time}} left |
| `shop.owned` / `equip` / `equipped` | В коллекции / Экипировать / Экипировано | Owned / Equip / Equipped |
| `shop.confirm` | Купить «{{item}}» за {{price}}? | Buy “{{item}}” for {{price}}? |
| `shop.bought` | Добавлено в коллекцию | Added to your collection |
| `shop.notEnough` | Не хватает {{amount}} | You need {{amount}} more |
| `shop.set.have` / `complete` | Уже есть / Собрано | Owned / Complete |
| `shop.soldOut` / `ended` | Тираж раскуплен / Предложение завершено | Sold out / Offer ended |
| `earn.title` | Как заработать | Ways to earn |
| `earn.ad` | Смотреть рекламу: +{{amount}} ({{left}}/{{max}} сегодня) | Watch an ad: +{{amount}} ({{left}}/{{max}} today) |
| `earn.adTomorrow` | Снова завтра | Back tomorrow |
| `earn.daily` / `arena` / `season` / `invite` | Пеленг дня / Победы на арене / Сезонный трек / Пригласи друга | Daily bearing / Arena wins / Season track / Invite a friend |
| `currency.emeralds` / `coins` / `trophies` | Изумруды / Монеты / Кубки | Emeralds / Coins / Trophies |
| `profile.level` | Ур. {{n}} | Lv {{n}} |
| `profile.friends` | Друзья · {{count}} · {{online}} онлайн | Friends · {{count}} · {{online}} online |
| `profile.stats.*` | Уровни / Звёзды / Победы / Пик кубков / Серия / Защита | Levels / Stars / Wins / Peak trophies / Streak / Defended |
| `profile.collection` / `moreInShop` | Коллекция / Ещё в витрине | Collection / More in the shop |
| `profile.saveProgress` | Сохрани прогресс | Save your progress |
| `profile.saveProgress.body` | Не потеряешь его при смене телефона и сможешь играть с друзьями | Keep it when you switch phones and play with friends |
| `nick.rules` | 3–16 символов: буквы, цифры, \_ | 3–16 characters: letters, digits, \_ |
| `nick.taken` / `invalid` / `banned` | Уже занято / Недопустимые символы / Недопустимое слово | Already taken / Invalid characters / Not allowed |
| `friends.title` / `requests` / `add` | Друзья / Заявки / Добавить | Friends / Requests / Add |
| `friends.myCode` / `copy` / `invite` | Мой код / Скопировать / Пригласить по ссылке | My code / Copy / Invite via link |
| `friends.status.online` / `inMatch` / `lastSeen` | Онлайн / В матче / В сети {{time}} | Online / In a match / Seen {{time}} |
| `friends.challenge` | Вызвать | Challenge |
| `friends.challenge.incoming` | {{name}} вызывает на дуэль · {{size}} | {{name}} challenges you · {{size}} |
| `friends.challenge.accept` / `decline` | Принять / Отклонить | Accept / Decline |
| `friends.challenge.noAnswer` | Друг не ответил | No answer |
| `friends.empty` | Играть с друзьями веселее | It’s more fun with friends |
| `settings.*` | Звуки / Музыка / Вибрация / Показывать координаты / Подтверждение тапа в PvP / Чужие скины в PvP / Высокий контраст поля / Тема / Язык | Sounds / Music / Haptics / Show coordinates / Confirm taps in PvP / Others’ skins in PvP / High-contrast board / Theme / Language |
| `settings.theme.*` | Светлая / Тёмная / Как в системе | Light / Dark / System |
| `settings.account.guest` | Гость | Guest |
| `settings.account.delete` | Удалить аккаунт | Delete account |
| `settings.account.deleteBody` | Удалятся прогресс, валюта, коллекция и друзья. Введи свой ник, чтобы подтвердить | Your progress, currency, collection and friends will be deleted. Type your nickname to confirm |
| `settings.account.deleteScheduled` | Аккаунт будет удалён {{date}}. Войди до этой даты, чтобы отменить | Your account will be deleted on {{date}}. Sign in before then to cancel |

## 6. Ошибки и системные сообщения

Ключи `errors.*` совпадают с кодами сервера («API-контракт», раздел 2). Текст ошибки объясняет, что случилось и что делать, без технических слов.

| Ключ | RU | EN |
| --- | --- | --- |
| `errors.generic` | Что-то пошло не так. Попробуй ещё раз | Something went wrong. Please try again |
| `errors.NETWORK` | Нет связи с сервером | Can’t reach the server |
| `errors.INSUFFICIENT_FUNDS` | Не хватает валюты | Not enough currency |
| `errors.ALREADY_OWNED` | Это уже в твоей коллекции | You already own this |
| `errors.OFFER_ENDED` / `SOLD_OUT` | Предложение завершено / Тираж раскуплен | Offer ended / Sold out |
| `errors.PRICE_CHANGED` | Цена изменилась — проверь и подтверди снова | The price changed — check and confirm again |
| `errors.LIMIT_REACHED` | На сегодня всё. Заходи завтра | That’s all for today. Come back tomorrow |
| `errors.MAP_INVALID` | Карту нужно исправить перед боем | Fix your map before the match |
| `errors.IN_MATCH` | У тебя уже идёт матч на другом устройстве | You have a match running on another device |
| `errors.QUEUE_UNAVAILABLE` | Поиск временно недоступен | Matchmaking is temporarily unavailable |
| `errors.CODE_INVALID` / `CODE_NEWER` | Неверный код / Код из более новой версии — обнови игру | Invalid code / This code needs a newer app version |
| `errors.FRIENDS_LIMIT` | Достигнут лимит друзей (200) | Friend limit reached (200) |
| `errors.RATE_LIMITED` | Слишком часто. Подожди немного | Too many tries. Wait a moment |
| `ads.unavailable` | Реклама сейчас недоступна | No ad available right now |
| `ads.rewardLater` | Награда придёт чуть позже | Your reward is on its way |
| `ads.att.title` | Помоги нам показывать подходящую рекламу | Help us show you relevant ads |
| `ads.att.body` | Игра бесплатна благодаря рекламе. Разрешение не даёт нам твои личные данные | The game is free thanks to ads. This doesn’t share your personal data with us |
| `push.prompt` | Напоминать о пеленге дня? | Remind you about the daily bearing? |
| `system.update.title` / `body` / `cta` | Доступна новая версия / Обнови игру, чтобы продолжить / Обновить | Update available / Update the game to continue / Update |
| `system.maintenance.title` / `body` / `cta` | Немного чиним антенну / Завершим примерно в {{time}} / Играть офлайн | Tuning the antenna / Back around {{time}} / Play offline |
| `system.banned.title` / `body` | Доступ ограничен / Причина: {{reason}}. До {{date}} | Access restricted / Reason: {{reason}}. Until {{date}} |
| `system.banned.appeal` | Обжаловать | Appeal |
| `system.crash` | Что-то сломалось. Перезапусти игру | Something broke. Please restart the game |

Тексты push — во вкладке «Экраны», раздел 13. Правовые тексты (политика конфиденциальности, условия) готовит юрист — это задача в бэклоге.



# Часть 8. Клиент: архитектура и стек (React Native)

## 1. Итоговое решение

Клиент — **Expo (новая архитектура RN, Hermes, dev client) + TypeScript**, структура по **Feature-Sliced Design**, игровая логика вынесена в чистый TS-пакет `@pelenge/engine`, поле рисуется на **Skia**, стили — **Unistyles 3** на токенах из Figma, анимации — **Reanimated 4**, серверные данные — **TanStack Query**, локальное состояние — **Zustand + MMKV**.

### 1.1 Почему так

| Решение | Почему | Что отбросили |
| --- | --- | --- |
| Expo + dev client, а не «голый» RN CLI | EAS Build/Submit/Update, config plugins вместо ручной правки натива, OTA-обновления, свои нативные модули через Expo Modules API (нужно для Yandex Ads) | RN CLI — больше ручной работы с Xcode/Gradle; Expo Go — нельзя свои нативные модули |
| Новая архитектура (Fabric, TurboModules) | Обязательна для Reanimated 4 и Unistyles 3, синхронный доступ к нативу, `boxShadow` на Android | Старая архитектура выводится из экосистемы |
| Feature-Sliced Design | Предсказуемая структура для 30+ экранов и нескольких разработчиков, запрет циклических зависимостей линтером | «Папки по типу» (components/, hooks/) — расползается на таком объёме |
| Движок — отдельный пакет без React | Тестируется изолированно, совпадает с Go по общим векторам, переиспользуется админкой; переносится из текущего engine.js | Логика в компонентах |
| Поле на Skia | Один canvas вместо 81 вью, скины — данные (цвета, текстуры, SVG-пути), частицы и волны в том же слое, 120 fps | Клетки как View — проще с доступностью, но хуже со скинами и эффектами (доступность решена оверлеем, раздел 8) |
| Unistyles 3 | Темы и варианты 1-в-1 как в Figma, смена темы без перерендера (C++-ядро), типизация | NativeWind, Tamagui, Restyle — сравнение в разделе 3 |
| TanStack Query + Zustand | Серверный кэш и локальное состояние разделены, минимум бойлерплейта, персист в MMKV | Redux Toolkit + RTK Query — тяжелее без выигрыша; MobX — неявная реактивность |

### 1.2 Слои клиента

```
Expo Router (app/)        — маршруты, тонкие обёртки над screens
  screens                 — композиция виджетов экрана
    widgets               — Board, MatchHud, ShopGrid, LevelList, SeasonTrack
      features            — tap-cell, place-element, purchase-item, equip, claim-reward, challenge-friend
        entities          — level, match, user, wallet, item, event, friend (модели + запросы + маленькие UI)
          shared          — ui-kit, theme, api, ws, storage, i18n, analytics, lib
@pelenge/engine           — чистая игровая логика (без React, без RN)
```

Импорты только сверху вниз; слайсы одного слоя не импортируют друг друга. Проверяется линтером в CI (раздел 5).

### 1.3 Принципы

1. **Offline-first для одиночной игры**: кампания, дейли, редактор не ждут сеть; сервер подтверждает постфактум.
2. **Server-authoritative для PvP и экономики**: клиент не знает целей соперника и не меняет баланс сам.
3. **Один источник стилей**: все цвета и размеры — из сгенерированных токенов, литералы цветов в коде запрещены линтером.
4. **UI-поток для анимаций**: никаких анимаций через `setState` и `Animated` из RN core.
5. **Типы из контрактов**: REST-типы генерируются из OpenAPI, WS-типы — из JSON Schema; ручных дублей нет.

## 2. Полный стек пакетов

Версии фиксируются на старте проекта по совместимости с текущим Expo SDK (`npx expo install` подбирает совместимые). Обновление SDK — раз в полгода отдельной задачей.

### 2.1 Основа

| Задача | Пакет | Зачем | Альтернатива (не берём) |
| --- | --- | --- | --- |
| Платформа | `expo` (последний стабильный SDK), `expo-dev-client` | Сборка, модули, dev client с нативными модулями | RN CLI |
| Язык | TypeScript strict + React Compiler (включён в Expo) | Автомемоизация, меньше ручных `useMemo` | — |
| Навигация | `expo-router` | Файловые маршруты, типизированные ссылки, deep links из коробки | React Navigation напрямую (Router построен на нём) |
| Стили | `react-native-unistyles` v3 | См. раздел 3 | NativeWind, Tamagui, Restyle |
| Градиенты, размытие | `expo-linear-gradient`, `expo-blur` | Геро-карточки, кнопки, шапка и таб-бар с blur | Рисовать всё в Skia |
| Иконки, SVG | `react-native-svg` + `react-native-svg-transformer` | SVG из Figma импортируются как компоненты с `currentColor` | Иконочные шрифты |
| Шрифты | `expo-font` (config plugin, шрифты вшиты в сборку) | Нет мигания шрифта при старте | Загрузка в рантайме |
| Картинки | `expo-image` | Кэш на диске, WebP, плейсхолдеры, предзагрузка ассетов витрины | `react-native-fast-image` (не поддерживается) |
| Списки | `@shopify/flash-list` v2 | Лидерборды, уровни, витрина без лагов | FlatList |
| Нижние листы | `@gorhom/bottom-sheet` v5 | Листы превью, паузы, итога, жесты, динамическая высота | Системные formSheet (меньше контроля над видом) |
| Safe area, клавиатура | `react-native-safe-area-context`, `react-native-keyboard-controller` | Отступы и плавное поднятие полей ввода | `KeyboardAvoidingView` |

### 2.2 Анимации и графика

| Задача | Пакет | Зачем |
| --- | --- | --- |
| Интерфейсные анимации | `react-native-reanimated` v4 + `react-native-worklets` | CSS-подобные анимации и переходы + worklets на UI-потоке, layout-анимации списков |
| Жесты | `react-native-gesture-handler` | Тап / долгий тап / свайп по полю и редактору, листы |
| Поле и эффекты | `@shopify/react-native-skia` | Отрисовка поля, частицы, волны, шейдеры скинов, перелив легендарок |
| Готовые анимации дизайнера | `lottie-react-native` | Взрыв, победа, лиги, эффекты-косметика (JSON с CDN) |
| Интерактивные анимации | `rive-react-native` | Радар поиска, анимированные аватары (state machine) |

### 2.3 Данные и сеть

| Задача | Пакет | Зачем | Альтернатива |
| --- | --- | --- | --- |
| Серверное состояние | `@tanstack/react-query` v5 + `@tanstack/query-async-storage-persister` (адаптер на MMKV) | Кэш, ретраи, инвалидация, офлайн-персист | RTK Query, SWR |
| Локальное состояние | `zustand` v5 (+ middleware `persist`, `immer`) | Простые сторы с селекторами, работают вне React (WS-клиент) | Redux, Jotai |
| Хранилище | `react-native-mmkv` | Синхронное, в \~30 раз быстрее AsyncStorage; прогресс, настройки, очередь | AsyncStorage |
| Секреты | `expo-secure-store` | Refresh-токен в Keychain / Keystore | — |
| REST-клиент | `openapi-typescript` (генерация типов) + `openapi-fetch` | Типы запросов и ответов из контракта Go, 6 КБ | axios + ручные типы, orval |
| WebSocket | Собственный клиент на нативном `WebSocket` (раздел 9) | Контроль над реконнектом, seq, синхронизацией часов | socket.io (не нужен, утяжеляет бэкенд) |
| Валидация данных | `zod` v4 | WS-сообщения, коды уровней, remote config, формы | yup, valibot |
| Формы | `react-hook-form` + `@hookform/resolvers/zod` | Ник, поиск друзей, поддержка | Ручной state |
| Сеть устройства | `@react-native-community/netinfo` | Офлайн-баннер, слив очереди, onlineManager для Query | — |
| Даты | `Intl` (Hermes) + `date-fns` | Таймеры, UTC-сутки, форматы RU/EN | moment |

### 2.4 Платформенные интеграции

| Задача | Пакет |
| --- | --- |
| Реклама (мир) | `react-native-google-mobile-ads` (AdMob + UMP-согласия + SSV) |
| Реклама (РФ) | Собственный Expo-модуль `modules/yandex-ads` над Yandex Mobile Ads SDK (Swift/Kotlin) |
| ATT (iOS) | `expo-tracking-transparency` |
| Push | `expo-notifications` (нативные токены APNs/FCM, отправка — с нашего Go-бэкенда) |
| Вход | `expo-apple-authentication`, `@react-native-google-signin/google-signin` |
| Звук | `expo-audio` (предзагрузка SFX в пул плееров) |
| Вибрация | `expo-haptics` |
| Экран не гаснет | `expo-keep-awake` |
| Поделиться / буфер | `Share` из RN, `expo-sharing` (картинка результата), `expo-clipboard` |
| Скриншот результата дейли | `react-native-view-shot` или `makeImageSnapshot` из Skia |
| Оценка в сторе | `expo-store-review` |
| Локаль, устройство, версия | `expo-localization`, `expo-device`, `expo-application` |
| Обновления | `expo-updates` (EAS Update) |
| Целостность приложения | App Attest (iOS) / Play Integrity (Android) через собственный Expo-модуль `modules/app-integrity` |
| Сплэш и иконки | `expo-splash-screen`, `expo-system-ui`, конфиг иконок в `app.config.ts` |

### 2.5 Качество и инструменты

| Задача | Пакет |
| --- | --- |
| Локализация | `i18next`, `react-i18next`, `i18next-parser` (извлечение ключей) |
| Ошибки и производительность | `@sentry/react-native` (+ загрузка source maps в EAS) |
| Линтеры | ESLint flat config: `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-compiler`, `eslint-plugin-boundaries` (правила FSD), запрет литералов цвета; Prettier |
| Git-хуки | `husky` + `lint-staged` |
| Юнит-тесты | `jest` + `jest-expo`, `@testing-library/react-native` |
| Моки API | `msw` |
| E2E | Maestro |
| Каталог компонентов | Storybook for React Native (on-device) |
| Перф-тесты Android | Flashlight |
| Монорепозиторий | pnpm workspaces + Turborepo |
| Токены | Style Dictionary (Figma JSON → TS-темы) |

## 3. Стили: Unistyles 3 + токены из Figma

Рекомендация — **react-native-unistyles v3**. Она даёт темы, варианты и брейкпоинты в API обычного `StyleSheet`, меняет тему без перерендера React (ядро на C++ обновляет нативные стили напрямую) и полностью типизирована от сгенерированных токенов.

### 3.1 Сравнение

| Критерий | Unistyles 3 | NativeWind (Tailwind) | Tamagui | Restyle (Shopify) | Чистый StyleSheet |
| --- | --- | --- | --- | --- | --- |
| Светлая / тёмная тема | Встроено, без перерендера | Через `dark:` и CSS-переменные | Встроено | Через ThemeProvider (перерендер дерева) | Вручную |
| Варианты компонентов (как в Figma) | `variants` в стилях | Через сторонние cva/tv | Встроено | `createVariant` | Вручную |
| Типизация токенов | Полная | Строки классов (частично) | Полная | Полная | Нет |
| Производительность | Уровень StyleSheet | Хорошая, есть рантайм-парсинг | Хорошая с компилятором | Средняя | Максимальная |
| Совместимость с Reanimated | Да (стили + shared values) | Да, с ограничениями | Да | Да | Да |
| Сложность входа | Низкая (как StyleSheet) | Низкая для знающих Tailwind | Высокая (компилятор, своя экосистема) | Средняя | Низкая |
| Подходит для «игрового» UI с градиентами и анимациями | Да | Да, но длинные строки классов | Да, но тяжёлый фреймворк | Да | Да, но темы вручную |

Если команда уже хорошо знает Tailwind, NativeWind — допустимая замена: токены тем же конвейером генерируются в `tailwind.config`. Решение фиксируется до начала разработки и не меняется.

### 3.2 Конвейер Figma → код

```
Figma Variables (Primitives / Semantic / Component, режимы Light / Dark)
   ↓ Tokens Studio: sync → GitHub PR
packages/tokens/src/*.json            (W3C Design Tokens)
   ↓ Style Dictionary (CI, кастомные трансформы)
packages/tokens/dist/
   theme.light.ts, theme.dark.ts      → Unistyles themes
   typography.ts, motion.ts           → типографика и пружины Reanimated
   tokens.css                         → админка
```

Имена совпадают с дизайн-системой: `bg.surface` в Figma = `theme.colors.bg.surface` в коде.

### 3.3 Пример компонента

```tsx
// shared/ui/button/Button.styles.ts
import { StyleSheet } from 'react-native-unistyles'

export const styles = StyleSheet.create(theme => ({
  root: {
    borderRadius: theme.radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    variants: {
      size: {
        l: { height: 56, paddingHorizontal: theme.space[6] },
        m: { height: 48, paddingHorizontal: theme.space[5] },
        s: { height: 36, paddingHorizontal: theme.space[4] },
      },
      variant: {
        primary: {},                       // градиент рисует LinearGradient
        secondary: { backgroundColor: theme.colors.bg.surface, borderWidth: 1, borderColor: theme.colors.border.default },
        ghost: { backgroundColor: 'transparent' },
        danger: { backgroundColor: theme.colors.status.danger },
      },
      disabled: { true: { opacity: 0.4 } },
    },
  },
}))
```

### 3.4 Правила

- Настройка темы: `adaptiveThemes` (следование системе) + ручной выбор в настройках (`UnistylesRuntime.setTheme`), выбор хранится в MMKV.
- Градиенты — только через `shared/ui/Gradient` с именами токенов (`gradient.primary`), а не массивы цветов в коде.
- Тени — CSS-синтаксис `boxShadow` из токенов `elevation.*`.
- Текст — только компонент `Text` с пропом `variant="body.m"`; `maxFontSizeMultiplier` задаётся по стилю (1.3 для body, 1.0 для display и чисел поля).
- Скины поля не входят в Unistyles-тему: это данные для Skia (`skin.json`), загружаемые с CDN.

## 4. Анимации и графика

Четыре инструмента с чёткими границами: **Reanimated 4** — всё, что двигает обычные View; **Skia** — всё, что рисуется на поле и частицы; **Lottie** — готовые анимации дизайнера; **Rive** — интерактивные анимации со состояниями.

### 4.1 Что чем делаем

| Задача | Инструмент | Примечания |
| --- | --- | --- |
| Нажатия кнопок, появление карточек, счётчики, прогресс-бары | Reanimated (CSS-анимации / `withSpring`, `withTiming`) | Пружины и длительности — из `motion.ts` (токены) |
| Появление / исчезновение элементов списков | Reanimated layout animations (`entering`, `exiting`, `layout`) | Звёзды итога, награды, тосты |
| Листы и свайпы | Gesture Handler + Reanimated (внутри bottom-sheet) | — |
| Поле: клетки, элементы, заборы, числа | Skia `Canvas` + shared values Reanimated | Нажатие клетки, открытие числа, тряска — shared values, которые читает Skia без перерендера React |
| Волна тапа, искры, конфетти, монеты в кошелёк | Skia (частицы в слое эффектов) | Один оверлейный `Canvas` на экран с `pointerEvents="none"` |
| Перелив легендарных товаров, скелетоны | Skia (градиент/шейдер) или Reanimated + LinearGradient | — |
| Взрыв бомбы, победа, повышение лиги, серия, эмоции | Lottie | Файлы от дизайнера, подмена цветов по теме через `colorFilters` |
| Эффекты-косметика (тап, открытие, победа) | Lottie (с CDN, кэш на диске) | Загружаются при экипировке, не в момент тапа |
| Радар поиска, анимированные аватары, жребий | Rive | State machine: входы управляются из кода |
| Переходы экранов | Нативные (react-native-screens) + fade табов на Reanimated | Не писать кастомные переходы стека |

Не используем: `Animated` из RN core, Moti (лишняя прослойка поверх Reanimated 4, где уже есть CSS-анимации), GIF/APNG, видео для эффектов.

### 4.2 Примеры

Нажатие кнопки на токенах:

```tsx
const pressed = useSharedValue(0)
const style = useAnimatedStyle(() => ({
  transform: [{ scale: withSpring(pressed.value ? 0.97 : 1, motion.spring.snappy) }],
}))
```

Открытие числа в Skia (без перерендера поля):

```tsx
// прогресс открытия клетки i хранится в shared value
const reveal = useSharedValue(0)
reveal.value = withSpring(1, motion.spring.bouncy)
const numberTransform = useDerivedValue(() => [{ scale: 0.4 + 0.6 * reveal.value }])
// <Group transform={numberTransform} origin={cellCenter}><Text ... /></Group>
```

### 4.3 Правила

- Все длительности и пружины — из `motion.ts`; числа в коде запрещены на ревью.
- `useReducedMotion()` → упрощённая версия из дизайн-спецификации (fade вместо тряски, без частиц, Lottie — последний кадр).
- Игровая логика не ждёт анимацию: состояние меняется сразу, анимация — его отражение. Блокировка ввода — только там, где описано в экранах (300 мс после находки цели).
- Lottie-файлы предзагружаются до показа (вход на экран игры / матча). Одновременно не больше 2 Lottie на экране.
- Контроль качества: 60 fps на Android уровня Samsung A15 / Redmi Note 12 при тапах по полю 9×9 и взрыве (замер Flashlight).

## 5. Структура проекта

### 5.1 Монорепозиторий

```
pelenge/
  apps/
    mobile/                 # Expo-приложение
    admin/                  # веб-админка (Vite)
  packages/
    engine/                 # @pelenge/engine: движок, валидатор, бот-решатель, дейли, коды
      vectors/              # общие тест-векторы TS ↔ Go (JSON)
    content/                # 100 уровней JSON v2 + скрипт валидации
    tokens/                 # дизайн-токены + Style Dictionary
    api/                    # сгенерированные типы OpenAPI и WS-схемы
    i18n/                   # словари RU/EN (общие для мобайла и админки)
  server/                   # Go (вкладка «Бэкенд»)
  contracts/
    openapi.yaml            # REST-контракт (источник истины)
    ws/*.schema.json        # сообщения WebSocket
```

### 5.2 Мобильное приложение

```
apps/mobile/
  app/                               # Expo Router: только маршруты и layout'ы
    _layout.tsx                      # провайдеры, сплэш, гварды
    (tabs)/_layout.tsx               # кастомный TabBar
    (tabs)/index.tsx                 # → screens/home
    (tabs)/levels.tsx | arena.tsx | shop.tsx | profile.tsx
    play/[mode]/[id].tsx
    arena/map/[id].tsx | search.tsx | match/[id].tsx | result/[id].tsx
    daily.tsx | leaderboards.tsx | friends.tsx | user/[id].tsx
    event/[id].tsx | editor/index.tsx | editor/[id].tsx | play-code.tsx
    settings.tsx | onboarding.tsx | system/update.tsx | system/maintenance.tsx | system/banned.tsx
  src/
    app/          providers/ (Query, Unistyles, i18n, Sentry, Gesture, BottomSheet), bootstrap.ts
    screens/      home/, levels/, play/, arena-home/, arena-map/, match/, match-result/, shop/, profile/, …
    widgets/      board/, hud/, level-list/, match-header/, shop-grid/, season-track/, wallet-bar/, tab-bar/
    features/     tap-cell/, flag-cell/, place-element/, purchase-item/, equip-item/, claim-reward/,
                  continue-for-ad/, restore-streak/, challenge-friend/, link-account/, share-level/
    entities/     level/, progress/, daily/, match/, arena-map/, user/, wallet/, item/, event/, friend/, season/
                  (каждый: model/ (типы, стор), api/ (queries/mutations), ui/ (маленькие компоненты))
    shared/       ui/ (дизайн-система), theme/, api/ (http клиент), ws/, storage/, i18n/,
                  analytics/, ads/, audio/, haptics/, config/, lib/
  modules/        yandex-ads/, app-integrity/   # собственные Expo-модули (Swift/Kotlin)
  assets/         fonts/, sounds/, lottie/, rive/, images/
  app.config.ts   eas.json
```

### 5.3 Правила импортов

- Слои: `app → screens → widgets → features → entities → shared`; импорт только вниз. `@pelenge/engine` доступен слоям `entities` и выше.
- Каждый слайс экспортирует публичный API через `index.ts`; глубокие импорты запрещены.
- Правила проверяет `eslint-plugin-boundaries` в CI; нарушение блокирует мердж.
- Файлы маршрутов в `app/` содержат только `export default` экрана и опции навигации.

## 6. Состояние и данные

### 6.1 Где что хранится

| Данные | Где | Персист |
| --- | --- | --- |
| Профиль, кошелёк, инвентарь, арена, лидерборды, друзья, каталог, события | TanStack Query | MMKV (persist для офлайн-показа), `staleTime` 30 с–10 мин по типу |
| Прогресс кампании (звёзды, текущий уровень) | Zustand `progressStore` | MMKV; синхронизация с сервером по максимуму |
| Текущая партия (уровень / дейли / код) | Zustand `gameSessionStore` поверх редьюсера движка | MMKV (возобновление партии) |
| Текущий матч | Zustand `matchStore`, обновляется только сообщениями WS | Нет (источник — сервер, `match.snapshot`) |
| Очередь отправки (попытки, аналитика) | Zustand `outboxStore` | MMKV |
| Настройки (звук, тема, язык, координаты) | Zustand `settingsStore` | MMKV |
| Сессия | Zustand `authStore` (access в памяти) | refresh — SecureStore |
| Черновики редактора | Zustand `editorStore` (с историей undo/redo) | MMKV |
| Состояние форм | react-hook-form | Нет |

### 6.2 Игровая сессия

Движок экспортирует чистый редьюсер; стор только держит состояние и запускает побочные эффекты (звук, вибрация, аналитика).

```ts
// @pelenge/engine
export type GameEvent =
  | { type: 'reveal'; cell: Cell; value: Probe }
  | { type: 'targetFound'; cell: Cell; left: number }
  | { type: 'bomb'; cell: Cell; penalty: 2 }
  | { type: 'win'; moves: number; stars: 1 | 2 | 3 }
  | { type: 'lose' }

export function applyTap(state: GameState, cell: Cell): { state: GameState; events: GameEvent[] }
```

```ts
// entities/level/model/gameSessionStore.ts
tap: (cell) => {
  const { state, events } = applyTap(get().state, cell)
  set({ state })
  events.forEach(dispatchEffects)        // звук, вибрация, анимация, аналитика
  if (isFinished(state)) outbox.enqueueAttempt(state)
}
```

### 6.3 Матч

- `matchStore` — явный конечный автомат: `idle → searching → found → intro → myTurn | opponentTurn → finalTurn → ended`, плюс флаги `reconnecting`, `pendingTap`.
- Переходы вызываются только серверными сообщениями; клиентские действия (тап, сдача) только отправляют сообщение.
- При росте сложности (турниры, дружеские комнаты) автомат переносится на XState v5; в MVP — Zustand.

### 6.4 Синхронизация и офлайн

- Записывающие запросы — `useMutation` с `Idempotency-Key` (UUID v7, создаётся один раз на действие).
- Оптимистичные обновления только для экипировки, флажков и настроек. Валюта и покупки — только после ответа сервера.
- `outboxStore` отправляется: при старте, при переходе NetInfo в online, при сворачивании, и раз в 60 с при наличии записей. Ошибка 4xx — запись удаляется и логируется; 5xx / сеть — экспоненциальный повтор.
- `onlineManager` TanStack Query подключён к NetInfo, `focusManager` — к AppState (перезапрос при возврате в приложение).
- Миграции локального хранилища: у каждого persist-стора `version` + функция `migrate`; прогресс из веб-прототипа не переносится (другая платформа).

## 7. Навигация и deep links

- Expo Router с типизированными маршрутами (`experiments.typedRoutes`). Дерево маршрутов — в разделе 5.2, совпадает с ключами экранов во вкладке «Экраны».
- Гварды в корневом `_layout`: принудительное обновление → `system/update`; техработы → `system/maintenance`; бан → `system/banned`; нет онбординга → `onboarding`. Реализация через `Stack.Protected` / `Redirect`.
- Вкладки — кастомный `TabBar` из дизайн-системы (плавающий, blur, бейджи); экраны игры и матча — вне группы `(tabs)`, презентация `fullScreenModal`, `gestureEnabled: false`.
- Нижние листы — `@gorhom/bottom-sheet` (не маршруты), кроме превью товара: `shop/item/[id]` — маршрут-лист, чтобы на него вели deep link и push.
- Android «назад» на экранах игры / матча перехватывается (`BackHandler`) → пауза / диалог сдачи.

| Deep link | Экран |
| --- | --- |
| `pelenge://daily`, `https://pelenge.app/daily` | Дейли |
| `pelenge://play?c=PELENG2-…`, `https://pelenge.app/l/<code>` | Превью уровня по коду |
| `https://pelenge.app/i/<inviteCode>` | Приглашение в друзья (применяется после онбординга, даже если игра была установлена по ссылке) |
| `pelenge://shop/item/<id>` | Превью товара |
| `pelenge://event/<id>` | Событие |
| `pelenge://challenge/<id>` | Принятие вызова (из push) |

Universal Links (iOS, `apple-app-site-association`) и App Links (Android, `assetlinks.json`) размещаются на домене `pelenge.app`. Для отложенного deep link (игра не установлена) веб-страница приглашения кладёт код в буфер обмена и отправляет в стор; при первом запуске приложение предлагает применить код из буфера (Android — ещё Install Referrer).

## 8. Игровое поле: реализация

Поле — один Skia `Canvas` с одним обработчиком жестов на всю площадь. Это даёт 120 fps, скины как данные и эффекты в том же слое.

### 8.1 Состав компонента `widgets/board`

```
<BoardView board={BoardModel} skin={SkinData} mode="play|pvp|editor|preview" onTap onLongPress onEdgeTap>
  <GestureDetector gesture={Exclusive(LongPress(400ms), Tap)}>
    <Canvas>
      <BoardFrame/>            // подложка
      <CellsLayer/>            // основа клеток + элементы (SVG-пути скина через Skia.Path)
      <StateLayer/>            // обводки HOT/WARM/COLD, последний тап, затемнение
      <NumbersLayer/>          // числа / стрелки / метки (Skia Text с вшитым шрифтом Unbounded)
      <FlagsLayer/> <FencesLayer/> <FxLayer/>
    </Canvas>
  </GestureDetector>
  {screenReaderEnabled && <A11yOverlay/>}   // прозрачные View на каждую клетку с подписями
</BoardView>
```

### 8.2 Правила реализации

- Геометрия (размер клетки, зазор, радиус) считается один раз из ширины и таблицы дизайн-системы 4.2.
- Хит-тест: координаты жеста → индекс клетки (зазоры относятся к ближайшей клетке). В редакторе — ещё ребро: если касание ближе 12 pt к границе.
- Состояние клеток — массив в shared value (`useSharedValue<CellVisual[]>`), чтобы анимация одной клетки не перерисовывала React-дерево. React-рендер поля — только при смене уровня или скина.
- Скин: `skin.json` → `SkinData` (Skia-паинты, градиенты, `SkImage` текстур, распарсенные SVG-пути). Загружается и кэшируется до входа на экран; пока не готов — скин по умолчанию.
- Доступность: при включённом VoiceOver/TalkBack поверх канваса рендерится сетка прозрачных `Pressable` с `accessibilityLabel` и `accessibilityActions` («открыть», «флажок»).
- Превью и мини-карты — тот же `BoardView` в режиме `preview` (без жестов, без чисел). Для списков с множеством превью — снапшот в `SkImage` и кэш.
- Координаты A–I / 1–9 рисуются обычными `Text` снаружи канваса.

### 8.3 Тесты поля

- Юнит: хит-тест (все размеры, границы, рёбра), расчёт геометрии, парсинг скинов.
- Скриншотные: Storybook-истории для всех состояний клетки и элементов в обеих темах (сравнение с эталоном в CI).
- Перф: 50 быстрых тапов по 9×9 без падения ниже 55 fps на эталонном Android.

## 9. Сеть

### 9.1 REST

- Типы: `openapi-typescript contracts/openapi.yaml -o packages/api/src/schema.ts` в CI и по команде `pnpm api:gen`. Изменение контракта без регенерации — ошибка CI.
- Клиент `openapi-fetch` с middleware: заголовки `Authorization`, `X-App-Version`, `X-Platform`, `X-Locale`, `X-Request-Id`; обновление access-токена по 401 (один одновременный refresh, остальные запросы ждут); 426 → экран обновления; 503 с `maintenance` → экран техработ.
- Повторы (TanStack Query): сеть и 5xx — 3 раза, задержка 1 / 2 / 4 с; 4xx — без повтора. Тайм-аут запроса 10 с.
- Ошибки: код из ответа (`INSUFFICIENT_FUNDS`) → ключ i18n `errors.INSUFFICIENT_FUNDS`; неизвестный код → общий текст + отправка в Sentry.

### 9.2 WebSocket-клиент (`shared/ws`)

| Функция | Поведение |
| --- | --- |
| Подключение | При входе в поиск, вызов или матч; токен в query, обновляется перед подключением. Для входящих вызовов и онлайн-статуса друзей — постоянное соединение, пока приложение на экране |
| Heartbeat | `ping` каждые 5 с; нет `pong` 10 с → реконнект |
| Реконнект | Экспоненциально 0,5 → 1 → 2 → 4 с (+ джиттер), до 30 с в матче; после подключения — `match.resync` |
| Синхронизация часов | Смещение = медиана по 5 пингам `serverTime − (clientSend + rtt/2)`; таймеры считаются от `deadline` сервера |
| Порядок | Сообщения с `seq`; пропуск seq → `match.resync` |
| Валидация | Входящие сообщения проверяются zod-схемами, сгенерированными из `contracts/ws/*.schema.json`; невалидное — в Sentry, игнор |
| Фон | AppState `background` → соединение закрывается через 5 с (вне матча — сразу); `active` → переподключение + resync |
| API для сторов | `ws.on(type, handler)`, `ws.send(type, payload)`; `matchStore` подписывается вне React |

## 10. Нативные интеграции

### 10.1 Реклама (`shared/ads`)

- Единый интерфейс `AdsProvider` с двумя реализациями: AdMob (`react-native-google-mobile-ads`) и Yandex (собственный Expo-модуль). Какую сеть использовать, сообщает `bootstrap` по стране.
- Предзагрузка: rewarded — при входе в уровень и на Витрине; interstitial — после 2-го завершённого уровня/матча в цикле.
- Rewarded-поток: `POST /ads/intent` → получаем `customData` → показ с `serverSideVerificationOptions` → сеть дергает SSV-колбэк бэкенда → клиент опрашивает статус intent (до 10 с) → награда.
- Правила частоты и лимиты — из remote config, проверяет клиент (для UX) и сервер (для наград).
- Согласия: UMP при старте (ЕЭЗ), ATT — перед первой рекламой с пред-экраном. Без согласия — `requestNonPersonalizedAdsOnly`.
- На время рекламы: музыка на паузу, игра на паузу, аналитика `ad_shown` / `ad_reward`.

### 10.2 Push

- `expo-notifications`: запрос разрешения после пред-экрана; `getDevicePushTokenAsync()` (нативный APNs/FCM-токен) → `PUT /push-token` с языком и часовым поясом. Сервис Expo Push не используем — бэкенд шлёт напрямую.
- Каналы Android создаются при старте. Тап по push → маршрут из `data.url` (те же deep links). Push во время матча не показываются (`setNotificationHandler`).
- Локальные уведомления не используем (все напоминания — с сервера, чтобы соблюдать общие лимиты).

### 10.3 Вход

- Apple: `expo-apple-authentication` → `identityToken` + `nonce` → `POST /auth/apple`.
- Google: `@react-native-google-signin/google-signin` → `idToken` → `POST /auth/google`.
- Гость: `POST /auth/guest` с устройством; device ID хранится в SecureStore (переживает переустановку на iOS благодаря Keychain).

### 10.4 Звук и вибрация (`shared/audio`, `shared/haptics`)

- `expo-audio`: при старте предзагружаются игровые SFX (пул из 2–3 плееров на частые звуки). Звук открытия клетки — 5 сэмплов по высоте или `playbackRate` для питча.
- Режим аудиосессии: уважать беззвучный режим iOS, не прерывать музыку других приложений (если играет сторонняя музыка — наша музыка не включается).
- `expo-haptics`: обёртка `haptic('success' | 'impactLight' | …)` с проверкой настройки и троттлингом 80 мс. Карта событий — в дизайн-системе, раздел 9.

### 10.5 Собственные Expo-модули

| Модуль | Язык | API для JS |
| --- | --- | --- |
| `yandex-ads` | Swift + Kotlin, Expo Modules API | `init(appId)`, `loadRewarded(unitId)`, `showRewarded(customData) → {rewarded}`, `loadInterstitial`, `showInterstitial`, события `onAdLoaded/onAdFailed` |
| `app-integrity` | Swift (DeviceCheck App Attest) + Kotlin (Play Integrity) | `getToken(nonce) → string` для наградных запросов |

Оба модуля подключаются через config plugins, без ручной правки `ios/` и `android/` (папки генерируются `expo prebuild` и не коммитятся).

## 11. Локализация, темы, доступность

- **i18n**: i18next + react-i18next, языки `ru`, `en`; fallback — `en`. Стартовый язык — из `expo-localization`, затем из настроек. Неймспейсы по разделам (`home`, `play`, `arena`, `shop`, `errors`, `push`). Множественное число — через `Intl.PluralRules` (ключи `_one`, `_few`, `_many`, `_other`).
- Ключи извлекаются `i18next-parser`; CI падает, если в RU или EN нет ключа. Строки в JSX без `t()` запрещены линтером.
- Серверные тексты (товары, события, баннеры) приходят сразу на языке из `X-Locale`.
- Смена языка в настройках — без перезапуска; кэш Query с локализованными данными инвалидируется.
- **Темы**: Unistyles `adaptiveThemes` + ручной выбор; статус-бар и системная панель Android (`expo-system-ui`) обновляются при смене темы.
- **Доступность**: `accessibilityRole` / `accessibilityLabel` / `accessibilityState` на всех интерактивных элементах (проверяет `eslint-plugin-react-native-a11y`); `AccessibilityInfo.announceForAccessibility` для игровых событий («Сигнал найден», «Твой ход»); оверлей поля (раздел 8); `useReducedMotion`; `maxFontSizeMultiplier` по стилям текста.

## 12. Качество, CI/CD, окружения

### 12.1 Окружения и сборки

| Профиль EAS | Назначение | API | Канал OTA | Дистрибуция |
| --- | --- | --- | --- | --- |
| `development` | Dev client для разработчиков | dev | — | Внутренняя |
| `preview` | QA, дизайн-ревью, заказчик | staging | `staging` | TestFlight / Google Play Internal |
| `production` | Сторы | prod | `production` | App Store / Google Play |

- Конфиг — `app.config.ts` с переменными из EAS Environment Variables; разные bundle ID для dev/preview/prod, чтобы ставить рядом.
- Версии: semver в `version`, `buildNumber` / `versionCode` — автоинкремент EAS; `runtimeVersion` — политика `fingerprint` (OTA попадает только на совместимые нативные сборки).

### 12.2 CI (GitHub Actions)

1. На каждый PR: `pnpm install` → lint → typecheck → jest (engine + mobile) → тест-векторы → валидация 100 уровней → проверка ключей i18n → регенерация API-типов без диффа → скриншотные тесты Storybook.
2. Мердж в `main`: EAS Build `preview` + EAS Update `staging` + Maestro e2e на эмуляторах (EAS Workflows или свой runner).
3. Тег `v*`: EAS Build `production` → EAS Submit в сторы (ручное подтверждение релиза в консолях), загрузка source maps в Sentry.
4. Хотфикс JS — EAS Update в `production` на 10% → 100% с мониторингом crash-free.

### 12.3 Тесты

| Уровень | Что | Покрытие |
| --- | --- | --- |
| `@pelenge/engine` | Все правила, бомба, валидатор, бот, дейли, коды | ≥ 95% строк |
| Сторы и фичи | gameSession, match (сценарии из вкладки «Сценарии»), outbox, auth refresh | ≥ 80% |
| Компоненты | UI-кит через RNTL + Storybook | Ключевые |
| E2E (Maestro) | Онбординг, уровень (победа/поражение/продолжение с мок-рекламой), дейли, покупка, матч с ботом, офлайн → онлайн | 12–15 потоков |

### 12.4 Правила кода

- TypeScript `strict`, `noUncheckedIndexedAccess`; `any` запрещён.
- Компоненты — функциональные, без `React.memo` и ручных `useMemo` (работает React Compiler), кроме измеренных случаев.
- Conventional Commits, PR ≤ 400 строк диффа, обязательный ревью, для UI — скриншоты / видео в PR.
- Storybook — история на каждый компонент UI-кита и каждое состояние; дизайнер принимает компоненты по нему на устройстве.

## 13. Производительность

| Метрика | Бюджет | Чем мерим |
| --- | --- | --- |
| Холодный старт до интерактивной Главной | ≤ 2,5 с (Android среднего уровня), ≤ 1,5 с (iPhone 12+) | Sentry App Start, Flashlight |
| FPS на поле и в анимациях | ≥ 55 (цель 60/120) | Flashlight, Perf Monitor |
| Отклик на тап в уровне | ≤ 50 мс до начала анимации | Инструменты Reanimated / систрейс |
| JS-бандл (Hermes bytecode) | ≤ 8 МБ | `expo export` + Atlas |
| Размер сборки (скачивание) | ≤ 60 МБ | App Store Connect / Play Console |
| Память | ≤ 250 МБ в матче | Xcode Instruments, Android Profiler |
| Перерендеры | Тап по клетке не рендерит дерево экрана, только HUD | React DevTools Profiler |

Правила: селекторы Zustand с `useShallow`; списки — FlashList; картинки — `expo-image` с указанными размерами; тяжёлые экраны (редактор, лидерборды) — ленивые; бот-решатель на клиенте («Проверить карту») запускается в worklet-рантайме (`react-native-worklets`), чтобы не блокировать JS-поток. Регрессия бюджета — баг с приоритетом «высокий».



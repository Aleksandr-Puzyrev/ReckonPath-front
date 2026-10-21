export const sizes = {
  touchTarget: 44,
  contentMaxWidth: 480,
  button: { l: 56, m: 48, s: 36 },
  iconButton: { size: 44, icon: 24 },
  icon: { s: 16, m: 20, l: 24, xl: 32 },
  topBar: { height: 56, blur: 14, emblem: 36 },
  // The spec sets radius 20 for the tab bar, not radius.xl (в ТЗ для таб-бара радиус 20, а не radius.xl).
  tabBar: { height: 64, inset: 10, radius: 20, blur: 18 },
  avatar: { list: 32, match: 48, profile: 72, versus: 96 },
  // The design's row and tile, decision 0011 #3 (строка и плитка из дизайна, решение 0011 #3).
  levelRow: { height: 66, tile: 44 },
  worldHeader: { height: 104, lockedHeight: 96 },
  chip: { height: 34 },
  floatingButton: { height: 44 },
  // The rule card's demo area from design 11.1, decision 0013 (область демо карточки из дизайна 11.1, решение 0013).
  ruleCard: { demoMinHeight: 236, demoShare: 0.55 },
  // The radar illustration of the system screens from design 28.1 / 28.3, decision 0014 (радар системных экранов из дизайна 28.1 / 28.3, решение 0014).
  systemIllustration: {
    size: 170,
    ringGap: 23,
    tile: 84,
    tileRadius: 26,
    icon: 40,
    ringOpacity: 0.22,
    tintOpacity: 0.2,
  },
  // The soft update sheet's badge from design 28.2, decision 0014 (значок листа мягкого обновления из дизайна 28.2, решение 0014).
  softUpdateBadge: { size: 52, radius: 16, icon: 26 },
  // The splash emblem matches the native splash image width; the sonar ring grows to the ring size, design 1.1, decision 0042 (знак сплэша совпадает с шириной картинки системного сплэша; сонарное кольцо растёт до размера кольца, дизайн 1.1, решение 0042).
  splash: { emblem: 96, ring: 240, ringStroke: 1.5 },
  // The board preview of the Home hero, design 19.1, decision 0041 (превью поля в геро главной, дизайн 19.1, решение 0041).
  home: { heroBoard: 200, skeletonTile: 96 },
  // The settings row tile and the volume slider of design 25.1, decision 0040 (плашка строки настроек и слайдер громкости из дизайна 25.1, решение 0040).
  settings: { iconTile: 30, iconTileRadius: 9, sliderTrack: 6, sliderThumb: 22 },
  // The daily screen's preview, streak track and calendar from design 20.1, decision 0017 (превью, шкала серии и календарь экрана дейли из дизайна 20.1, решение 0017).
  daily: { preview: 120, milestone: 28, track: 6, calendarGap: 5, rankBadge: 26 },
  timerRing: { size: 56, stroke: 4 },
  toast: { minHeight: 44, offset: 12 },
  // The fields, consent box and progress bars (password strength, XP) of design 1.3 / 1.4, decision 0019 (поля, галочка согласия и полоски прогресса (надёжность пароля, опыт) из дизайна 1.3 / 1.4, решение 0019).
  input: { height: 52, border: 1.5 },
  checkbox: { size: 24, border: 1.5 },
  progressBar: { height: 4 },
  // The shop hero board (22.1), the skeleton card shape and the preview visual (22.2–22.4), decisions 0022–0023 (поле в геро (22.1), форма карточки-скелетона и превью (22.2–22.4), решения 0022–0023).
  shop: { heroBoard: 112, skeletonCardRatio: 0.7, previewVisual: 200 },
  // The link sheet's badge from design 26.1, decision 0019 (значок листа привязки из дизайна 26.1, решение 0019).
  linkBadge: { size: 96, radius: 30, icon: 44 },
  // The league emblem (Part 4 §8.1), map previews, season step and history avatar of design 13.1 / 13.6 / 32.4, decision 0031 (эмблема лиги (Часть 4 §8.1), превью карт, ступень трека и аватар истории из дизайна 13.1 / 13.6 / 32.4, решение 0031).
  arena: {
    emblem: 64,
    myMap: 86,
    switchMap: 64,
    detailsMap: 150,
    trackStep: 88,
    trackIcon: 40,
    historyAvatar: 40,
    progress: 8,
    coordinates: 16,
  },
} as const;

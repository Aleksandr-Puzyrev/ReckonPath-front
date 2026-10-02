export const sizes = {
  touchTarget: 44,
  contentMaxWidth: 480,
  button: { l: 56, m: 48, s: 36 },
  iconButton: { size: 44, icon: 24 },
  icon: { s: 16, m: 20, l: 24, xl: 32 },
  topBar: { height: 56, blur: 14 },
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
  timerRing: { size: 56, stroke: 4 },
  toast: { minHeight: 44, offset: 12 },
} as const;

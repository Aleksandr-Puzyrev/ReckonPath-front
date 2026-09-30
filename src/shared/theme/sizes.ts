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
  levelRow: { height: 72, tile: 56 },
  timerRing: { size: 56, stroke: 4 },
  toast: { minHeight: 44, offset: 12 },
} as const;

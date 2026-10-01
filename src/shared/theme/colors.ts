export const lightColors = {
  bg: {
    base: "#EEF5F8",
    surface: "#FFFFFF",
    sunken: "#E7F0F5",
    overlay: "rgba(4,15,24,0.72)",
    toast: "#102B3D",
    glass: "rgba(255,255,255,0.78)",
  },
  text: {
    primary: "#102534",
    secondary: "#536878",
    disabled: "#9AABB7",
    inverse: "#FFFFFF",
    onAccent: "#FFFFFF",
  },
  border: {
    default: "#D5E2E9",
    strong: "#B3C6D1",
  },
  focus: {
    ring: "#18D7DF",
  },
  accent: {
    cyan: "#0FB8C0",
    blue: "#5068F5",
    pink: "#F24C8C",
  },
  status: {
    success: "#1FB27E",
    warning: "#E0A21E",
    danger: "#E5484F",
    info: "#3D8BFF",
  },
  feedback: {
    hot: "#FF5A4E",
    warm: "#FF9F3D",
    cold: "#3D9BF0",
  },
  currency: {
    emerald: "#12B886",
    coin: "#E0A21E",
    trophy: "#C98A1E",
  },
  league: {
    bronze: "#B8743F",
    silver: "#8D9BA8",
    gold: "#E0A21E",
    platinum: "#25B8A8",
    diamond: "#4F7EF0",
    master: "#A34CE0",
  },
  rarity: {
    common: "#7F95A4",
    rare: "#2F86F0",
    epic: "#9150F0",
    legendary: "#F09A1E",
  },
};

export type ThemeColors = typeof lightColors;

export const darkColors: ThemeColors = {
  bg: {
    base: "#06131E",
    surface: "#0D202D",
    sunken: "#122D3C",
    overlay: "rgba(0,0,0,0.72)",
    toast: "#F2F8FB",
    glass: "rgba(13,32,45,0.74)",
  },
  text: {
    primary: "#F2F8FB",
    secondary: "#91A8B8",
    disabled: "#4E6676",
    inverse: "#06131E",
    onAccent: "#FFFFFF",
  },
  border: {
    default: "#213C4D",
    strong: "#33566B",
  },
  focus: {
    ring: "#18D7DF",
  },
  accent: {
    cyan: "#18D7DF",
    blue: "#647CFF",
    pink: "#FF5D9A",
  },
  status: {
    success: "#3ED49B",
    warning: "#FFC84E",
    danger: "#FF6D72",
    info: "#6FA8FF",
  },
  feedback: {
    hot: "#FF6D5D",
    warm: "#FFB65D",
    cold: "#5FB8FF",
  },
  currency: {
    emerald: "#3ED49B",
    coin: "#FFC84E",
    trophy: "#FFD36D",
  },
  league: {
    bronze: "#D6955F",
    silver: "#B8C4CF",
    gold: "#FFC84E",
    platinum: "#6FE3D4",
    diamond: "#86AEFF",
    master: "#D27BFF",
  },
  rarity: {
    common: "#9FB3C1",
    rare: "#4FA3FF",
    epic: "#B06BFF",
    legendary: "#FFB23E",
  },
};

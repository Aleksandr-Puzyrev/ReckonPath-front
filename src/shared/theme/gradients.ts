// TODO: add hero.arena, hero.shop, hero.event once their gradient angle is clarified

interface Gradient {
  colors: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
  angle: number;
}

export const gradients = {
  primary: { colors: ["#18D7DF", "#647CFF"], angle: 135 },
  hot: { colors: ["#FF4F9D", "#FF7B69"], angle: 135 },
  done: { colors: ["#36D4B0", "#5E86FF"], angle: 135 },
  // TODO: the spec adds a highlight («+ блик») to hero.home without parameters — clarify with the home screen
  heroHome: { colors: ["#102E43", "#187E9D", "#6653B8"], locations: [0, 0.48, 1], angle: 145 },
  levelDone: { colors: ["#3ED49B", "#1F9C74"], angle: 145 },
  levelCurrent: { colors: ["#FFB65D", "#FF5D6A"], angle: 145 },
  perfectBadge: { colors: ["#FFE59A", "#FFC84E"], angle: 135 },
  world1: { colors: ["#2E7D6B", "#4FB39A", "#9BE8C8"], locations: [0, 0.6, 1], angle: 135 },
  world2: { colors: ["#1C5A86", "#2FA8C9", "#8CEAF0"], locations: [0, 0.6, 1], angle: 135 },
  world3: { colors: ["#5A2230", "#A5404F", "#FF8A6A"], locations: [0, 0.55, 1], angle: 135 },
  world4: { colors: ["#40506A", "#7A8CA8"], angle: 135 },
} satisfies Record<string, Gradient>;

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
} satisfies Record<string, Gradient>;

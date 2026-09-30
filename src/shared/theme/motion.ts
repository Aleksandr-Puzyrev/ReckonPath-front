export const motion = {
  duration: {
    instant: 80,
    fast: 150,
    base: 220,
    slow: 320,
    slower: 480,
    celebrate: { min: 800, max: 1600 },
  },
  easing: {
    standard: [0.2, 0, 0, 1],
    decelerate: [0.05, 0.7, 0.1, 1],
    accelerate: [0.3, 0, 0.8, 0.15],
  },
  spring: {
    snappy: { damping: 18, stiffness: 260, mass: 1 },
    bouncy: { damping: 11, stiffness: 180, mass: 1 },
    gentle: { damping: 22, stiffness: 120, mass: 1 },
  },
} as const;

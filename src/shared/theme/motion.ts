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
  animation: {
    targetFound: 900,
    targetInputLock: 300,
    bomb: 700,
    blockedShake: 180,
    win: 1600,
    starStep: 250,
    lose: 480,
  },
  press: { scale: 0.96, offset: 3 },
  toast: { duration: 1500, errorDuration: 3000 },
  shake: {
    bomb: { distance: 6, count: 3 },
    blocked: { distance: 2, count: 2 },
  },
  spring: {
    snappy: { damping: 18, stiffness: 260, mass: 1 },
    bouncy: { damping: 11, stiffness: 180, mass: 1 },
    gentle: { damping: 22, stiffness: 120, mass: 1 },
  },
} as const;

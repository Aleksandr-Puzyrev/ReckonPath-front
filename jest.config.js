module.exports = {
  collectCoverageFrom: [
    "packages/engine/src/**/*.ts",
    "!packages/engine/src/**/*.test.ts",
    "!packages/engine/src/test-utils/**",
    "!packages/engine/src/model/**",
    "!packages/engine/src/index.ts",
  ],
  coverageThreshold: {
    "./packages/engine/src/": { lines: 95 },
  },
  projects: [
    {
      displayName: "app",
      preset: "jest-expo",
      roots: ["<rootDir>/src"],
      setupFiles: [
        "<rootDir>/jest/setup.js",
        "react-native-unistyles/mocks",
        "<rootDir>/src/shared/theme/unistyles.ts",
      ],
      moduleNameMapper: {
        "\\.svg$": "<rootDir>/jest/svg-mock.js",
      },
      transform: {
        "\\.mjs$": "babel-jest",
      },
      transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@formatjs/.*|@shopify/flash-list|msw|@msw/.*|@mswjs/.*|@open-draft/.*|until-async|rettime|outvariant|is-node-process|headers-polyfill|set-cookie-parser|cookie|punycode|psl|standard-navigation)",
      ],
    },
    {
      displayName: "content",
      testEnvironment: "node",
      roots: ["<rootDir>/packages/content"],
      moduleNameMapper: {
        "^@reckon-path/engine$": "<rootDir>/packages/engine/src/index.ts",
      },
      transform: {
        "\\.[jt]sx?$": ["babel-jest", { presets: ["babel-preset-expo"] }],
      },
    },
    {
      displayName: "engine",
      testEnvironment: "node",
      roots: ["<rootDir>/packages/engine"],
      transform: {
        "\\.[jt]sx?$": ["babel-jest", { presets: ["babel-preset-expo"] }],
      },
    },
  ],
};

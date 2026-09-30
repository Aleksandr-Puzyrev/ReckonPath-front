module.exports = {
  projects: [
    {
      displayName: "app",
      preset: "jest-expo",
      roots: ["<rootDir>/src"],
      transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)",
      ],
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

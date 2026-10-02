jest.mock("react-native-worklets", () => require("react-native-worklets/src/mock"));
jest.mock("react-native-reanimated", () => ({
  ...require("react-native-reanimated/mock"),
  useReducedMotion: () => false,
}));
jest.mock("@shopify/react-native-skia", () => require("./skia-mock"));
jest.mock("expo-constants", () => {
  const constants = jest.requireActual("expo-constants").default;
  const { expo } = jest.requireActual("../app.json");
  return {
    __esModule: true,
    default: { ...constants, expoConfig: { ...constants.expoConfig, version: expo.version } },
  };
});
jest.mock("@react-native-community/netinfo", () =>
  require("@react-native-community/netinfo/jest/netinfo-mock.js"),
);
jest.mock("expo-secure-store", () => {
  const items = new Map();
  return {
    getItemAsync: async (key) => items.get(key) ?? null,
    setItemAsync: async (key, value) => {
      items.set(key, value);
    },
    deleteItemAsync: async (key) => {
      items.delete(key);
    },
    __reset: () => items.clear(),
  };
});

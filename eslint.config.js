const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier/flat");
const boundaries = require("eslint-plugin-boundaries");
const checkFile = require("eslint-plugin-check-file");
const i18next = require("eslint-plugin-i18next");
const reactNative = require("eslint-plugin-react-native");

const FSD_LAYERS = ["app", "application", "screens", "widgets", "features", "entities", "shared"];
const ENGINE_USERS = ["application", "screens", "widgets", "features", "entities"];

const layerPolicies = FSD_LAYERS.map((layer, index) => ({
  from: { element: { type: layer } },
  allow: {
    to: {
      element: {
        types: {
          anyOf: [
            ...FSD_LAYERS.slice(index + 1),
            ...(ENGINE_USERS.includes(layer) ? ["engine"] : []),
          ],
        },
      },
    },
  },
}));

const COLOR_LITERAL =
  "/^(#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(?:rgb|hsl)a?\\(.*\\))$/";

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", "coverage/*", ".expo/*", ".claude/*", "docs/*", "design/*"],
  },

  // TypeScript and general code style (rule 08)
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "separate-type-imports" },
      ],
      "no-console": "error",
      "import/no-anonymous-default-export": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [
            { pattern: "@reckon-path/engine", group: "internal", position: "before" },
            ...FSD_LAYERS.slice(1).map((layer) => ({
              pattern: `@${layer}/**`,
              group: "internal",
            })),
            { pattern: "@assets/**", group: "internal", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
        },
      ],
    },
  },

  // FSD import direction (rule 06)
  {
    files: ["src/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
        node: true,
      },
      "boundaries/include": ["src/**/*", "packages/**/*"],
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "application", pattern: "src/application" },
        { type: "screens", pattern: "src/screens/*", capture: ["slice"] },
        { type: "widgets", pattern: "src/widgets/*", capture: ["slice"] },
        { type: "features", pattern: "src/features/*", capture: ["slice"] },
        { type: "entities", pattern: "src/entities/*", capture: ["slice"] },
        { type: "shared", pattern: "src/shared" },
        { type: "engine", pattern: "packages/engine" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            { allow: { dependency: { relationship: { to: "internal" } } } },
            ...layerPolicies,
          ],
        },
      ],
    },
  },

  // Engine purity (rule 09)
  {
    files: ["packages/engine/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react-*",
                "react/*",
                "react-native",
                "react-native-*",
                "react-native/*",
                "@react-native/*",
                "@react-native-*/*",
                "expo",
                "expo-*",
                "@expo/*",
              ],
              message: "The engine is pure TypeScript: no React, React Native, or Expo (rule 09).",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        { name: "fetch", message: "The engine has no I/O (rule 09)." },
        { name: "localStorage", message: "The engine has no I/O (rule 09)." },
      ],
      "no-restricted-properties": [
        "error",
        { object: "Math", property: "random", message: "Use the seeded PRNG (spec Part 6 §6.2)." },
        { object: "Date", property: "now", message: "Time is passed in as an argument (rule 09)." },
      ],
    },
  },

  // Colors only from theme tokens (rule 13)
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/shared/theme/**"],
    plugins: { "react-native": reactNative },
    rules: {
      "react-native/no-color-literals": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=${COLOR_LITERAL}]`,
          message: "Color literals are forbidden: use theme tokens (rule 13).",
        },
      ],
    },
  },

  // No user-visible literals in JSX (rule 15)
  {
    files: ["src/**/*.tsx"],
    ...i18next.configs["flat/recommended"],
    rules: {
      "i18next/no-literal-string": [
        "error",
        {
          mode: "jsx-only",
          "jsx-attributes": {
            include: ["accessibilityLabel", "accessibilityHint", "placeholder", "title", "label"],
          },
        },
      ],
    },
  },

  // kebab-case file and folder names (rule 07); Expo Router files in src/app keep router conventions
  {
    files: ["src/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
    ignores: ["src/app/**"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{ts,tsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      "check-file/folder-naming-convention": ["error", { "**/": "KEBAB_CASE" }],
    },
  },

  // Tests
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "i18next/no-literal-string": "off",
    },
  },

  prettierConfig,
]);

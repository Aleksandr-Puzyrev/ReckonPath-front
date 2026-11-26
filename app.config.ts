import type { ConfigContext } from "expo/config";
import { withPlugins } from "expo/config-plugins";
import type { ExportedConfig } from "expo/config-plugins";

const withIosFirebase = (config: ExportedConfig): ExportedConfig => {
  // Keep the Android build on expo-notifications, including when only the iOS plist is set.
  const android = config.mods?.android;
  const scoped: ExportedConfig = { ...config, mods: { ...config.mods, android: {} } };
  const next: ExportedConfig = withPlugins(scoped, [
    require.resolve("@react-native-firebase/app/app.plugin.js"),
    require.resolve("@react-native-firebase/messaging/app.plugin.js"),
  ]);
  return { ...next, mods: { ...next.mods, android: android ?? {} } };
};

const configureApp = ({ config }: ConfigContext) => {
  const androidGoogleServicesFile = process.env.RECKON_ANDROID_GOOGLE_SERVICES_FILE?.trim();
  const iosGoogleServicesFile = process.env.RECKON_IOS_GOOGLE_SERVICES_FILE?.trim();
  if (!androidGoogleServicesFile && !iosGoogleServicesFile) return config;

  const plugins: NonNullable<ExportedConfig["plugins"]> = (config.plugins ?? []).map((plugin) => {
    if (!iosGoogleServicesFile || !Array.isArray(plugin) || plugin[0] !== "expo-build-properties") {
      return plugin;
    }
    const options = plugin[1];
    return [plugin[0], { ...options, ios: { ...options.ios, useFrameworks: "dynamic" } }];
  });
  if (androidGoogleServicesFile) {
    plugins.push(["expo-notifications", { defaultChannel: "default" }]);
  }

  const next = {
    ...config,
    ...(androidGoogleServicesFile
      ? { android: { ...config.android, googleServicesFile: androidGoogleServicesFile } }
      : {}),
    ...(iosGoogleServicesFile
      ? {
          ios: {
            ...config.ios,
            googleServicesFile: iosGoogleServicesFile,
            entitlements: { "aps-environment": "development", ...config.ios?.entitlements },
          },
        }
      : {}),
    extra: {
      ...config.extra,
      androidFcm: Boolean(androidGoogleServicesFile),
      iosFcm: Boolean(iosGoogleServicesFile),
    },
    plugins,
  };
  if (!iosGoogleServicesFile) return next;
  if (!next.name || !next.slug) throw new Error("Missing Expo app name or slug");
  return withIosFirebase({ ...next, name: next.name, slug: next.slug });
};

export default configureApp;

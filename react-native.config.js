const ios = process.env.RECKON_IOS_GOOGLE_SERVICES_FILE?.trim() ? {} : { ios: null };

// Android uses expo-notifications for FCM. Link the Firebase bridge only in configured iOS builds.
module.exports = {
  dependencies: {
    "@react-native-firebase/app": { platforms: { ...ios, android: null } },
    "@react-native-firebase/messaging": { platforms: { ...ios, android: null } },
  },
};

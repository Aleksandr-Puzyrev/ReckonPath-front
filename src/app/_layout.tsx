import { Stack } from "expo-router";

import { AppProviders } from "@application/index";

const RootLayout = () => (
  <AppProviders>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="play/[mode]/[id]"
        options={{ presentation: "fullScreenModal", gestureEnabled: false }}
      />
    </Stack>
  </AppProviders>
);

export default RootLayout;

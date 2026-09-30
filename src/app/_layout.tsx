import { Stack } from "expo-router";

import { AppProviders } from "@application/index";

const RootLayout = () => (
  <AppProviders>
    <Stack screenOptions={{ headerShown: false }} />
  </AppProviders>
);

export default RootLayout;

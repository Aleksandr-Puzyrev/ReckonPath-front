import { router } from "expo-router";

const DAILY_ROUTE = "/daily";

export const exitDaily = () => {
  if (router.canGoBack()) router.back();
  else router.replace(DAILY_ROUTE);
};

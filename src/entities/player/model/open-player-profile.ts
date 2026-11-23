import { router } from "expo-router";

export const openPlayerProfile = (id: string) =>
  router.push({ pathname: "/user/[id]", params: { id } });

import { mutationOptions } from "@tanstack/react-query";

import { apiClient, readData } from "@shared/api";

import type { Loadout } from "../model/item-type";

export const equipItemMutationOptions = () =>
  mutationOptions({
    mutationKey: ["item", "equip"],
    mutationFn: async (change: Loadout) =>
      readData(await apiClient.PUT("/loadout", { body: change })),
  });

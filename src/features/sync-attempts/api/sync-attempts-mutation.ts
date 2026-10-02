import { mutationOptions } from "@tanstack/react-query";

import { syncAttempts } from "../model/sync-attempts";

export const syncAttemptsMutationOptions = () =>
  mutationOptions({ mutationKey: ["attempts", "sync"], mutationFn: syncAttempts });

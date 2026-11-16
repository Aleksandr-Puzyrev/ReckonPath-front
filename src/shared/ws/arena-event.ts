import { z } from "zod";

import type { components } from "@shared/api";
import { toCamelKeys } from "@shared/lib";

export type ArenaEvent = components["schemas"]["ArenaEvent"];

const matchSchema = z.looseObject({
  id: z.string(),
  seq: z.number().int(),
  status: z.enum(["prepare", "play", "done"]),
  serverTime: z.string(),
  deadline: z.string(),
});

// Challenges belong to the friends task and are not read yet (вызовы относятся к задаче друзей и пока не читаются).
const eventSchema = z.object({
  type: z.enum(["hello", "match", "queue", "presence"]),
  time: z.string(),
  match: matchSchema.optional(),
  queue: z.looseObject({}).optional(),
  presence: z.object({ matchId: z.string(), online: z.boolean() }).optional(),
});

const parseJson = (data: string): unknown => {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// The envelope and the match keys the client orders by are checked; the rest of the view follows the contract (проверяются конверт и ключи матча, по которым клиент упорядочивает события; остальное — по контракту).
export const parseArenaEvent = (data: string): ArenaEvent | null => {
  const parsed = eventSchema.safeParse(toCamelKeys(parseJson(data)));
  // TODO: report invalid WebSocket messages to Sentry once it is set up
  return parsed.success ? (parsed.data as ArenaEvent) : null;
};

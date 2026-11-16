import type { components } from "@shared/api";

import type { fetchMatch, fetchMatchHistory } from "../api/match-queries";

type Schemas = components["schemas"];

// Answers read through openapi-fetch have their tuples (cells, fences) widened to arrays; a pushed match fits this wider shape too (ответы, прочитанные через openapi-fetch, получают кортежи — клетки, заборы — расширенными до массивов; присланный по сокету матч тоже подходит под эту форму).
export type MatchView = Awaited<ReturnType<typeof fetchMatch>>;
export type MatchFormat = Schemas["MatchFormat"];
export type MatchKind = Schemas["MatchKind"];
export type MatchResultView = NonNullable<MatchView["result"]>;
export type PlayerView = MatchView["me"];
export type BoardView = NonNullable<MatchView["myMap"]>;
export type ArenaCellView = BoardView["revealed"][number];
export type MoveView = NonNullable<MatchView["last"]>;
export type HistoryItem = Awaited<ReturnType<typeof fetchMatchHistory>>["items"][number];
export type QueueView = Schemas["QueueView"];
export type QueueState = Schemas["QueueState"];
export type Cell = [number, number];

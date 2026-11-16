import type { fetchCampaign, fetchCampaignGame, fetchCampaignLevel } from "../api/campaign-queries";

// Answers read through openapi-fetch have their tuples (cells, fences) widened to arrays (ответы, прочитанные через openapi-fetch, получают кортежи — клетки, заборы — расширенными до массивов).
export type CampaignOverview = Awaited<ReturnType<typeof fetchCampaign>>;
export type CampaignLevelDetail = Awaited<ReturnType<typeof fetchCampaignLevel>>;
export type CampaignGame = Awaited<ReturnType<typeof fetchCampaignGame>>;
export type CampaignWorld = CampaignOverview["worlds"][number];
export type CampaignLevel = CampaignWorld["levels"][number];
export type LevelState = CampaignLevel["state"];
export type CampaignGameResult = NonNullable<CampaignGame["result"]>;
export type CellView = CampaignGame["cells"][number];
export type PublicBoard = CampaignGame["board"];
export type Secrets = NonNullable<CampaignGameResult["secrets"]>;

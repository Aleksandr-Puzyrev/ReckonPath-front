import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { apiClient } from "@shared/api";
import { mockServer } from "@shared/test-utils/api-mock";

import { emptyDraft } from "../model/custom-level-of";
import { customLevelRequestOf } from "../model/custom-level-wire";
import type { CustomDraft } from "../model/custom-level-type";

import {
  deleteCustomLevelMutationOptions,
  saveCustomLevelMutationOptions,
} from "./custom-level-mutations";
import { customLevelQueryOptions, customLevelsQueryOptions } from "./custom-level-queries";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { gcTime: Infinity } },
});

const DRAFT: CustomDraft = {
  ...emptyDraft("Бухта", 5, 5, "distance"),
  map: { rows: 5, cols: 5, targets: [[2, 2]] },
};
const save = (id: string | null, draft = DRAFT) =>
  new MutationObserver(queryClient, saveCustomLevelMutationOptions()).mutate({
    id,
    draft,
    norm: 6,
  });
const create = async () => (await save(null)).id;
const list = () => queryClient.fetchQuery({ ...customLevelsQueryOptions(), staleTime: 0 });

describe("custom level API", () => {
  afterEach(() => mockServer.reset());

  test("saves, lists, updates and deletes a level (decision 0063 #1)", async () => {
    const id = await create();
    expect(await list()).toMatchObject({
      levels: [{ id, title: "Бухта", level: { rows: 5, targets: [[2, 2]] } }],
      max: 20,
    });

    await save(id, { ...DRAFT, title: "Риф" });
    expect(await list()).toMatchObject({ levels: [{ id, title: "Риф" }] });

    await new MutationObserver(queryClient, deleteCustomLevelMutationOptions()).mutate(id);
    expect(await list()).toEqual({ levels: [], max: 20 });
  });

  test("reads one level by its id", async () => {
    const id = await create();

    const level = await queryClient.fetchQuery({ ...customLevelQueryOptions(id), staleTime: 0 });

    expect(level).toMatchObject({ id, title: "Бухта", level: { moveLimit: 9, stars: [9, 9] } });
  });

  test("refuses an invalid level with its problems", async () => {
    await expect(
      save(null, { ...DRAFT, map: { ...DRAFT.map, targets: [] } }),
    ).rejects.toMatchObject({
      code: "level_invalid",
      details: { problems: [{ code: "targets" }] },
    });
  });

  test("refuses the level over the limit with the limit", async () => {
    for (let index = 0; index < 20; index += 1) await save(null);

    await expect(save(null)).rejects.toMatchObject({
      code: "limit_reached",
      details: { max: 20 },
    });
  });

  test("answers level_not_found for a level deleted elsewhere", async () => {
    await expect(save("level-9")).rejects.toMatchObject({ code: "level_not_found" });
  });

  test("refuses a bridge without water next to it, as the backend does", async () => {
    const draft: CustomDraft = {
      ...DRAFT,
      map: { ...DRAFT.map, streams: [[0, 0]], bridges: [[0, 0]] },
    };

    await expect(save(null, draft)).rejects.toMatchObject({
      code: "level_invalid",
      details: { problems: [{ code: "bridge", cells: [[0, 0]] }] },
    });
  });

  test("refuses a level over an editor cap with the element", async () => {
    const streams = Array.from({ length: 13 }, (_, index): [number, number] => [
      Math.floor(index / 5),
      index % 5,
    ]);

    await expect(save(null, { ...DRAFT, map: { ...DRAFT.map, streams } })).rejects.toMatchObject({
      code: "level_invalid",
      details: { problems: [{ code: "caps", element: "stream", max: 12, count: 13 }] },
    });
  });

  test("refuses a move limit over 99 and drops the level's own caps", async () => {
    const { title, level } = customLevelRequestOf(DRAFT, null);

    const over = await apiClient.POST("/levels/custom", {
      body: { title, level: { ...level, limit: 100, stars: [100, 100] } },
    });
    const withCaps = await apiClient.POST("/levels/custom", {
      // The backend's game.Level has caps, the client contract does not (game.Level бэкенда содержит caps, контракт клиента — нет).
      body: { title, level: { ...level, caps: { stream: 1 } } as typeof level },
    });

    expect(over.error).toMatchObject({
      error: { code: "level_invalid", details: { problems: [{ code: "limit", max: 99 }] } },
    });
    expect(withCaps.data?.level).not.toHaveProperty("caps");
  });
});

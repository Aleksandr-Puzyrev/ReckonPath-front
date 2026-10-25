import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { mockServer } from "@shared/test-utils/api-mock";

import { levelOfDraft, emptyDraft } from "../model/custom-level-of";

import {
  deleteCustomLevelMutationOptions,
  saveCustomLevelMutationOptions,
} from "./custom-level-mutations";
import { customLevelsQueryOptions } from "./custom-level-queries";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { gcTime: Infinity } },
});

const draft = {
  ...emptyDraft("Бухта", 5, 5, "distance"),
  map: { rows: 5, cols: 5, targets: [[2, 2]] as [number, number][] },
};
const save = (id: string | null, level = levelOfDraft(draft, id, 6)) =>
  new MutationObserver(queryClient, saveCustomLevelMutationOptions()).mutate({ id, level });
const list = () => queryClient.fetchQuery({ ...customLevelsQueryOptions(), staleTime: 0 });

describe("custom level API", () => {
  afterEach(() => mockServer.reset());

  test("saves, lists, updates and deletes a level (Part 7 §4)", async () => {
    const created = await save(null);
    expect(await list()).toMatchObject([{ id: created.id, level: { title: { ru: "Бухта" } } }]);

    await save(created.id, levelOfDraft({ ...draft, title: "Риф" }, created.id, 6));
    expect(await list()).toMatchObject([{ id: created.id, level: { title: { ru: "Риф" } } }]);

    await new MutationObserver(queryClient, deleteCustomLevelMutationOptions()).mutate(created.id);
    expect(await list()).toEqual([]);
  });

  test("refuses an invalid level and the 21st one", async () => {
    await expect(
      save(null, levelOfDraft({ ...draft, map: { ...draft.map, targets: [] } }, null, 6)),
    ).rejects.toMatchObject({
      code: "MAP_INVALID",
    });
    for (let index = 0; index < 20; index += 1) await save(null);

    await expect(save(null)).rejects.toMatchObject({ code: "LIMIT_REACHED" });
  });
});

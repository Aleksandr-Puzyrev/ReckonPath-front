import { MutationObserver, QueryClient } from "@tanstack/react-query";

import { mockServer } from "@shared/test-utils/api-mock";

import type { PvpMap } from "../model/arena-map-type";

import {
  activateArenaMapMutationOptions,
  checkArenaMapMutationOptions,
  deleteArenaMapMutationOptions,
  randomArenaMapMutationOptions,
  saveArenaMapMutationOptions,
} from "./arena-map-mutations";
import { arenaMapsQueryOptions } from "./arena-map-queries";

const VALID_MAP: PvpMap = { rows: 6, cols: 6, targets: [[2, 2]], bombs: [[0, 0]] };
const DRAFT_MAP: PvpMap = { rows: 6, cols: 6, targets: [] };

const createClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });

const save = (client: QueryClient, map: PvpMap, id: string | null = null) =>
  new MutationObserver(client, saveArenaMapMutationOptions()).mutate({ id, name: "Fort", map });

describe("arena map mutations", () => {
  afterEach(() => mockServer.reset());

  test("saves a map as a backend level and reads it back in the engine model", async () => {
    const client = createClient();

    const map = await save(client, VALID_MAP);

    expect(map).toEqual(expect.objectContaining({ name: "Fort", valid: true, active: true }));
    expect(map.map).toEqual(expect.objectContaining({ targets: [[2, 2]], bombs: [[0, 0]] }));
    const maps = await client.fetchQuery(arenaMapsQueryOptions());
    expect(maps).toEqual(expect.objectContaining({ max: 3, maps: [map] }));
    expect(maps.format).toEqual(expect.objectContaining({ rows: 6, cols: 6 }));
  });

  test("keeps an invalid map as a draft with the server's problems", async () => {
    const map = await save(createClient(), DRAFT_MAP);

    expect(map).toEqual(expect.objectContaining({ valid: false, active: false }));
    expect(map.problems.map(({ code }) => code)).toEqual(["targets"]);
  });

  test("keeps three maps in total and answers maps_limit to the fourth", async () => {
    const client = createClient();
    await save(client, VALID_MAP);
    await save(client, VALID_MAP);
    await save(client, VALID_MAP);

    await expect(save(client, VALID_MAP)).rejects.toEqual(
      expect.objectContaining({ code: "maps_limit" }),
    );
  });

  test("activates a valid map and refuses a draft with map_invalid", async () => {
    const client = createClient();
    await save(client, VALID_MAP);
    const second = await save(client, VALID_MAP);
    const draft = await save(client, DRAFT_MAP);
    const activate = () => new MutationObserver(client, activateArenaMapMutationOptions());

    expect(await activate().mutate(second.id)).toEqual(expect.objectContaining({ active: true }));
    await expect(activate().mutate(draft.id)).rejects.toEqual(
      expect.objectContaining({ code: "map_invalid" }),
    );
  });

  test("deletes a map", async () => {
    const client = createClient();
    const { id } = await save(client, VALID_MAP);

    await new MutationObserver(client, deleteArenaMapMutationOptions()).mutate(id);

    expect((await client.fetchQuery(arenaMapsQueryOptions())).maps).toEqual([]);
  });

  test("gets a random map of the format in the engine model", async () => {
    const map = await new MutationObserver(
      createClient(),
      randomArenaMapMutationOptions(),
    ).mutate();

    expect(map).toEqual(expect.objectContaining({ rows: 6, cols: 6, targets: [[4, 4]] }));
    expect(map.streams).toEqual([
      [1, 1],
      [1, 2],
    ]);
  });

  test("checks a map on the server with the bot's taps", async () => {
    const check = await new MutationObserver(createClient(), checkArenaMapMutationOptions()).mutate(
      VALID_MAP,
    );

    expect(check).toEqual({ valid: true, problems: [], bot: { moves: 1, taps: [[2, 2]] } });
  });
});

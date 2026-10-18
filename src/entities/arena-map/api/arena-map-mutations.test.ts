import { MutationObserver } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";

import { apiClient, isApiError } from "@shared/api";
import { mockServer } from "@shared/test-utils/api-mock";

import {
  BRONZE_FORMAT,
  TOO_MANY_BOMBS_MAP,
  VALID_MAP,
  createClient,
} from "../test-utils/map-fixtures";

import { activateArenaMapMutationOptions } from "./activate-arena-map-mutation";
import { arenaMapsQueryOptions } from "./arena-map-queries";
import { deleteArenaMapMutationOptions } from "./delete-arena-map-mutation";
import { randomArenaMapMutationOptions } from "./random-arena-map-mutation";
import { saveArenaMapMutationOptions } from "./save-arena-map-mutation";
import { validateArenaMapMutationOptions } from "./validate-arena-map-mutation";

const save = (client: QueryClient, map = VALID_MAP, id: string | null = null) =>
  new MutationObserver(client, saveArenaMapMutationOptions()).mutate({
    id,
    input: { name: "Fort", format: BRONZE_FORMAT, map },
  });

const codeOf = async (promise: Promise<unknown>) => {
  try {
    await promise;
    return null;
  } catch (error) {
    return isApiError(error) ? error.code : "unknown";
  }
};

describe("arena map mutations", () => {
  afterEach(() => mockServer.reset());

  test("saves a map with the server's verdict and bot norm", async () => {
    const client = createClient();

    const map = await save(client);

    expect(map).toEqual(
      expect.objectContaining({ name: "Fort", valid: true, errors: [], active: false }),
    );
    expect(map.botNorm).toEqual(expect.any(Number));
    expect(await client.fetchQuery(arenaMapsQueryOptions())).toEqual([map]);
  });

  test("saves an invalid map with the validator's codes and cells", async () => {
    const map = await save(createClient(), TOO_MANY_BOMBS_MAP);

    expect(map.valid).toBe(false);
    expect(map.botNorm).toBeNull();
    expect(map.errors.map(({ code }) => code)).toEqual(["TOO_MANY_BOMBS"]);
  });

  test("updates a saved map", async () => {
    const client = createClient();
    const { id } = await save(client);

    const map = await save(client, TOO_MANY_BOMBS_MAP, id);

    expect(map).toEqual(expect.objectContaining({ id, valid: false }));
  });

  test("keeps at most three maps per format (Part 7 §5)", async () => {
    const client = createClient();
    await save(client);
    await save(client);
    await save(client);

    expect(await codeOf(save(client))).toBe("LIMIT_REACHED");
  });

  test("activates a valid map and reports it in the arena profile", async () => {
    const client = createClient();
    const { id } = await save(client);

    const result = await new MutationObserver(client, activateArenaMapMutationOptions()).mutate(id);

    expect(result).toEqual({ activeMapId: id });
    expect((await apiClient.GET("/arena")).data?.activeMapId).toBe(id);
  });

  test("refuses to activate an invalid map", async () => {
    const client = createClient();
    const { id } = await save(client, TOO_MANY_BOMBS_MAP);

    expect(
      await codeOf(new MutationObserver(client, activateArenaMapMutationOptions()).mutate(id)),
    ).toBe("MAP_INVALID");
  });

  test("deletes an inactive map", async () => {
    const client = createClient();
    const { id } = await save(client);

    await new MutationObserver(client, deleteArenaMapMutationOptions()).mutate(id);

    expect(await client.fetchQuery(arenaMapsQueryOptions())).toEqual([]);
  });

  test("refuses to delete the active map with 409 (Part 7 §5)", async () => {
    const client = createClient();
    const { id } = await save(client);
    await new MutationObserver(client, activateArenaMapMutationOptions()).mutate(id);

    expect(
      await codeOf(new MutationObserver(client, deleteArenaMapMutationOptions()).mutate(id)),
    ).toBe("MAP_ACTIVE");
  });

  test("validates a map without saving it", async () => {
    const client = createClient();

    const result = await new MutationObserver(client, validateArenaMapMutationOptions()).mutate({
      format: BRONZE_FORMAT,
      map: TOO_MANY_BOMBS_MAP,
    });

    expect(result.valid).toBe(false);
    expect(await client.fetchQuery(arenaMapsQueryOptions())).toEqual([]);
  });

  test("generates a random map that passes the validator", async () => {
    const client = createClient();

    const { map, botNorm } = await new MutationObserver(
      client,
      randomArenaMapMutationOptions(),
    ).mutate(BRONZE_FORMAT);
    const check = await new MutationObserver(client, validateArenaMapMutationOptions()).mutate({
      format: BRONZE_FORMAT,
      map,
    });

    expect(check).toEqual(expect.objectContaining({ valid: true, botNorm }));
  });
});

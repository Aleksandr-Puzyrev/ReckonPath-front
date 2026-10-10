import { fetchAssetJson } from "./api-client";
import { ApiError } from "./api-error";
import { MOCK_API_ORIGIN } from "./mocks/mock-url";

describe("fetchAssetJson", () => {
  test("loads an asset from the CDN", async () => {
    expect(await fetchAssetJson(`${MOCK_API_ORIGIN}/cdn/skins/reef.json`)).toMatchObject({
      id: "reef",
      type: "FIELD",
    });
  });

  test("fails with the status of a missing asset", async () => {
    await expect(fetchAssetJson(`${MOCK_API_ORIGIN}/cdn/skins/none.json`)).rejects.toEqual(
      new ApiError(404, null),
    );
  });
});

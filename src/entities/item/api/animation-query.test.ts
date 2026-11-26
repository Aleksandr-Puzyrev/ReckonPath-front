import { QueryClient } from "@tanstack/react-query";

import { fetchAssetJson } from "@shared/api";
import { keyValueStorage } from "@shared/storage";

import { shopAnimationOptions } from "./animation-query";

jest.mock("@shared/api", () => ({ fetchAssetJson: jest.fn() }));

const fetchAnimation = jest.mocked(fetchAssetJson);
const animation = {
  v: "5.12.0",
  w: 320,
  h: 320,
  fr: 60,
  ip: 0,
  op: 60,
  layers: [{ nm: "color_glow" }],
};

describe("shopAnimationOptions", () => {
  const client = new QueryClient();
  const url = "https://example.test/shop/files/effect.json";

  afterEach(() => {
    client.clear();
    fetchAnimation.mockReset();
    keyValueStorage.removeItem(`shop-animation-cache:${url}`);
  });

  test("loads and reuses the composition by URL", async () => {
    fetchAnimation.mockResolvedValue(animation);
    const options = shopAnimationOptions(url);

    await expect(client.fetchQuery(options)).resolves.toMatchObject(animation);
    await expect(client.fetchQuery(options)).resolves.toMatchObject(animation);
    client.clear();
    await expect(client.fetchQuery(options)).resolves.toMatchObject(animation);
    expect(fetchAnimation).toHaveBeenCalledTimes(1);
    expect(fetchAnimation).toHaveBeenCalledWith(url);
  });

  test("rejects a composition that references a remote image", async () => {
    fetchAnimation.mockResolvedValue({
      ...animation,
      assets: [{ id: "image", p: "image.png", u: "https://example.test/" }],
    });

    await expect(client.fetchQuery(shopAnimationOptions(url))).rejects.toThrow();
  });
});

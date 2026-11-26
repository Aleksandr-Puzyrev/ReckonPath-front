import * as SecureStore from "expo-secure-store";

import { decryptOfflineLevel, savePack } from "./offline-pack";

const mockDecrypt = jest.fn();
const mockImport = jest.fn().mockResolvedValue("native-key");
const mockFromParts = jest.fn().mockReturnValue("sealed");

jest.mock("expo-crypto", () => ({
  AESEncryptionKey: { import: mockImport },
  AESSealedData: { fromParts: mockFromParts },
  aesDecryptAsync: mockDecrypt,
}));

const packId = "3d59f9d2-5c7f-4d55-9b34-35129354ca7e";
const encrypted = { number: 2, version: 1, nonce: "nonce", data: "sealed-data" };
const bytesOf = (text: string) =>
  Uint8Array.from(unescape(encodeURIComponent(text)), (ch) => ch.charCodeAt(0));

test("stores the key separately and opens a server level with pack-bound authentication data", async () => {
  const pack = await savePack({
    packId,
    alg: "A256GCM",
    key: "secret-fixture-key",
    expiresAt: "2026-12-01T00:00:00Z",
    levels: [encrypted],
  });
  mockDecrypt.mockResolvedValue(
    bytesOf(
      JSON.stringify({
        number: 2,
        version: 1,
        title: "Счёт ходов",
        level: {
          rows: 4,
          cols: 4,
          targets: [[0, 1]],
          terrain: ["....", "....", "....", "...."],
          mode: "number",
          limit: 6,
          stars: [3, 5],
          no_bomb_hint: true,
        },
      }),
    ),
  );

  const loaded = await decryptOfflineLevel(packId, encrypted);

  expect(pack).not.toHaveProperty("key");
  expect(await SecureStore.getItemAsync(`campaign-offline-key.${packId}`)).toBe(
    "secret-fixture-key",
  );
  expect(mockFromParts).toHaveBeenCalledWith("nonce", "sealed-data");
  expect(mockDecrypt).toHaveBeenCalledWith("sealed", "native-key", {
    additionalData: bytesOf(`${packId}:2:1`),
  });
  expect(loaded).toMatchObject({
    title: "Счёт ходов",
    level: { id: "c-2", bombHint: false, targets: [[0, 1]] },
  });
});

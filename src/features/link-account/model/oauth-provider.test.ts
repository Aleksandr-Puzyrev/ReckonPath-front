import { requestOAuthCode } from "./oauth-provider";

const mockPrompt = jest.fn();
const mockBuildUrl = jest.fn();

jest.mock("expo-auth-session", () => ({
  CodeChallengeMethod: { S256: "S256" },
  ResponseType: { Code: "code" },
  AuthRequest: jest.fn().mockImplementation(() => ({
    codeVerifier: "verifier-from-request",
    state: "request-state",
    makeAuthUrlAsync: mockBuildUrl,
    promptAsync: mockPrompt,
  })),
}));

describe("requestOAuthCode", () => {
  beforeEach(() => mockPrompt.mockReset());

  test("returns the authorization code, verifier, and VK device identifier", async () => {
    mockPrompt.mockResolvedValue({
      type: "success",
      params: { code: "provider-code", state: "request-state", device_id: "vk-device" },
    });

    expect(await requestOAuthCode("vkid")).toMatchObject({
      code: "provider-code",
      codeVerifier: "verifier-from-request",
      state: "request-state",
      vkDeviceId: "vk-device",
    });
  });

  test("rejects a callback with a different state before the code exchange", async () => {
    mockPrompt.mockResolvedValue({
      type: "success",
      params: { code: "provider-code", state: "different-state" },
    });

    await expect(requestOAuthCode("yandex")).rejects.toMatchObject({ code: "oauth_rejected" });
  });

  test("does not exchange a code on cancellation", async () => {
    mockPrompt.mockResolvedValue({ type: "cancel" });

    await expect(requestOAuthCode("vkid")).resolves.toBeNull();
  });
});

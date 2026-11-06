import * as WebBrowser from "expo-web-browser";

import { openPrivacyPolicy } from "./open-privacy-policy";

jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn(async () => ({})) }));

describe("openPrivacyPolicy", () => {
  test("opens the policy PDF of the API in the in-app browser (decision 0056 #4)", () => {
    openPrivacyPolicy();

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      expect.stringMatching(/\/v1\/document\?type=privacy_policy$/),
    );
  });
});

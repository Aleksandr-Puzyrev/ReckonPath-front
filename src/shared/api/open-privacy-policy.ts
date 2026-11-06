import * as WebBrowser from "expo-web-browser";

import { apiAssetUrl } from "./api-client";

const PRIVACY_POLICY_URL = apiAssetUrl("/document?type=privacy_policy");

export const openPrivacyPolicy = () => {
  void WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
};

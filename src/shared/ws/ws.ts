import { AppState } from "react-native";

import { accessToken, refreshAccessToken } from "@shared/api";
import { WS_BASE_URL } from "@shared/config";

import type * as FakeTransportModule from "../api/mocks/fake-game/fake-transport";
import type * as FakeServerModule from "../api/mocks/fake-game/fake-game-server";

import { nativeTransport } from "./native-transport";
import { createWsClient } from "./ws-client";
import type { WsTransport } from "./ws-transport";

const resolveBackend = (): { origin: string; transport: WsTransport } => {
  // As in the REST client: a require nested in __DEV__ keeps the fake server out of release builds; the casts only name the modules' types (как в REST-клиенте: require внутри __DEV__ не пускает фейк-сервер в релиз; приведения лишь называют типы модулей).
  if (__DEV__) {
    if (WS_BASE_URL === "") {
      /* eslint-disable @typescript-eslint/no-require-imports */
      const { fakeTransport } =
        require("../api/mocks/fake-game/fake-transport") as typeof FakeTransportModule;
      const { FAKE_WS_ORIGIN } =
        require("../api/mocks/fake-game/fake-game-server") as typeof FakeServerModule;
      /* eslint-enable @typescript-eslint/no-require-imports */
      return { origin: FAKE_WS_ORIGIN, transport: fakeTransport };
    }
  }
  return { origin: WS_BASE_URL, transport: nativeTransport };
};

export const ws = createWsClient({
  ...resolveBackend(),
  accessToken,
  refreshToken: refreshAccessToken,
});

AppState.addEventListener("change", ws.handleAppState);

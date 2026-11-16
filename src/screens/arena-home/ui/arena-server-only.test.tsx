import { render, screen } from "@testing-library/react-native";

import { i18n } from "@shared/i18n";
import { mockServer, passMockLevels } from "@shared/test-utils/api-mock";
import { createQueryWrapper } from "@shared/test-utils/query-wrapper";

import ArenaHomeScreen from "./arena-home-screen";

jest.mock("expo-router", () => ({ router: { push: jest.fn(), navigate: jest.fn() } }));
jest.mock("@shared/config", () => ({
  ...jest.requireActual("@shared/config"),
  HAS_ARENA_SERVER: false,
}));
jest.mock("@widgets/board", () => ({ BoardMapPreview: () => null }));
jest.mock("@shared/ui/sheet", () => ({ Sheet: () => null }));

describe("ArenaHomeScreen without a backend", () => {
  beforeAll(() => i18n.changeLanguage("ru"));

  afterEach(() => mockServer.reset());

  test("tells that the arena needs the server in a dev build without a backend (decision 0060 #11)", async () => {
    passMockLevels(12);
    await render(<ArenaHomeScreen />, { wrapper: createQueryWrapper() });

    expect(screen.getByText("Арена доступна только с сервером")).toBeOnTheScreen();
    expect(screen.queryByText("Сигнал против сигнала.")).toBeNull();
  });
});

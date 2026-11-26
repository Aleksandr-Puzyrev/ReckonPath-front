import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render } from "@testing-library/react-native";
import { View } from "react-native";

import { inventoryQueryOptions, shopAnimationOptions } from "@entities/item";
import type { EffectSlot, Inventory } from "@entities/item";

import { computeBoardGeometry } from "../model/board-geometry";
import { useBoardFx } from "../model/use-board-fx";
import type { BoardFx } from "../model/use-board-fx";

import EquippedBoardEffects from "./equipped-board-effects";

jest.mock("lottie-react-native", () => ({
  __esModule: true,
  default: jest.fn(({ testID }: { testID: string }) => {
    const { View: NativeView } = jest.requireActual<{ View: typeof View }>("react-native");
    return <NativeView testID={testID} />;
  }),
}));

const slots = ["fxClick", "fxReveal", "fxVictory"] as const;
const url = (slot: EffectSlot) => `https://example.test/${slot}.json`;
const geometry = computeBoardGeometry(4, 4, 320);
const source = {
  v: "5.12.0",
  w: 100,
  h: 100,
  fr: 60,
  ip: 0,
  op: 60,
  layers: [{ nm: "signal" }],
  assets: [],
};

const renderEffects = async (loaded: readonly EffectSlot[]) => {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, gcTime: Infinity, retry: false } },
  });
  const inventory: Inventory = {
    items: slots.map((slot) => {
      const animation = { url: url(slot), colorFilters: [] };
      return {
        itemId: slot,
        slot,
        item: {
          name: slot,
          description: "",
          rarity: "rare",
          preview: "",
          skinUrl: "",
          animation: { light: animation, dark: animation, loop: true },
        },
      };
    }),
    loadout: { fxClick: "fxClick", fxReveal: "fxReveal", fxVictory: "fxVictory" },
  };
  client.setQueryData(inventoryQueryOptions().queryKey, inventory);
  for (const slot of loaded) client.setQueryData(shopAnimationOptions(url(slot)).queryKey, source);
  let boardFx: BoardFx | undefined;
  const Board = () => {
    const fx = useBoardFx();
    boardFx = fx;
    return (
      <View>
        <EquippedBoardEffects geometry={geometry} fx={fx} />
      </View>
    );
  };
  const screen = await render(
    <QueryClientProvider client={client}>
      <Board />
    </QueryClientProvider>,
  );
  return { screen, client, fx: () => boardFx };
};

describe("equipped board effects", () => {
  test("plays an equipped tap, then keeps the reveal and victory within the two-effect limit", async () => {
    const { screen, client, fx } = await renderEffects(slots);
    await act(() => fx()?.tap(3));

    expect(screen.getByTestId("fxClick", { includeHiddenElements: true })).toBeTruthy();

    await act(() =>
      fx()?.play(3, [
        { type: "targetFound", cell: 3, left: 0 },
        { type: "win", moves: 1, stars: 3 },
      ]),
    );

    expect(screen.queryByTestId("fxClick", { includeHiddenElements: true })).toBeNull();
    expect(screen.getByTestId("fxReveal", { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId("fxVictory", { includeHiddenElements: true })).toBeTruthy();
    await screen.unmount();
    client.clear();
  });

  test("does not replay an earlier tap when its asset becomes available", async () => {
    const { screen, client, fx } = await renderEffects(["fxReveal", "fxVictory"]);
    await act(() => fx()?.tap(3));

    expect(screen.queryByTestId("fxClick", { includeHiddenElements: true })).toBeNull();
    await act(() => {
      client.setQueryData(shopAnimationOptions(url("fxClick")).queryKey, source);
    });
    expect(screen.queryByTestId("fxClick", { includeHiddenElements: true })).toBeNull();
    await screen.unmount();
    client.clear();
  });
});

import { act, render } from "@testing-library/react-native";
import { BackHandler } from "react-native";

import Sheet from "./sheet";

jest.mock("@gorhom/bottom-sheet", () => jest.requireActual("./test-utils/bottom-sheet-mock"));

const userDismiss = jest.requireActual("./test-utils/bottom-sheet-mock")
  .dismissByUser as () => void;

describe("Sheet", () => {
  test("does not report a close requested by its parent", async () => {
    const onDismiss = jest.fn();
    const view = await render(
      <Sheet isOpen onDismiss={onDismiss}>
        {null}
      </Sheet>,
    );
    await view.rerender(
      <Sheet isOpen={false} onDismiss={onDismiss}>
        {null}
      </Sheet>,
    );
    expect(onDismiss).not.toHaveBeenCalled();
  });

  test("does not report the close caused by leaving the screen", async () => {
    const onDismiss = jest.fn();
    const view = await render(
      <Sheet isOpen onDismiss={onDismiss}>
        {null}
      </Sheet>,
    );
    await view.unmount();
    await act(async () => userDismiss());
    expect(onDismiss).not.toHaveBeenCalled();
  });

  test("reports a close by the user", async () => {
    const onDismiss = jest.fn();
    await render(
      <Sheet isOpen onDismiss={onDismiss}>
        {null}
      </Sheet>,
    );
    await act(async () => userDismiss());
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test("closes on Android Back when it can be dismissed", async () => {
    const listen = jest.spyOn(BackHandler, "addEventListener");
    const onDismiss = jest.fn();
    await render(
      <Sheet isOpen onDismiss={onDismiss}>
        {null}
      </Sheet>,
    );
    const handler = listen.mock.calls.at(-1)?.[1];
    expect(handler?.({ type: "hardwareBackPress", timeStamp: 0 })).toBe(true);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    listen.mockRestore();
  });
});

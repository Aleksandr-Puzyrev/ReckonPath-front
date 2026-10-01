import { act, render } from "@testing-library/react-native";

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
});

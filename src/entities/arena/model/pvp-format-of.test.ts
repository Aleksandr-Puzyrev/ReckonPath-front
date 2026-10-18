import { pvpFormatOf } from "./pvp-format-of";

describe("pvpFormatOf", () => {
  test("maps the server's singular limit keys to the engine's plural ones (decision 0029 #6)", () => {
    const format = pvpFormatOf({
      size: 7,
      targets: 2,
      turnSec: 7,
      bombHint: true,
      limits: { fence: 8, stream: 7, heavy: 3, rock: 6, bridge: 2, bomb: 4 },
    });

    expect(format).toEqual({
      size: 7,
      targets: 2,
      limits: { fences: 8, streams: 7, heavy: 3, rocks: 6, bridges: 2, bombs: 4 },
    });
  });
});

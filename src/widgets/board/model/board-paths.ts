import { Skia } from "@shopify/react-native-skia";

const ICON_BOX = 24;

const pathOf = (svg: string) => Skia.Path.MakeFromSVGString(svg) ?? Skia.Path.Make();

export const createBoardPaths = () => ({
  box: ICON_BOX,
  mineSpikes: pathOf(
    "M12 1.8v3.4M12 18.8v3.4M1.8 12h3.4M18.8 12h3.4M4.8 4.8l2.4 2.4M16.8 16.8l2.4 2.4M4.8 19.2l2.4-2.4M16.8 7.2l2.4-2.4",
  ),
  arrow: pathOf("M12 3.5l6.5 7.5h-4.2V20h-4.6v-9H5.5z"),
  beaconTower: pathOf("M9.5 22h5l-1.2-12h-2.6zM8.5 9.5h7l-1-3h-5zM10.5 6h3V3h-3z"),
});

export type BoardPaths = ReturnType<typeof createBoardPaths>;

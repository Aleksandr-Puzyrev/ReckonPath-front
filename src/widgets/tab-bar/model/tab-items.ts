import type { FC } from "react";
import type { SvgProps } from "react-native-svg";

import ArenaIcon from "@assets/icons/tabs/arena.svg";
import LevelsIcon from "@assets/icons/tabs/levels.svg";
import PlayIcon from "@assets/icons/tabs/play.svg";
import ProfileIcon from "@assets/icons/tabs/profile.svg";
import ShopIcon from "@assets/icons/tabs/shop.svg";

export interface TabItem {
  routeName: string;
  labelKey: "tabs.play" | "tabs.levels" | "tabs.arena" | "tabs.shop" | "tabs.profile";
  Icon: FC<SvgProps>;
}

export const TAB_ITEMS: readonly TabItem[] = [
  { routeName: "index", labelKey: "tabs.play", Icon: PlayIcon },
  { routeName: "levels", labelKey: "tabs.levels", Icon: LevelsIcon },
  { routeName: "arena", labelKey: "tabs.arena", Icon: ArenaIcon },
  { routeName: "shop", labelKey: "tabs.shop", Icon: ShopIcon },
  { routeName: "profile", labelKey: "tabs.profile", Icon: ProfileIcon },
];

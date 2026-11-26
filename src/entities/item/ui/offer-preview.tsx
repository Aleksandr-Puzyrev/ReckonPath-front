import { Image } from "expo-image";
import { View } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import MineIcon from "@assets/icons/play/mine.svg";
import FlagIcon from "@assets/icons/play/flag.svg";
import StarIcon from "@assets/icons/play/star.svg";
import LevelsIcon from "@assets/icons/tabs/levels.svg";
import ProfileIcon from "@assets/icons/tabs/profile.svg";
import ShopIcon from "@assets/icons/tabs/shop.svg";

import type { Rarity, Slot } from "../model/item-type";
import type { ProfileTextures } from "../model/shop-texture";
import { rarityLookOf } from "../model/rarity-look";

import { styles } from "./offer-preview-styles";

interface IOfferPreview {
  preview: string;
  profileTextures?: ProfileTextures | undefined;
  rarity: Rarity;
  slot: Slot | "bundle";
}

const ICONS = {
  field: LevelsIcon,
  fence: FlagIcon,
  stream: FlagIcon,
  rock: FlagIcon,
  x2: FlagIcon,
  bridge: FlagIcon,
  target: FlagIcon,
  buoy: FlagIcon,
  beacon: FlagIcon,
  number: FlagIcon,
  bomb: MineIcon,
  avatar: ProfileIcon,
  frame: ProfileIcon,
  title: ProfileIcon,
  fxClick: StarIcon,
  fxReveal: StarIcon,
  fxVictory: StarIcon,
  bundle: ShopIcon,
} satisfies Record<Slot | "bundle", unknown>;

const OfferPreview = ({ preview, profileTextures, rarity, slot }: IOfferPreview) => {
  const { theme, rt } = useUnistyles();
  const texture = profileTextures?.[rt.themeName === "light" ? "light" : "dark"];
  const look = rarityLookOf(rarity);
  styles.useVariants({ rarity: look });
  const Icon = ICONS[slot];
  const iconSize = theme.sizes.icon.xl;

  const source = texture ?? preview;
  if (source !== "") {
    return (
      <Image
        source={source}
        recyclingKey={source}
        style={styles.preview}
        contentFit={slot === "frame" ? "contain" : "cover"}
      />
    );
  }

  return (
    <View style={[styles.preview, styles.placeholder]}>
      <Icon width={iconSize} height={iconSize} color={theme.colors.rarity[look]} />
    </View>
  );
};

export default OfferPreview;

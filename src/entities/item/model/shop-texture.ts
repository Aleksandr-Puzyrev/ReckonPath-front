import { apiAssetUrl } from "@shared/api";

import type { ShopItemView } from "./item-type";

const TEXTURE_PATH = /^\/shop\/files\/[0-9a-f]{64}\.(png|jpg)$/;

export const shopTextureUrl = (path: string | undefined) =>
  path !== undefined && TEXTURE_PATH.test(path) ? apiAssetUrl(path) : undefined;

export interface ProfileTextures {
  light?: string | undefined;
  dark?: string | undefined;
}

export const profileTexturesOf = (item: ShopItemView | undefined): ProfileTextures | undefined => {
  if (item?.render !== "textures" || (item.kind !== "avatar" && item.kind !== "frame")) {
    return undefined;
  }
  const light = shopTextureUrl(item.textures?.[item.kind]);
  const dark = item.singleTheme === true ? light : shopTextureUrl(item.dark?.textures?.[item.kind]);
  return light === undefined && dark === undefined ? undefined : { light, dark };
};

import skin from "./default-skin.json";

export type BoardSkin = (typeof skin)["dark"] & { elements: (typeof skin)["elements"] };

// TODO: load the equipped skin (skin.json from the shop) with this one as the fallback
export const boardSkinFor = (theme: "light" | "dark"): BoardSkin => ({
  ...skin[theme],
  elements: skin.elements,
});

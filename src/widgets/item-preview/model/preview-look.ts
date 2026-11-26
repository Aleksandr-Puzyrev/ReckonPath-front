import type { SkinData } from "@entities/item";

export type PreviewTheme = "light" | "dark";

export interface PreviewLook {
  packageUrl: string | null;
  theme: PreviewTheme;
  skin?: SkinData;
}

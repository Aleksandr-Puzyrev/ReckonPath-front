export const fontFamily = {
  inter: "Inter",
  unbounded: "Unbounded",
} as const;

export const MAX_FONT_SCALE = 1.3;
const NO_FONT_SCALE = 1;

type FontWeight = "500" | "600" | "700" | "800";

// Narrower than TextStyle so that Unistyles accepts it (уже, чем TextStyle, чтобы его принимал Unistyles).
interface TypeStyleValues {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
  letterSpacing: number;
  textTransform?: "uppercase";
  fontVariant?: "tabular-nums"[];
}

interface TypeStyle {
  style: TypeStyleValues;
  maxFontSizeMultiplier: number;
}

const type = (
  family: string,
  fontSize: number,
  lineHeight: number,
  fontWeight: FontWeight,
  trackingPercent: number,
  extra: { style?: Partial<TypeStyleValues>; maxFontSizeMultiplier?: number } = {},
): TypeStyle => ({
  style: {
    fontFamily: family,
    fontSize,
    lineHeight,
    fontWeight,
    letterSpacing: (fontSize * trackingPercent) / 100,
    ...extra.style,
  },
  maxFontSizeMultiplier: extra.maxFontSizeMultiplier ?? MAX_FONT_SCALE,
});

const fixedScale = { maxFontSizeMultiplier: NO_FONT_SCALE };
const uppercase = { textTransform: "uppercase" } as const;
const tabular = { fontVariant: ["tabular-nums" as const] };

export const typography = {
  "display.xl": type(fontFamily.unbounded, 40, 44, "800", -2, fixedScale),
  "display.l": type(fontFamily.unbounded, 32, 36, "800", -2, fixedScale),
  "display.m": type(fontFamily.unbounded, 26, 30, "700", -1, fixedScale),
  "title.l": type(fontFamily.inter, 22, 28, "800", -1),
  "title.m": type(fontFamily.inter, 18, 24, "700", 0),
  "title.s": type(fontFamily.inter, 16, 22, "700", 0),
  "body.l": type(fontFamily.inter, 17, 24, "500", 0),
  "body.m": type(fontFamily.inter, 15, 22, "500", 0),
  "body.s": type(fontFamily.inter, 13, 18, "500", 0),
  caption: type(fontFamily.inter, 12, 16, "600", 1),
  eyebrow: type(fontFamily.inter, 11, 14, "800", 12, { style: uppercase }),
  tab: type(fontFamily.inter, 11, 13, "800", 4, { ...fixedScale, style: uppercase }),
  "button.l": type(fontFamily.inter, 17, 22, "800", 2),
  "button.m": type(fontFamily.inter, 15, 20, "800", 2),
  "button.s": type(fontFamily.inter, 13, 18, "800", 2),
  "number.counter": type(fontFamily.unbounded, 20, 24, "700", 0, { style: tabular }),
  "number.timer": type(fontFamily.unbounded, 28, 32, "800", 0, { style: tabular }),
} satisfies Record<string, TypeStyle>;

export type TypographyVariant = keyof typeof typography;

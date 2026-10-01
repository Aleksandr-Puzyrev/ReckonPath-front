import { BlurStyle, PaintStyle, Skia, TileMode, vec } from "@shopify/react-native-skia";
import type { SkCanvas, SkFont, SkPaint, SkPath } from "@shopify/react-native-skia";

export const roundRect = (x: number, y: number, width: number, height: number, radius: number) => {
  "worklet";
  return Skia.RRectXY(Skia.XYWHRect(x, y, width, height), radius, radius);
};

export const solidPaint = (color: string, alpha = 1) => {
  "worklet";
  const paint = Skia.Paint();
  const skColor = Skia.Color(color);
  paint.setAntiAlias(true);
  paint.setColor(skColor);
  // The colour may carry its own alpha (rgba), so the extra alpha multiplies it (у цвета может быть своя прозрачность, поэтому дополнительная умножается на неё).
  paint.setAlphaf((skColor[3] ?? 1) * alpha);
  return paint;
};

export const strokePaint = (color: string, width: number, alpha = 1) => {
  "worklet";
  const paint = solidPaint(color, alpha);
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeWidth(width);
  return paint;
};

export const glowPaint = (color: string, blur: number) => {
  "worklet";
  const paint = solidPaint(color);
  paint.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, blur, true));
  return paint;
};

export const diagonalGradient = (
  x: number,
  y: number,
  size: number,
  colors: readonly string[],
  alpha = 1,
) => {
  "worklet";
  const paint = solidPaint(colors[0] ?? "", alpha);
  paint.setShader(
    Skia.Shader.MakeLinearGradient(
      vec(x, y),
      vec(x + size, y + size),
      colors.map((color) => Skia.Color(color)),
      null,
      TileMode.Clamp,
    ),
  );
  return paint;
};

export const radialGradient = (
  cx: number,
  cy: number,
  radius: number,
  colors: readonly string[],
) => {
  "worklet";
  const paint = solidPaint(colors[0] ?? "");
  paint.setShader(
    Skia.Shader.MakeRadialGradient(
      vec(cx, cy),
      radius,
      colors.map((color) => Skia.Color(color)),
      null,
      TileMode.Clamp,
    ),
  );
  return paint;
};

export const drawIcon = (
  canvas: SkCanvas,
  path: SkPath,
  box: number,
  x: number,
  y: number,
  size: number,
  paint: SkPaint,
) => {
  "worklet";
  canvas.save();
  canvas.translate(x, y);
  canvas.scale(size / box, size / box);
  canvas.drawPath(path, paint);
  canvas.restore();
};

export const drawCenteredText = (
  canvas: SkCanvas,
  text: string,
  cx: number,
  cy: number,
  font: SkFont,
  paint: SkPaint,
) => {
  "worklet";
  const width = font.measureText(text).width;
  const { ascent, descent } = font.getMetrics();
  canvas.drawText(text, cx - width / 2, cy - (ascent + descent) / 2, paint, font);
};

import { Text as NativeText } from "react-native";
import type { TextProps } from "react-native";

import { typography } from "@shared/theme";
import type { TypographyVariant } from "@shared/theme";

import { styles } from "./text-styles";

interface IText extends TextProps {
  variant?: TypographyVariant;
}

const Text = ({ variant = "body.m", style, ...props }: IText) => {
  styles.useVariants({ variant });

  return (
    <NativeText
      maxFontSizeMultiplier={typography[variant].maxFontSizeMultiplier}
      {...props}
      style={[styles.text, style]}
    />
  );
};

export default Text;

import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, useTheme } from "@/theme";
import { createHomeStyles } from "./home.styles";

export function useHomeStyles() {
  const { language } = useLanguage();
  const { colorScheme } = useTheme();

  const themeColors = getColors(colorScheme);

  return createHomeStyles(language, themeColors);
}

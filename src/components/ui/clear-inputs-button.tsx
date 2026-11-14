import { Pressable, StyleSheet, Text } from "react-native";

import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, getTypography, radius, spacing, useTheme } from "@/theme";

type Props = {
  onPress: () => void;
  disabled: boolean;
};

export default function ClearInputsButton({ onPress, disabled }: Props) {
  const { t, language } = useLanguage();
  const { colorScheme } = useTheme();

  const colors = getColors(colorScheme);
  const typography = getTypography(language);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? colors.background : colors.primarySoft,
        },
      ]}
    >
      <Text
        style={[
          typography.regular,
          styles.text,
          {
            color: disabled ? colors.textMuted : colors.primary,
          },
        ]}
      >
        {t("discountClear")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    borderRadius: radius.md,
  },
  text: {
    fontSize: 14,
  },
});

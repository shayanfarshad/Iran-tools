import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, getTypography, radius, spacing, useTheme } from "@/theme";

import type { ThemeColors } from "@/theme";

type ToolCardProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  onPress?: () => void;
  locked?: boolean;
};

export default function ToolCard({
  title,
  description,
  icon,
  disabled = false,
  onPress,
  locked = false,
}: ToolCardProps) {
  const { language } = useLanguage();
  const { colorScheme } = useTheme();
  const { fontScale } = useWindowDimensions();

  const themeColors = getColors(colorScheme);
  const styles = createToolCardStyles(language, themeColors, fontScale);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.toolCardTop}>
        <View style={styles.toolIcon}>
          <Ionicons name={icon} size={22} color={themeColors.primary} />
        </View>

        {locked && (
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={themeColors.textMuted}
          />
        )}
      </View>

      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>

      <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
        {description}
      </Text>
    </Pressable>
  );
}

function createToolCardStyles(
  language: "fa" | "en",
  colors: ThemeColors,
  fontScale: number,
) {
  const typography = getTypography(language);

  return StyleSheet.create({
    card: {
      width: "100%",
      // Reserve one title line and two description lines at every font size.
      height: 160 + 62 * (Math.max(1, fontScale) - 1),
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    toolCardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    toolIcon: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      ...typography.bodyMedium,
      lineHeight: 24,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    description: {
      ...typography.caption,
      color: colors.textSecondary,
      lineHeight: 19,
    },
    disabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.75,
    },
  });
}

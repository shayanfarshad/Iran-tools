import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useLanguage } from "@/lib/providers/language-provider";
import { colors, getTypography, radius, spacing } from "@/theme";

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
  const styles = createToolCardStyles(language);

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
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>

        {locked && (
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={colors.textMuted}
          />
        )}
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

function createToolCardStyles(language: "fa" | "en") {
  const typography = getTypography(language);

  return StyleSheet.create({
    card: {
      width: "100%",
      minHeight: 150,
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

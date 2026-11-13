import { Pressable, StyleSheet, Text, View } from "react-native";

import ScreenContainer from "@/components/screen-scroll-container";
import { useLanguage } from "@/lib/providers/language-provider";
import { colors, getTypography, radius, spacing } from "@/theme";

export default function SettingsScreen() {
  const { language, t, changeLanguage } = useLanguage();
  const styles = createSettingsStyles(language);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>{t("settingsTitle")}</Text>

        <Text style={styles.sectionTitle}>{t("language")}</Text>

        <Text style={styles.description}>{t("selectLanguage")}</Text>

        <Pressable
          style={[
            styles.languageOption,
            language === "fa" && styles.selectedOption,
          ]}
          onPress={() => changeLanguage("fa")}
        >
          <Text style={styles.languageName}>فارسی</Text>
          <View
            style={[styles.radio, language === "fa" && styles.selectedRadio]}
          />
        </Pressable>

        <Pressable
          style={[
            styles.languageOption,
            language === "en" && styles.selectedOption,
          ]}
          onPress={() => changeLanguage("en")}
        >
          <Text style={styles.languageName}>English</Text>
          <View
            style={[styles.radio, language === "en" && styles.selectedRadio]}
          />
        </Pressable>

        <Text style={styles.hint}>{t("languageChangeHint")}</Text>
      </View>
    </ScreenContainer>
  );
}

function createSettingsStyles(language: "fa" | "en") {
  const typography = getTypography(language);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
    },
    title: {
      ...typography.title,
      color: colors.text,
      marginBottom: spacing.xxl,
    },
    sectionTitle: {
      ...typography.heading,
      color: colors.text,
    },
    description: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
    languageOption: {
      minHeight: 60,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    selectedOption: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    languageName: {
      ...typography.bodyMedium,
      color: colors.text,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
    },
    selectedRadio: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    hint: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: spacing.md,
    },
  });
}

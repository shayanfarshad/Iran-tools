import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useLanguage } from "@/lib/providers/language-provider";
import { colors } from "@/theme";
import { useHomeStyles } from "../use-home-styles";
export default function HomeHeader() {
  const { t } = useLanguage();
  const styles = useHomeStyles();

  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.appName}>{t("appName")}</Text>
        <Text style={styles.subtitle}>{t("homeSubtitle")}</Text>
      </View>

      <Link href="/settings" asChild>
        <Pressable
          style={styles.settingsButton}
          accessibilityRole="button"
          accessibilityLabel={t("settingsTitle")}
        >
          <Ionicons name="settings-outline" size={23} color={colors.text} />
        </Pressable>
      </Link>
    </View>
  );
}

import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import ScreenContainer from "@/components/screen-scroll-container";
import HomeHeader from "@/features/home/components/home-header";
import HomeSearch from "@/features/home/components/home-search";
import HomeToolsSection from "@/features/home/components/home-tools-section";
import PremiumBanner from "@/features/home/components/premium-banner";
import { createHomeStyles } from "@/features/home/home.styles";
import { tools } from "@/features/tools/tools";
import { useLanguage } from "@/lib/providers/language-provider";
import { usePremium } from "@/lib/providers/premium-provider";
import { getColors, useTheme } from "@/theme";

export default function HomeScreen() {
  const { t, language } = useLanguage();
  const { isPremium } = usePremium();
  const { colorScheme } = useTheme();
  const themeColors = getColors(colorScheme);

  const styles = createHomeStyles(language, themeColors);
  const [search, setSearch] = useState("");

  const filteredTools = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    if (!query) return tools;

    return tools.filter((tool) => {
      const title = t(tool.titleKey).toLocaleLowerCase();
      const description = t(tool.descriptionKey).toLocaleLowerCase();

      return title.includes(query) || description.includes(query);
    });
  }, [search, t]);

  return (
    <ScreenContainer
      style={styles.screen}
      contentContainerStyle={styles.container}
    >
      <HomeHeader />

      <View style={styles.welcomeSection}>
        <Text style={styles.title}>{t("homeTitle")}</Text>
      </View>

      <HomeSearch onSearchChange={setSearch} />

      {!isPremium && <PremiumBanner />}

      <HomeToolsSection tools={filteredTools} />
    </ScreenContainer>
  );
}

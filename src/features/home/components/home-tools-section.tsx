import { router } from "expo-router";
import { Text, View } from "react-native";

import ToolCard from "@/components/tools/tool-card";
import type { ToolDefinition } from "@/features/tools/tools";
import { useLanguage } from "@/lib/providers/language-provider";
import { usePremium } from "@/lib/providers/premium-provider";

import { useHomeStyles } from "../use-home-styles";

type HomeToolsSectionProps = {
  tools: readonly ToolDefinition[];
};

export default function HomeToolsSection({ tools }: HomeToolsSectionProps) {
  const { t } = useLanguage();
  const styles = useHomeStyles();
  const { isPremium } = usePremium();

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("toolsTitle")}</Text>
      </View>

      {tools.length > 0 ? (
        <View style={styles.toolsGrid}>
          {tools.map((tool) => (
            <View key={tool.id} style={styles.toolCardWrapper}>
              <ToolCard
                title={t(tool.titleKey)}
                description={t(tool.descriptionKey)}
                icon={tool.icon}
                disabled={!tool.route && (tool.access === "free" || isPremium)}
                onPress={() => {
                  if (tool.access === "premium" && !isPremium) {
                    router.push("/premium");
                    return;
                  }

                  if (tool.route) {
                    router.push(tool.route);
                  }
                }}
                locked={tool.access === "premium" && !isPremium}
              />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{t("noToolsFound")}</Text>
        </View>
      )}
    </>
  );
}

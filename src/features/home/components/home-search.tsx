import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { TextInput, View } from "react-native";

import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, useTheme } from "@/theme";
import { useHomeStyles } from "../use-home-styles";

type HomeSearchProps = {
  onSearchChange: (value: string) => void;
};

export default function HomeSearch({ onSearchChange }: HomeSearchProps) {
  const { t, language } = useLanguage();
  const { colorScheme } = useTheme();

  const colors = getColors(colorScheme);
  const styles = useHomeStyles();

  const [search, setSearch] = useState("");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  return (
    <View style={styles.searchContainer}>
      <Ionicons
        name="search-outline"
        size={22}
        color={colors.textSecondary}
        style={styles.searchIcon}
      />

      <TextInput
        value={search}
        onChangeText={handleSearchChange}
        placeholder={t("searchPlaceholder")}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.searchInput,
          { textAlign: language === "fa" ? "right" : "left" },
        ]}
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
    </View>
  );
}

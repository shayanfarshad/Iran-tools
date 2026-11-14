import type { ReactNode } from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";

import { createDiscountStyles } from "@/features/tools/styles/discount.styles";
import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, useTheme } from "@/theme";

type ResultItem = {
  label: string;
  value: string;
  color?: string;
  description?: string;
};

type Props = {
  summaries: readonly ResultItem[];
  rows?: readonly ResultItem[];
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function CalculationResult({
  summaries,
  rows = [],
  children,
  style,
}: Props) {
  const { t, language } = useLanguage();
  const { colorScheme } = useTheme();

  const colors = getColors(colorScheme);
  const styles = createDiscountStyles(language, colors);

  return (
    <View style={[styles.resultCard, style]}>
      <Text style={styles.resultTitle}>{t("calculateResult")}</Text>

      {summaries.map((item) => (
        <View key={item.label} style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{item.label}</Text>

          <Text
            accessibilityLiveRegion="polite"
            style={[
              styles.summaryValue,
              { color: item.color ?? colors.primary },
            ]}
          >
            {item.value}
          </Text>

          {item.description ? (
            <Text
              style={[
                styles.summaryLabel,
                { color: item.color ?? colors.textSecondary },
              ]}
            >
              {item.description}
            </Text>
          ) : null}
        </View>
      ))}

      {rows.map((item, index) => (
        <View
          key={item.label}
          style={[
            styles.resultRow,
            index === rows.length - 1 && styles.lastResultRow,
          ]}
        >
          <Text style={styles.resultLabel}>{item.label}</Text>

          <Text
            style={[styles.resultValue, { color: item.color ?? colors.text }]}
          >
            {item.value}
          </Text>
        </View>
      ))}

      {children}
    </View>
  );
}

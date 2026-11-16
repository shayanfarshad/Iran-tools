import { useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, spacing, useTheme } from "@/theme";
import { createDiscountStyles } from "@/features/tools/styles/discount.styles";

export function useTripUI() {
  const language = useLanguage();
  const { colorScheme } = useTheme();
  const colors = getColors(colorScheme);
  return { ...language, colors, styles: createDiscountStyles(language.language, colors) };
}
export function TripAction({ children, onPress, disabled = false, danger = false }: { children: ReactNode; onPress: () => void; disabled?: boolean; danger?: boolean }) {
  const { styles, colors } = useTripUI();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[styles.clearButton, { backgroundColor: colors.primarySoft, paddingHorizontal: spacing.md, opacity: disabled ? 0.5 : 1 }]}>
    <Text style={[styles.clearButtonText, { color: danger ? colors.danger : colors.primary }]}>{children}</Text>
  </Pressable>;
}
export function TripTextField({ label, value, onChange, disabled, placeholder }: { label: string; value: string; onChange: (text: string) => void; disabled: boolean; placeholder?: string }) {
  const { styles, colors, language } = useTripUI();
  return <View style={{ gap: spacing.sm }}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} editable={!disabled} maxLength={80} placeholder={placeholder} placeholderTextColor={colors.textMuted} style={[styles.input, { textAlign: language === "fa" ? "right" : "left" }]} />
    </View>
  </View>;
}
export function TripDelete({ onDelete, disabled, message }: { onDelete: () => Promise<boolean>; disabled: boolean; message: string }) {
  const { t, styles } = useTripUI();
  const [confirm, setConfirm] = useState(false);
  if (!confirm) return <TripAction danger disabled={disabled} onPress={() => setConfirm(true)}>{t("tripDelete")}</TripAction>;
  return <View style={styles.formCard}>
    <Text style={styles.errorText}>{message}</Text>
    <TripAction danger disabled={disabled} onPress={() => { void onDelete().then(success => { if (success) setConfirm(false); }); }}>{t("tripDelete")}</TripAction>
    <TripAction disabled={disabled} onPress={() => setConfirm(false)}>{t("tripCancel")}</TripAction>
  </View>;
}

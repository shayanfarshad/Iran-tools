import { useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import NumericInput from "@/components/ui/numeric-input";
import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, spacing, useTheme } from "@/theme";
import { createDiscountStyles } from "../tools/styles/discount.styles";
import { localToday, persianFields, type DateFields } from "./model";

export function useVehicleUI() {
  const locale = useLanguage();
  const { colorScheme } = useTheme();
  const colors = getColors(colorScheme);
  return { ...locale, colors, styles: createDiscountStyles(locale.language, colors) };
}
export function Action({ children, onPress, disabled = false, danger = false }: {
  children: ReactNode; onPress: () => void; disabled?: boolean; danger?: boolean;
}) {
  const { styles, colors } = useVehicleUI();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={[styles.clearButton, { backgroundColor: disabled ? colors.background : colors.primarySoft, paddingHorizontal: spacing.md }]}>
    <Text style={[styles.clearButtonText, { color: disabled ? colors.textMuted : danger ? colors.danger : colors.primary }]}>{children}</Text>
  </Pressable>;
}
export function Choices<T extends string>({ options, value, onChange, disabled = false }: {
  options: readonly { value: T; label: string }[]; value: T; onChange: (value: T) => void; disabled?: boolean;
}) {
  const { styles, direction } = useVehicleUI();
  return <View style={[styles.currencyContainer, { direction, flexWrap: "wrap" }]}>
    {options.map(option => <Pressable key={option.value} accessibilityRole="button"
      accessibilityState={{ selected: option.value === value, disabled }} disabled={disabled}
      onPress={() => onChange(option.value)}
      style={[styles.currencyButton, { minWidth: options.length > 3 ? "40%" : 0, minHeight: 44, padding: spacing.sm, opacity: disabled ? 0.5 : 1 }, option.value === value && styles.activeCurrencyButton]}>
      <Text style={[styles.currencyText, { textAlign: "center" }, option.value === value && styles.activeCurrencyText]}>{option.label}</Text>
    </Pressable>)}
  </View>;
}
export function TextField({ label, value, onChange, disabled, placeholder }: {
  label: string; value: string; onChange: (value: string) => void; disabled: boolean; placeholder?: string;
}) {
  const { styles, colors, language } = useVehicleUI();
  return <>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} editable={!disabled} maxLength={80}
        placeholder={placeholder} placeholderTextColor={colors.textMuted} style={[styles.input, { textAlign: language === "fa" ? "right" : "left" }]} />
    </View>
  </>;
}
export function NumberField({ label, value, onChange, disabled, suffix, placeholder }: {
  label: string; value: string; onChange: (value: string) => void; disabled: boolean; suffix: string; placeholder: string;
}) {
  const { styles, colors, language } = useVehicleUI();
  const example = language === "fa" ? placeholder.replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]) : placeholder;
  return <>
    <Text style={styles.label}>{label}</Text>
    <NumericInput accessibilityLabel={label} value={value} onChangeText={onChange} editable={!disabled} language={language}
      placeholder={example} placeholderTextColor={colors.textMuted} suffix={suffix} maxLength={24}
      containerStyle={styles.inputWrapper} inputStyle={styles.input} suffixStyle={styles.inputSuffix} />
  </>;
}
const dateFields = [
  { key: "day", label: "dateDay", max: 2 },
  { key: "month", label: "dateMonth", max: 2 },
  { key: "year", label: "dateYear", max: 4 },
] as const;
export function DateInput({ label, value, onChange, disabled }: {
  label: string; value: DateFields; onChange: (fields: DateFields) => void; disabled: boolean;
}) {
  const { styles, colors, language, direction, t } = useVehicleUI();
  const example = persianFields(localToday());
  return <View style={{ gap: spacing.sm }}>
    <Text style={styles.label}>{label} · {t("vehicleSolarDate")}</Text>
    <View style={{ flexDirection: "row", direction, gap: spacing.sm }}>
      {dateFields.map(field => <View key={field.key} style={{ flex: 1, minWidth: 0, gap: spacing.xs }}>
        <Text style={[styles.label, { textAlign: "center" }]}>{t(field.label)}</Text>
        <View style={styles.inputWrapper}>
          <TextInput accessibilityLabel={`${label}، ${t(field.label)}`} value={language === "fa" ? value[field.key].replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]) : value[field.key]} editable={!disabled}
            onChangeText={text => onChange({ ...value, [field.key]: text })} maxLength={field.max} keyboardType="number-pad"
            placeholder={language === "fa" ? example[field.key].replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]) : example[field.key]}
            placeholderTextColor={colors.textMuted} style={[styles.input, { textAlign: "center", writingDirection: "ltr" }]} />
        </View>
      </View>)}
    </View>
    <Action disabled={disabled} onPress={() => onChange(persianFields(localToday()))}>{t("vehicleToday")}</Action>
  </View>;
}
export function DeleteAction({ message, disabled, onDelete }: {
  message: string; disabled: boolean; onDelete: () => Promise<boolean>;
}) {
  const { styles, t } = useVehicleUI();
  const [confirm, setConfirm] = useState(false);
  if (!confirm) return <Action danger disabled={disabled} onPress={() => setConfirm(true)}>{t("vehicleDelete")}</Action>;
  return <View style={styles.formCard}>
    <Text style={styles.errorText}>{message}</Text>
    <Action danger disabled={disabled} onPress={() => { void onDelete().then(saved => { if (saved) setConfirm(false); }); }}>{t("vehicleDelete")}</Action>
    <Action disabled={disabled} onPress={() => setConfirm(false)}>{t("vehicleCancel")}</Action>
  </View>;
}
export const categoryKeys = { fuel: "vehicleFuel", maintenance: "vehicleMaintenance", insurance: "vehicleInsurance", other: "vehicleOther" } as const;
export function formatDate(date: string, language: "fa" | "en") {
  return new Intl.DateTimeFormat(language === "fa" ? "fa-IR" : "en-US", {
    calendar: "persian", timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(`${date}T00:00:00Z`));
}

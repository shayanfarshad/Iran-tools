import { useState } from "react";
import { Text, View } from "react-native";
import CalculationResult from "@/components/tools/calculation-result";
import { formatMoney, formatNumber } from "../tools/utils/number-format";
import { persianDateUtc } from "../tools/calculators/date-calculator";
import { Action, categoryKeys, useVehicleUI } from "./controls";
import { expenseCategories, persianFields, summarizeMonth, type Vehicle } from "./model";

export default function MonthlyReport({ vehicle, today }: { vehicle: Vehicle; today: string }) {
  const { t, styles, language } = useVehicleUI();
  const current = persianFields(today);
  const currentIndex = Number(current.year) * 12 + Number(current.month) - 1;
  const [selected, setSelected] = useState(currentIndex);
  const firstDate = vehicle.expenses.reduce((first, item) => item.date < first ? item.date : first, today);
  const first = persianFields(firstDate);
  const firstIndex = Number(first.year) * 12 + Number(first.month) - 1;
  const index = Math.max(firstIndex, Math.min(currentIndex, selected));
  const year = Math.floor(index / 12), month = index % 12 + 1;
  const summary = summarizeMonth(vehicle, year, month);
  const unit = t(vehicle.currency === "toman" ? "loanToman" : "loanRial");
  const label = new Intl.DateTimeFormat(language === "fa" ? "fa-IR" : "en-US", {
    calendar: "persian", timeZone: "UTC", month: "long", year: "numeric",
  }).format(new Date(persianDateUtc(year, month, 1)));
  if (!vehicle.expenses.length) return <Text style={styles.hint}>{t("vehicleNoReport")}</Text>;
  return <>
    <Text style={styles.resultTitle}>{label}</Text>
    <View style={styles.currencyContainer}>
      <View style={{ flex: 1 }}><Action disabled={index <= firstIndex} onPress={() => setSelected(index - 1)}>{t("vehiclePreviousMonth")}</Action></View>
      <View style={{ flex: 1 }}><Action disabled={index >= currentIndex} onPress={() => setSelected(index + 1)}>{t("vehicleNextMonth")}</Action></View>
    </View>
    <CalculationResult summaries={[{ label: t("vehicleMonthTotal"), value: formatMoney(summary.total, language, unit) }]}
      rows={[
        ...expenseCategories.map(category => ({ label: t(categoryKeys[category]), value: formatMoney(summary.categories[category], language, unit) })),
        { label: t("vehicleExpenseCount"), value: formatNumber(summary.count, language, 0) },
      ]} />
    <Text style={styles.hint}>{t("vehicleReportHint")}</Text>
  </>;
}

import { useEffect, useState } from "react";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import NumericInput from "@/components/ui/numeric-input";
import { useLanguage } from "@/lib/providers/language-provider";
import { getColors, useTheme } from "@/theme";
import { createLoanStyles } from "../styles/loan.styles";
import { exchangeCurrencies, exchangeSource, fetchExchangeRate, type ExchangeCurrency, type ExchangeRate } from "../services/exchange-rates";
import { parseNumber } from "../utils/number-parser";
import { formatNumber } from "../utils/number-format";

export default function LiveExchange() {
  const { t, language } = useLanguage();
  const { colorScheme } = useTheme();
  const colors = getColors(colorScheme);
  const styles = createLoanStyles(language, colors);
  const [currency, setCurrency] = useState<ExchangeCurrency>("usd");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [revision, setRevision] = useState(0);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(clock);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    fetchExchangeRate(currency, controller.signal).then(value => {
      if (active) { setRate(value); setStatus("ready"); setNow(Date.now()); }
    }).catch(() => { if (active) setStatus("error"); }).finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [currency, revision]);
  const current = rate?.id === currency ? rate : null;
  const stale = current && (current.stale || now - current.updatedAt > 3600000 || current.updatedAt > now + 300000);
  const parsed = parseNumber(amount);
  const result = parsed !== null && parsed >= 0 && current ? parsed * current.toman : null;
  return <View style={styles.formCard}>
    <Text style={styles.resultTitle}>{t("liveExchangeTitle")}</Text>
    <Text style={styles.hint}>{t("liveExchangeHint")}</Text>
    <View style={styles.currencyContainer}>
      {exchangeCurrencies.map(id => <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: currency === id }} style={[styles.currencyButton, currency === id && styles.activeCurrencyButton]} onPress={() => { if (id !== currency) { setCurrency(id); setStatus("loading"); } }}><Text style={[styles.currencyText, currency === id && styles.activeCurrencyText]}>{id.toUpperCase()}</Text></Pressable>)}
    </View>
    <NumericInput value={amount} onChangeText={setAmount} language={language} accessibilityLabel={`${t("valueLabel")} ${currency.toUpperCase()}`} suffix={currency.toUpperCase()} placeholder="0" placeholderTextColor={colors.textMuted} containerStyle={styles.inputWrapper} inputStyle={styles.input} suffixStyle={styles.inputSuffix} />
    {status === "loading" && <Text style={styles.hint}>{t("ratesLoading")}</Text>}
    {status === "error" && <Text accessibilityRole="alert" style={styles.errorText}>{t("ratesError")}</Text>}
    {stale && <Text style={styles.errorText}>{t("ratesStale")}</Text>}
    {status === "ready" && current && !stale && <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>1 {currency.toUpperCase()} = {formatNumber(current.toman, language)} {t("loanToman")}</Text>
      {result !== null && Number.isFinite(result) && <Text style={styles.summaryValue}>{formatNumber(result, language)} {t("loanToman")}</Text>}
    </View>}
    {amount !== "" && (parsed === null || parsed < 0 || (result !== null && !Number.isFinite(result))) && <Text style={styles.errorText}>{t("currencyInvalidAmount")}</Text>}
    {current && <Text style={styles.hint}>{t("ratesUpdated")}: {new Date(current.updatedAt).toLocaleString(language === "fa" ? "fa-IR" : "en-US")}</Text>}
    <Pressable accessibilityRole="button" disabled={status === "loading"} style={styles.clearButton} onPress={() => { setStatus("loading"); setRevision(value => value + 1); }}><Text style={styles.clearButtonText}>{t("ratesRefresh")}</Text></Pressable>
    <Link href={exchangeSource} style={styles.hint}>{t("ratesSource")}: NerkhAra</Link>
  </View>;
}

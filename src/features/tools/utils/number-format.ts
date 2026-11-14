import type { Language } from "@/lib/i18n/translations";

function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

/**
 * Formats a number with comma-separated thousands.
 * Uses Persian digits for fa and Latin digits for en.
 */
export function formatNumber(
  value: number,
  language: Language,
  maximumFractionDigits = 2,
): string {
  if (!Number.isFinite(value)) return "";

  const formatted = new Intl.NumberFormat("en-US", {
    useGrouping: true,
    maximumFractionDigits,
  }).format(value);

  return language === "fa" ? toPersianDigits(formatted) : formatted;
}

/**
 * Formats a monetary amount with its currency label.
 */
export function formatMoney(
  value: number,
  language: Language,
  currencyLabel: string,
): string {
  return `${formatNumber(value, language, 0)} ${currencyLabel}`;
}

/**
 * Formats a percentage with the correct localized symbol.
 */
export function formatPercent(
  value: number,
  language: Language,
  maximumFractionDigits = 2,
): string {
  const formatted = formatNumber(value, language, maximumFractionDigits);

  return language === "fa" ? `${formatted}٪` : `${formatted}%`;
}

/**
 * Formats a numeric TextInput value while the user types.
 * Keeps the stored value numeric and adds thousands separators.
 * Currency and percentage labels must be displayed separately.
 */
/**
 * Normalizes formatted input into a raw numeric string.
 * Supports Persian, Arabic and Latin digits.
 */
export function normalizeNumericInput(value: string): string {
  const normalized = normalizeDigits(value)
    .replace(/[٬،,]/g, "")
    .replace(/٫/g, ".")
    .replace(/\s/g, "")
    .replace(/[^\d.]/g, "");

  const decimalIndex = normalized.indexOf(".");

  if (decimalIndex === -1) {
    return normalized;
  }

  return (
    normalized.slice(0, decimalIndex + 1) +
    normalized.slice(decimalIndex + 1).replace(/\./g, "")
  );
}

export function formatNumericInput(value: string, language: Language): string {
  const normalized = normalizeNumericInput(value);
  const decimalIndex = normalized.indexOf(".");
  const hasDecimal = decimalIndex !== -1;

  const integerPart = hasDecimal
    ? normalized.slice(0, decimalIndex)
    : normalized;

  const decimalPart = hasDecimal ? normalized.slice(decimalIndex + 1) : "";

  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const formatted = hasDecimal
    ? `${groupedInteger || "0"}.${decimalPart}`
    : groupedInteger;

  return language === "fa" ? toPersianDigits(formatted) : formatted;
}

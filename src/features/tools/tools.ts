import type { TranslationKey } from "@/lib/i18n/translations";
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
export type ToolId =
  | "percentage"
  | "discount"
  | "profit-loss"
  | "loan"
  | "split-bill"
  | "currency"
  | "date-calculator"
  | "purchase-comparison"
  | "final-price"
  | "electricity";

export type ToolAccess = "free" | "premium";

export type ToolDefinition = {
  id: ToolId;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  route: Href | null;
  access: ToolAccess;
  icon: keyof typeof Ionicons.glyphMap;
};

export const tools: readonly ToolDefinition[] = [
  {
    id: "percentage",
    titleKey: "percentage",
    descriptionKey: "percentageDescription",
    route: "/tools/percentage",
    access: "free",
    icon: "pie-chart-outline",
  },
  {
    id: "discount",
    titleKey: "discount",
    descriptionKey: "discountDescription",
    route: null,
    access: "premium",
    icon: "pricetag-outline",
  },
  {
    id: "profit-loss",
    titleKey: "profitLoss",
    descriptionKey: "profitLossDescription",
    route: null,
    access: "premium",
    icon: "trending-up-outline",
  },
  {
    id: "loan",
    titleKey: "loan",
    descriptionKey: "loanDescription",
    route: null,
    access: "premium",
    icon: "wallet-outline",
  },
  {
    id: "split-bill",
    titleKey: "splitBill",
    descriptionKey: "splitBillDescription",
    route: null,
    access: "premium",
    icon: "people-outline",
  },
  {
    id: "currency",
    titleKey: "currency",
    descriptionKey: "currencyDescription",
    route: null,
    access: "premium",
    icon: "cash-outline",
  },
  {
    id: "date-calculator",
    titleKey: "dateCalculator",
    descriptionKey: "dateCalculatorDescription",
    route: null,
    access: "premium",
    icon: "calendar-outline",
  },
  {
    id: "purchase-comparison",
    titleKey: "purchaseComparison",
    descriptionKey: "purchaseComparisonDescription",
    route: null,
    access: "premium",
    icon: "git-compare-outline",
  },
  {
    id: "final-price",
    titleKey: "finalPrice",
    descriptionKey: "finalPriceDescription",
    route: null,
    access: "premium",
    icon: "calculator-outline",
  },
  {
    id: "electricity",
    titleKey: "electricity",
    descriptionKey: "electricityDescription",
    route: null,
    access: "premium",
    icon: "flash-outline",
  },
];

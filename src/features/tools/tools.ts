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
  | "electricity"
  | "installment-book"
  | "trip-split"
  | "vehicle-book";

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
    id: "vehicle-book",
    titleKey: "vehicleBook",
    descriptionKey: "vehicleBookDescription",
    route: "/tools/vehicle-book",
    access: "premium",
    icon: "car-outline",
  },
  {
    id: "trip-split",
    titleKey: "tripSplit",
    descriptionKey: "tripSplitDescription",
    route: "/tools/trip-split",
    access: "premium",
    icon: "airplane-outline",
  },
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
    route: "/tools/discount",
    access: "free",
    icon: "pricetag-outline",
  },
  {
    id: "profit-loss",
    titleKey: "profitLoss",
    descriptionKey: "profitLossDescription",
    route: "/tools/profit-loss",
    access: "free",
    icon: "trending-up-outline",
  },
  {
    id: "loan",
    titleKey: "loan",
    descriptionKey: "loanDescription",
    route: "/tools/loan",
    access: "free",
    icon: "wallet-outline",
  },
  {
    id: "split-bill",
    titleKey: "splitBill",
    descriptionKey: "splitBillDescription",
    route: "/tools/split-bill",
    access: "free",
    icon: "people-outline",
  },
  {
    id: "currency",
    titleKey: "currency",
    descriptionKey: "currencyDescription",
    route: "/tools/currency",
    access: "free",
    icon: "cash-outline",
  },
  {
    id: "date-calculator",
    titleKey: "dateCalculator",
    descriptionKey: "dateCalculatorDescription",
    route: "/tools/date-calculator",
    access: "free",
    icon: "calendar-outline",
  },
  {
    id: "purchase-comparison",
    titleKey: "purchaseComparison",
    descriptionKey: "purchaseComparisonDescription",
    route: "/tools/purchase-comparison",
    access: "free",
    icon: "git-compare-outline",
  },
  {
    id: "final-price",
    titleKey: "finalPrice",
    descriptionKey: "finalPriceDescription",
    route: "/tools/final-price",
    access: "free",
    icon: "calculator-outline",
  },
  {
    id: "electricity",
    titleKey: "electricity",
    descriptionKey: "electricityDescription",
    route: "/tools/electricity",
    access: "free",
    icon: "flash-outline",
  },
  {
    id: "installment-book",
    titleKey: "installmentBook",
    descriptionKey: "installmentBookDescription",
    route: "/tools/installment-book",
    access: "premium",
    icon: "receipt-outline",
  },
];

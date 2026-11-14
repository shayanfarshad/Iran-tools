import SimpleCalculator from "@/features/tools/components/simple-calculator";
import { comparePurchase } from "@/features/tools/calculators/remaining";
export default function PurchaseComparisonScreen() {
  return <SimpleCalculator title="purchaseComparison" hint="comparisonHint" fields={["cashPrice", "deposit", "installmentAmount", "installmentCount"]} results={["installmentTotal", "purchaseDifference", "purchaseDifferencePercent"]} calculate={comparePurchase} />;
}

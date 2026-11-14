import { comparePurchase } from "@/features/tools/calculators/remaining";
import SimpleCalculator from "@/features/tools/components/simple-calculator";
export default function PurchaseComparisonScreen() {
  return (
    <SimpleCalculator
      title="purchaseComparison"
      hint="comparisonHint"
      fields={["cashPrice", "deposit", "installmentAmount", "installmentCount"]}
      results={[
        "installmentBuyTotal",
        "purchaseDifference",
        "purchaseDifferencePercent",
      ]}
      calculate={comparePurchase}
    />
  );
}

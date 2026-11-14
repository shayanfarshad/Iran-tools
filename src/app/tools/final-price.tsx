import SimpleCalculator from "@/features/tools/components/simple-calculator";
import { finalPrice } from "@/features/tools/calculators/remaining";
export default function FinalPriceScreen() {
  return <SimpleCalculator title="finalPrice" hint="finalPriceHint" fields={["priceToman", "discountRateLabel", "taxPercent", "shippingToman"]} results={["finalPriceToman", "discountTomanAmount", "taxTomanAmount"]} calculate={finalPrice} />;
}

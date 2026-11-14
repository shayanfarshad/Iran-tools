import SimpleCalculator from "@/features/tools/components/simple-calculator";
import { electricityConsumption } from "@/features/tools/calculators/remaining";
export default function ElectricityScreen() {
  return <SimpleCalculator title="electricity" hint="electricityHint" errorKey="electricityInvalid" fields={["powerWatts", "hoursPerDay", "consumptionDays", "tariffPerKwh"]} results={["energyKwh", "estimatedCost"]} calculate={electricityConsumption} />;
}

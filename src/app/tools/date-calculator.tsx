import SimpleCalculator from "@/features/tools/components/simple-calculator";
import { calculateDateDifference } from "@/features/tools/calculators/date-calculator";
export default function DateCalculatorScreen() {
  return <SimpleCalculator title="dateCalculator" hint="dateHint" errorKey="dateInvalid" fields={["startYear", "startMonth", "startDay", "endYear", "endMonth", "endDay"]} results={["elapsedDays", "completedYears"]} calculate={calculateDateDifference} />;
}

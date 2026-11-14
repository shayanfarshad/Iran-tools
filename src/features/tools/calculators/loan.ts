export type LoanPeriodUnit = "month" | "year";

export type LoanInput = {
  principal: number;
  annualInterestRate: number;
  duration: number;
  durationUnit: LoanPeriodUnit;
};

export type LoanResult = {
  principal: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  numberOfPayments: number;
  monthlyInterestRate: number;
};

export function calculateLoan({
  principal,
  annualInterestRate,
  duration,
  durationUnit,
}: LoanInput): LoanResult {
  if (!Number.isFinite(principal)) {
    throw new Error("Loan amount must be a valid number.");
  }

  if (!Number.isFinite(annualInterestRate)) {
    throw new Error("Interest rate must be a valid number.");
  }

  if (!Number.isFinite(duration)) {
    throw new Error("Duration must be a valid number.");
  }

  if (principal <= 0) {
    throw new Error("Loan amount must be greater than zero.");
  }

  if (annualInterestRate < 0) {
    throw new Error("Interest rate cannot be negative.");
  }

  if (duration <= 0) {
    throw new Error("Duration must be greater than zero.");
  }

  const numberOfPayments =
    durationUnit === "year" ? Math.round(duration * 12) : Math.round(duration);

  if (numberOfPayments <= 0) {
    throw new Error("Number of payments must be greater than zero.");
  }

  const monthlyInterestRate = annualInterestRate / 100 / 12;

  let monthlyPayment: number;

  if (monthlyInterestRate === 0) {
    monthlyPayment = principal / numberOfPayments;
  } else {
    const factor = Math.pow(1 + monthlyInterestRate, numberOfPayments);

    monthlyPayment =
      principal * ((monthlyInterestRate * factor) / (factor - 1));
  }

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - principal;

  return {
    principal,
    monthlyPayment,
    totalPayment,
    totalInterest,
    numberOfPayments,
    monthlyInterestRate,
  };
}

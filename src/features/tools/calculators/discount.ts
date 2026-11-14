export type DiscountResult = {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  discountRate: number;
};

export function calculateDiscount(
  originalPrice: number,
  discountRate: number,
): DiscountResult {
  if (originalPrice < 0) {
    throw new Error("Original price cannot be negative.");
  }

  if (discountRate < 0 || discountRate > 100) {
    throw new Error("Discount rate must be between 0 and 100.");
  }

  const discountAmount = (originalPrice * discountRate) / 100;

  return {
    originalPrice,
    discountAmount,
    finalPrice: originalPrice - discountAmount,
    discountRate,
  };
}

export function calculateDiscountRate(
  originalPrice: number,
  finalPrice: number,
): number {
  if (originalPrice <= 0) {
    throw new Error("Original price must be greater than zero.");
  }

  if (finalPrice < 0 || finalPrice > originalPrice) {
    throw new Error("Final price must be between zero and original price.");
  }

  return ((originalPrice - finalPrice) / originalPrice) * 100;
}

export function calculateOriginalPrice(
  finalPrice: number,
  discountRate: number,
): number {
  if (finalPrice < 0) {
    throw new Error("Final price cannot be negative.");
  }

  if (discountRate < 0 || discountRate >= 100) {
    throw new Error("Discount rate must be between 0 and 100.");
  }

  return finalPrice / (1 - discountRate / 100);
}


export type ProfitLossInput = {
  purchasePrice: number;
  sellingPrice: number;
  extraCost: number;
  quantity: number;
};

export type ProfitLossResult = {
  totalPurchaseCost: number;
  totalExtraCost: number;
  totalCost: number;
  totalRevenue: number;
  netProfit: number;
  profitRate: number | null;
  profitMargin: number | null;
};

export function calculateProfitLoss({
  purchasePrice,
  sellingPrice,
  extraCost,
  quantity,
}: ProfitLossInput): ProfitLossResult {
  if (
    !Number.isFinite(purchasePrice) ||
    !Number.isFinite(sellingPrice) ||
    !Number.isFinite(extraCost) ||
    !Number.isFinite(quantity)
  ) {
    throw new Error("All values must be valid numbers.");
  }

  if (purchasePrice < 0 || sellingPrice < 0 || extraCost < 0) {
    throw new Error("Prices and costs cannot be negative.");
  }

  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero.");
  }

  const totalPurchaseCost = purchasePrice * quantity;
  const totalExtraCost = extraCost * quantity;
  const totalCost = totalPurchaseCost + totalExtraCost;
  const totalRevenue = sellingPrice * quantity;
  const netProfit = totalRevenue - totalCost;

  return {
    totalPurchaseCost,
    totalExtraCost,
    totalCost,
    totalRevenue,
    netProfit,
    profitRate: totalCost > 0 ? (netProfit / totalCost) * 100 : null,
    profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : null,
  };
}

export const exchangeCurrencies = ["usd", "eur", "aed", "try"] as const;
export type ExchangeCurrency = typeof exchangeCurrencies[number];
export type ExchangeRate = { id: ExchangeCurrency; toman: number; updatedAt: number; stale: boolean };
export const exchangeSource = "https://nerkhara.com/en/api/";

export function parseExchangeRate(data: unknown, id: ExchangeCurrency): ExchangeRate {
  const item = (data as { item?: Record<string, unknown> } | null)?.item;
  if (!item || item.id !== id || item.unit !== "IRT" || typeof item.price !== "number" || !Number.isFinite(item.price) || item.price <= 0 || typeof item.updated_utc !== "string" || typeof item.stale !== "boolean") throw new Error("invalid-rate");
  const updatedAt = Date.parse(/(?:Z|[+-]\d\d:\d\d)$/.test(item.updated_utc) ? item.updated_utc : `${item.updated_utc}Z`);
  if (!Number.isFinite(updatedAt)) throw new Error("invalid-date");
  return { id, toman: item.price, updatedAt, stale: item.stale };
}
export async function fetchExchangeRate(id: ExchangeCurrency, signal: AbortSignal): Promise<ExchangeRate> {
  const response = await fetch(`https://nerkhara.com/api/v1/latest/${id}.json`, { signal });
  if (!response.ok) throw new Error("rate-unavailable");
  return parseExchangeRate(await response.json(), id);
}

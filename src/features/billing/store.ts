import Constants from "expo-constants";
import { Platform } from "react-native";

export type BillingStore = "bazaar" | "myket";
export type BillingResult = { owned: boolean; price: string | null };
type Config = { store: BillingStore; publicKey: string; productId: string };
export function getBillingConfig(): Config | null {
  const config = Constants.expoConfig?.extra?.billing;
  if (Platform.OS !== "android" || Constants.appOwnership === "expo" || !config || !["bazaar", "myket"].includes(config.store) || typeof config.publicKey !== "string" || !config.publicKey.trim() || typeof config.productId !== "string" || !config.productId.trim()) return null;
  return config as Config;
}
function validPurchase(product: { productId?: string; sku?: string; packageName?: string; purchaseState?: number; purchaseToken?: string; token?: string }, config: Config) {
  return (product.productId ?? product.sku) === config.productId && product.packageName === Constants.expoConfig?.android?.package && product.purchaseState === 0 && Boolean(product.purchaseToken ?? product.token);
}
// Operations are serialized: the native billing SDKs allow one purchase/inventory flow at a time.
let pending = false;
export async function runBilling(purchase: boolean): Promise<BillingResult> {
  const config = getBillingConfig();
  if (!config) throw new Error("billing-unconfigured");
  if (pending) throw new Error("billing-busy");
  pending = true;
  try {
    if (config.store === "bazaar") {
      const sdk = (await import("@cafebazaar/react-native-poolakey")).default;
      try {
        // A nonempty key enables the SDK's local RSA signature verification.
        await sdk.connect(config.publicKey);
        const purchases = await sdk.getSubscribedProducts();
        let owned = purchases.some(product => validPurchase(product, config));
        if (purchase && !owned) {
          const receipt = await sdk.subscribeProduct(config.productId);
          if (!receipt || !validPurchase(receipt, config)) throw new Error("billing-invalid-receipt");
          // The SDK verifies the signature. Subscriptions must never be consumed.
          // Use the returned receipt so a second inventory request cannot lose a successful purchase.
          owned = true;
        }
        let price: string | null = null;
        try { price = (await sdk.getSubscriptionSkuDetails([config.productId])).find(product => product.sku === config.productId)?.price ?? null; } catch { /* Ownership does not depend on price availability. */ }
        return { owned, price };
      } finally { await sdk.disconnect().catch(() => undefined); }
    }
    const sdk = (await import("iab-myket-reactnative/src/index")).default;
    try {
      await sdk.connect(config.publicKey);
      if (purchase) await sdk.purchaseProduct(config.productId, "");
      const inventory = await sdk.queryPurchaseProduct(false, [config.productId]);
      const owned = inventory.allPurchases.some(product => validPurchase(product, config));
      let price: string | null = null;
      try { price = (await sdk.queryPurchaseProduct(true, [config.productId])).allProducts.find(product => product.sku === config.productId)?.price ?? null; } catch { /* Keep verified ownership if price lookup fails. */ }
      return { owned, price };
    } finally { await sdk.disconnect().catch(() => undefined); }
  } finally { pending = false; }
}

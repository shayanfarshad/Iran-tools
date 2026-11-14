import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const store = process.env.IRAN_TOOLS_STORE ?? "none";
  if (!["none", "bazaar", "myket"].includes(store)) throw new Error("Invalid IRAN_TOOLS_STORE");
  const publicKey = (store === "bazaar" ? process.env.BAZAAR_PUBLIC_KEY : process.env.MYKET_PUBLIC_KEY) ?? "";
  return {
    ...config,
    name: config.name ?? "iran-tools",
    slug: config.slug ?? "iran-tools",
    android: { ...config.android, package: "com.shayanfarshad.irantools" },
    extra: { ...config.extra, billing: { store, publicKey, productId: "premium_lifetime" } },
    plugins: [...(config.plugins ?? []), "./plugins/with-market-billing.js", "expo-notifications", "expo-sharing"],
  };
};

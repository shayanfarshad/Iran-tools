import type { ConfigContext, ExpoConfig } from "expo/config";
import billingPublicKeys from "./config/billing-public-keys.json";

export default ({ config }: ConfigContext): ExpoConfig => {
  const store = process.env.IRAN_TOOLS_STORE ?? "none";
  if (!["none", "bazaar", "myket"].includes(store))
    throw new Error("Invalid IRAN_TOOLS_STORE");
  const publicKey =
    (store === "bazaar"
      ? (process.env.BAZAAR_PUBLIC_KEY ?? billingPublicKeys.bazaar)
      : process.env.MYKET_PUBLIC_KEY) ?? "";
  return {
    ...config,
    name: config.name ?? "Iran Tools",
    slug: config.slug ?? "iran-tools",
    android: {
      ...config.android,
      package: "com.shayanfarshad.irantools",
      softwareKeyboardLayoutMode: "resize",
    },
    extra: {
      ...config.extra,
      billing: {
        store,
        publicKey,
        productId: store === "bazaar" ? "IranToolsPremium" : "premium_lifetime",
      },
    },
    plugins: [
      ...(config.plugins ?? []),
      "./plugins/with-market-billing.js",
      "./plugins/with-release-signing.js",
      "expo-notifications",
      "expo-sharing",
    ],
  };
};

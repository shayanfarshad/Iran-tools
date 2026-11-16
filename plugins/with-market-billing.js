const { withAppBuildGradle, withProjectBuildGradle, withSettingsGradle } = require("expo/config-plugins");
module.exports = function withMarketBilling(config) {
  config = withSettingsGradle(config, config => {
    const marker = "// iran-tools-market-autolinking";
    if (!config.modResults.contents.includes(marker)) {
      const anchor = "extensions.configure(com.facebook.react.ReactSettingsExtension)";
      if (!config.modResults.contents.includes(anchor)) throw new Error("Cannot locate React Native autolinking settings");
      // RN's autolinking cache tracks config files, but not environment variables.
      // Invalidate only generated autolinking metadata when switching stores.
      const block = `${marker}
def iranToolsStore = System.getenv("IRAN_TOOLS_STORE") ?: "none"
if (!(iranToolsStore in ["none", "bazaar", "myket"])) {
  throw new GradleException("Invalid IRAN_TOOLS_STORE")
}
def iranToolsStoreFile = new File(rootDir, "build/generated/autolinking/iran-tools-store.txt")
if (!iranToolsStoreFile.exists() || iranToolsStoreFile.text != iranToolsStore) {
  new File(rootDir, "build/generated/autolinking/autolinking.json").delete()
  iranToolsStoreFile.parentFile.mkdirs()
  iranToolsStoreFile.text = iranToolsStore
}

`;
      config.modResults.contents = config.modResults.contents.replace(anchor, block + anchor);
    }
    return config;
  });
  config = withProjectBuildGradle(config, config => {
    if (!config.modResults.contents.includes("https://jitpack.io")) {
      config.modResults.contents += '\nallprojects { repositories { maven { url "https://jitpack.io" }; maven { url "https://maven.myket.ir" } } }\n';
    }
    return config;
  });
  return withAppBuildGradle(config, config => {
    if (config.modResults.language !== "groovy") throw new Error("Market billing plugin requires Groovy app Gradle");
    const marker = "// iran-tools-market-placeholders";
    if (!config.modResults.contents.includes(marker)) {
      if (!/defaultConfig\s*\{/.test(config.modResults.contents)) throw new Error("Cannot locate Android defaultConfig");
      config.modResults.contents = config.modResults.contents.replace(/defaultConfig\s*\{/, match => `${match}
        ${marker}
        manifestPlaceholders += [marketApplicationId: "ir.mservices.market", marketBindAddress: "ir.mservices.market.InAppBillingService.BIND", marketPermission: "ir.mservices.market.BILLING"]`);
    }
    return config;
  });
};

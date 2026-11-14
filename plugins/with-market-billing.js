const { withAppBuildGradle, withProjectBuildGradle } = require("expo/config-plugins");
module.exports = function withMarketBilling(config) {
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

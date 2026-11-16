const { withAppBuildGradle } = require("expo/config-plugins");

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== "groovy") {
      throw new Error("Release signing requires Groovy app Gradle");
    }
    const marker = "// iran-tools-release-signing";
    let source = config.modResults.contents;
    if (source.includes(marker)) return config;
    const release = /(release\s*\{\s*(?:\/\/[^\n]*\n\s*)*)signingConfig signingConfigs\.debug/;
    if (!release.test(source) || !source.includes("signingConfigs {")) {
      throw new Error("Cannot locate the default Android release signing configuration");
    }
    source = source.replace(release, "$1signingConfig signingConfigs.release");
    source = source.replace("signingConfigs {", `signingConfigs {
        ${marker}
        release {
            def credentialsFile = new File(rootDir.parentFile, "credentials.json")
            if (credentialsFile.exists()) {
                def signing = new groovy.json.JsonSlurper().parse(credentialsFile).android?.keystore
                if (!signing || !signing.keystorePath || !signing.keystorePassword || !signing.keyAlias || !signing.keyPassword) {
                    throw new GradleException("Incomplete Android signing fields in credentials.json")
                }
                def keyFile = new File(signing.keystorePath.toString())
                storeFile = keyFile.isAbsolute() ? keyFile : new File(rootDir.parentFile, signing.keystorePath.toString())
                storePassword = signing.keystorePassword
                keyAlias = signing.keyAlias
                keyPassword = signing.keyPassword
            }
            // No debug fallback. Without credentials, AGP rejects release signing.
            // EAS supplies the selected local credentials on its build worker.
        }`);
    source += `
tasks.matching { it.name == "preReleaseBuild" }.configureEach {
    doFirst {
        def signing = android.buildTypes.release.signingConfig
        if (!signing?.storeFile || !signing.storeFile.exists() || !signing.storePassword || !signing.keyAlias || !signing.keyPassword) {
            throw new GradleException("Release signing is missing. Configure credentials.json (see credentials.example.json) or EAS credentials.")
        }
        if (signing.keyAlias == "androiddebugkey" || signing.storeFile.canonicalFile == android.signingConfigs.debug.storeFile.canonicalFile) {
            throw new GradleException("Refusing to sign a release with the debug key.")
        }
    }
}
`;
    config.modResults.contents = source;
    return config;
  });
};

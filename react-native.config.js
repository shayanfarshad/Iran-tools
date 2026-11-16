// The stores ship the same AIDL billing classes, so only one Android bridge
// may be autolinked into a binary. Keep this selector aligned with app.config.ts.
const store = process.env.IRAN_TOOLS_STORE ?? "none";
if (!["none", "bazaar", "myket"].includes(store)) {
  throw new Error("Invalid IRAN_TOOLS_STORE");
}

module.exports = {
  dependencies: {
    "@cafebazaar/react-native-poolakey": {
      platforms: { ios: null, ...(store === "bazaar" ? {} : { android: null }) },
    },
    "iab-myket-reactnative": {
      platforms: { ios: null, ...(store === "myket" ? {} : { android: null }) },
    },
  },
};

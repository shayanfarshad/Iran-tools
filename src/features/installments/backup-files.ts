import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import { decodeBackup, MAX_BACKUP_BYTES } from "./backup";

export async function shareBackup(contents: string) {
  const name = `iran-tools-installments-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }
  const [{ File, Paths }, Sharing] = await Promise.all([
    import("expo-file-system"), import("expo-sharing"),
  ]);
  if (!await Sharing.isAvailableAsync()) throw new Error("sharing-unavailable");
  const file = new File(Paths.cache, name);
  try {
    file.create();
    file.write(contents);
    await Sharing.shareAsync(file.uri, { mimeType: "application/json", UTI: "public.json" });
  } finally {
    if (file.exists) file.delete();
  }
}

export async function pickBackup() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain", "application/octet-stream"],
    copyToCacheDirectory: true, multiple: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (Platform.OS === "web") {
    if (!asset.file || asset.file.size > MAX_BACKUP_BYTES) throw new Error("invalid-backup-size");
    return decodeBackup(await asset.file.text());
  }
  const { File } = await import("expo-file-system");
  const file = new File(asset.uri);
  try {
    if (file.size > MAX_BACKUP_BYTES) throw new Error("backup-too-large");
    return decodeBackup(await file.text());
  } finally {
    // DocumentPicker was asked to provide an app-owned cache copy.
    if (file.exists) file.delete();
  }
}

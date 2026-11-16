import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

// Keep the system splash until the full-screen image has actually rendered.
void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export function StartupSplash({
  ready,
  statusBarStyle,
  children,
}: {
  ready: boolean;
  statusBarStyle: "light" | "dark";
  children: ReactNode;
}) {
  const [imageReady, setImageReady] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!imageReady) return;
    SplashScreen.hide();
    if (!ready || !contentReady) return;

    // Allow the underlying screen to paint before removing the splash.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setVisible(false));
    });
    return () => cancelAnimationFrame(frame);
  }, [imageReady, ready, contentReady]);

  return (
    <View style={styles.root}>
      <StatusBar hidden={visible} style={statusBarStyle} />
      {ready && (
        <View style={styles.content} onLayout={() => setContentReady(true)}>
          {children}
        </View>
      )}
      {visible && (
        <View style={styles.overlay}>
          <Image
            source={require("../../assets/images/splash-full.png")}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="center"
            transition={0}
            allowDownscaling={false}
            onDisplay={() => setImageReady(true)}
            onError={() => setImageReady(true)}
            accessibilityLabel="Iran Tools"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#305976" },
  content: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#305976",
    zIndex: 1,
  },
});

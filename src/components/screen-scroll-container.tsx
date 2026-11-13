import { colors } from "@/theme";
import { ScrollView, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
type ScreenScrollContainerProps = {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};
export default function ScreenScrollContainer({
  children,
  contentContainerStyle,
  style,
}: ScreenScrollContainerProps) {
  const { top } = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: top,
      backgroundColor: colors.background,
    },
  });

  return (
    <ScrollView
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={[styles.container, style]}
    >
      {children}
    </ScrollView>
  );
}

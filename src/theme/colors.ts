const lightColors = {
  background: "#F7F8FA",
  surface: "#FFFFFF",
  primary: "#2563EB",
  primarySoft: "#E8F0FE",
  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  success: "#16A34A",
  danger: "#DC2626",
  warning: "#D97706",
  white: "#FFFFFF",
  black: "#000000",
} as const;

const darkColors = {
  background: "#111827",
  surface: "#1F2937",
  primary: "#60A5FA",
  primarySoft: "#1E3A5F",
  text: "#F9FAFB",
  textSecondary: "#D1D5DB",
  textMuted: "#9CA3AF",
  border: "#374151",
  success: "#4ADE80",
  danger: "#F87171",
  warning: "#FBBF24",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export type ThemeColors = {
  [K in keyof typeof lightColors]: string;
};

export const getColors = (scheme: "light" | "dark"): ThemeColors =>
  scheme === "dark" ? darkColors : lightColors;

export const colors = lightColors;

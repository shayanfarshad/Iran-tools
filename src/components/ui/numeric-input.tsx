import { useState } from "react";
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import {
  formatNumericInput,
  normalizeNumericInput,
} from "@/features/tools/utils/number-format";
import type { Language } from "@/lib/i18n/translations";

type NumericInputProps = Omit<
  TextInputProps,
  "value" | "onChangeText" | "keyboardType"
> & {
  value: string;
  onChangeText: (value: string) => void;
  language: Language;
  suffix?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  suffixStyle?: StyleProp<TextStyle>;
};

function localizeDigits(value: string, language: Language): string {
  if (language !== "fa") return value;

  return value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export default function NumericInput({
  value,
  onChangeText,
  language,
  suffix,
  containerStyle,
  inputStyle,
  suffixStyle,
  onFocus,
  onBlur,
  ...textInputProps
}: NumericInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [draftValue, setDraftValue] = useState(() =>
    normalizeNumericInput(value),
  );

  // While editing, show raw digits without grouping separators.
  const editingValue = localizeDigits(draftValue, language);

  // When blurred, show the formatted number.
  const displayValue = isFocused
    ? editingValue
    : formatNumericInput(value, language);

  const handleFocus: NonNullable<TextInputProps["onFocus"]> = (event) => {
    setDraftValue(normalizeNumericInput(value));
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur: NonNullable<TextInputProps["onBlur"]> = (event) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const handleChangeText = (text: string) => {
    const rawValue = normalizeNumericInput(text);

    setDraftValue(rawValue);
    onChangeText(rawValue);
  };

  return (
    <View style={containerStyle}>
      <TextInput
        {...textInputProps}
        value={displayValue}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={inputStyle}
        keyboardType="decimal-pad"
      />

      {suffix ? <Text style={suffixStyle}>{suffix}</Text> : null}
    </View>
  );
}

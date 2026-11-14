import { useEffect, useRef, useState } from "react";
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

type SelectionChangeHandler = NonNullable<TextInputProps["onSelectionChange"]>;
type Selection = {
  start: number;
  end: number;
};

type NumericInputProps = Omit<
  TextInputProps,
  "value" | "onChangeText" | "keyboardType" | "selection" | "onSelectionChange"
> & {
  value: string;
  onChangeText: (value: string) => void;
  language: Language;
  suffix?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  suffixStyle?: StyleProp<TextStyle>;
};

function countNumericCharacters(value: string): number {
  return (value.match(/[0-9۰-۹.]/g) ?? []).length;
}

function findFormattedPosition(
  value: string,
  numericCharacterCount: number,
): number {
  if (numericCharacterCount <= 0) return 0;

  let count = 0;

  for (let index = 0; index < value.length; index += 1) {
    if (/[0-9۰-۹.]/.test(value[index])) {
      count += 1;

      if (count === numericCharacterCount) {
        return index + 1;
      }
    }
  }

  return value.length;
}

function getNewCaretPosition(
  previousValue: string,
  nextValue: string,
  previousCaret: number,
): number {
  let prefixLength = 0;

  while (
    prefixLength < previousValue.length &&
    prefixLength < nextValue.length &&
    previousValue[prefixLength] === nextValue[prefixLength]
  ) {
    prefixLength += 1;
  }

  let suffixLength = 0;

  while (
    suffixLength < previousValue.length - prefixLength &&
    suffixLength < nextValue.length - prefixLength &&
    previousValue[previousValue.length - 1 - suffixLength] ===
      nextValue[nextValue.length - 1 - suffixLength]
  ) {
    suffixLength += 1;
  }

  const previousChangedEnd = previousValue.length - suffixLength;
  const nextChangedEnd = nextValue.length - suffixLength;

  if (previousCaret <= prefixLength) {
    return previousCaret;
  }

  if (previousCaret >= previousChangedEnd) {
    return Math.max(
      0,
      Math.min(
        nextValue.length,
        previousCaret + nextChangedEnd - previousChangedEnd,
      ),
    );
  }

  return nextChangedEnd;
}

export default function NumericInput({
  value,
  onChangeText,
  language,
  suffix,
  containerStyle,
  inputStyle,
  suffixStyle,
  ...textInputProps
}: NumericInputProps) {
  const displayValue = formatNumericInput(value, language);

  const [selection, setSelection] = useState<Selection>({
    start: displayValue.length,
    end: displayValue.length,
  });

  const selectionRef = useRef(selection);
  const displayValueRef = useRef(displayValue);

  useEffect(() => {
    displayValueRef.current = displayValue;
  }, [displayValue]);

  const handleSelectionChange: SelectionChangeHandler = (event) => {
    const nextSelection = event.nativeEvent.selection;

    selectionRef.current = nextSelection;
    setSelection(nextSelection);
  };

  const handleChangeText = (text: string) => {
    const previousValue = displayValueRef.current;
    const previousCaret = selectionRef.current.start;

    const rawValue = normalizeNumericInput(text);
    const formattedValue = formatNumericInput(rawValue, language);

    const newCaret = getNewCaretPosition(previousValue, text, previousCaret);

    const numericCharacterCount = countNumericCharacters(
      text.slice(0, newCaret),
    );

    const formattedCaret = findFormattedPosition(
      formattedValue,
      numericCharacterCount,
    );

    const nextSelection = {
      start: formattedCaret,
      end: formattedCaret,
    };

    selectionRef.current = nextSelection;
    setSelection(nextSelection);

    displayValueRef.current = formattedValue;
    onChangeText(rawValue);
  };

  return (
    <View style={containerStyle}>
      <TextInput
        {...textInputProps}
        value={displayValue}
        onChangeText={handleChangeText}
        onSelectionChange={handleSelectionChange}
        selection={selection}
        style={inputStyle}
        keyboardType="decimal-pad"
      />

      {suffix ? <Text style={suffixStyle}>{suffix}</Text> : null}
    </View>
  );
}

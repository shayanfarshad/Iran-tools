import { useEffect, useRef, useState } from "react";
import type { ScrollViewProps } from "react-native";
import {
  KeyboardAwareScrollView,
  useFocusedInputHandler,
  useReanimatedFocusedInput,
  type KeyboardAwareScrollViewRef,
  type FocusedInputSelectionChangedEvent,
} from "react-native-keyboard-controller";
import { useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { KEYBOARD_INPUT_GAP, keyboardInputOffset } from "./spacing";

export default function KeyboardScrollView({ onContentSizeChange, ...props }: ScrollViewProps) {
  const scroll = useRef<KeyboardAwareScrollViewRef>(null);
  const frame = useRef<number | null>(null);
  const { input } = useReanimatedFocusedInput();
  const selection = useSharedValue<FocusedInputSelectionChangedEvent | null>(null);
  const [bottomOffset, setBottomOffset] = useState(KEYBOARD_INPUT_GAP);

  useFocusedInputHandler({
    onSelectionChange: event => {
      "worklet";
      selection.value = event;
    },
  }, []);

  useAnimatedReaction(
    () => {
      const current = input.value;
      const caret = selection.value;
      return keyboardInputOffset(
        current?.layout.height,
        current && caret?.target === current.target ? caret.selection.end.y : undefined,
      );
    },
    (offset, previous) => {
      if (offset !== previous) scheduleOnRN(setBottomOffset, offset);
    },
  );

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  return (
    <KeyboardAwareScrollView
      {...props}
      ref={scroll}
      bottomOffset={bottomOffset}
      extraKeyboardSpace={bottomOffset}
      mode="insets"
      automaticallyAdjustKeyboardInsets={false}
      onContentSizeChange={(width, height) => {
        onContentSizeChange?.(width, height);
        // Results, validation messages and dynamic trip members can move the
        // focused input even when the keyboard is already open.
        if (frame.current !== null) cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
          frame.current = null;
          scroll.current?.assureFocusedInputVisible();
        });
      }}
    />
  );
}

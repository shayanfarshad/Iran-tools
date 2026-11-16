// React Native layout units (dp/points), independent of screen pixel density.
export const KEYBOARD_INPUT_GAP = 24;

/** KeyboardAwareScrollView measures the caret, not the bottom of the input. */
export function keyboardInputOffset(inputHeight?: number, caretBottom?: number) {
  "worklet";
  if (
    inputHeight === undefined || caretBottom === undefined ||
    !Number.isFinite(inputHeight) || !Number.isFinite(caretBottom) || inputHeight <= 0
  ) {
    return KEYBOARD_INPUT_GAP;
  }
  const caret = Math.max(0, Math.min(caretBottom, inputHeight));
  return KEYBOARD_INPUT_GAP + inputHeight - caret;
}

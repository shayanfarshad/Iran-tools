const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync('src/components/keyboard/spacing.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const mod = { exports: {} };
new Function('module', 'exports', code)(mod, mod.exports);
const { keyboardInputOffset } = mod.exports;

// Check the visible input edge, not just the caret. A plain bottomOffset=24
// leaves less space when input padding/font metrics put the caret above it.
for (const [inputHeight, caretBottom] of [[48, 30], [52, 36], [80, 56], [48, 48], [100, 20]]) {
  const inputTop = 600;
  const keyboardTop = 500;
  const scrollDistance = inputTop + caretBottom + keyboardInputOffset(inputHeight, caretBottom) - keyboardTop;
  const visibleInputBottom = inputTop + inputHeight - scrollDistance;
  assert.equal(keyboardTop - visibleInputBottom, 24);
}
// Initial focus has no caret measurement yet: the library uses the full input.
assert.equal(keyboardInputOffset(48, undefined), 24);
assert.equal(keyboardInputOffset(undefined, 30), 24);
assert.equal(keyboardInputOffset(48, 1000), 24);
assert.equal(keyboardInputOffset(48, -5), 72);
assert.equal(keyboardInputOffset(NaN, 20), 24);
assert.equal(keyboardInputOffset(48, Infinity), 24);
console.log('Keyboard spacing: 24-point input-edge clearance across font sizes and missing caret measurements passed.');

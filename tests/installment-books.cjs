const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => {
    if (name in mocks) return mocks[name];
    return load(path.resolve(path.dirname(file), name + '.ts'), mocks);
  });
  return mod.exports;
}
const calculations = load('src/features/tools/calculators/installment-book.ts');
const first = { id: 'a-1', number: 1, amount: 100, dueDate: '2026-01-01', payment: { paidAt: '2026-01-01T12:00:00Z' } };
const plan = { id: 'a', title: 'Original', currency: 'toman', createdAt: '2025-12-01T00:00:00Z', installments: [first] };
const edit = calculations.editInstallmentPlan(plan, { ...plan, title: 'Renamed' });
assert.equal(edit.title, 'Renamed');
assert.deepEqual(edit.installments[0].payment, first.payment);
assert.equal(edit.createdAt, plan.createdAt);
assert.equal(plan.title, 'Original');
for (const patch of [
  { currency: 'rial' },
  { installments: [] },
  { installments: [{ ...first, amount: 200 }] },
  { installments: [{ ...first, dueDate: '2026-02-01' }] },
]) assert.throws(() => calculations.editInstallmentPlan(plan, { ...plan, ...patch }));
const unpaid = { ...plan, installments: [{ ...first, payment: null }] };
assert.equal(calculations.editInstallmentPlan(unpaid, { ...unpaid, installments: [{ ...first, amount: 200, payment: null }] }).installments[0].amount, 200);

let stored = JSON.stringify({ version: 1, plans: [plan] });
let failWrite = false;
const storage = {
  getItem: async () => stored,
  setItem: async (_key, value) => { if (failWrite) throw new Error('disk full'); stored = value; },
};
let cursor = 0;
const slots = [];
let effect;
const react = {
  useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], value => { slots[i] = value; }]; },
  useRef(initial) { const i = cursor++; if (!(i in slots)) slots[i] = { current: initial }; return slots[i]; },
  useEffect(callback) { if (!effect) effect = callback; },
};
const { useInstallmentBooks } = load('src/features/tools/hooks/use-installment-books.ts', {
  react,
  '@react-native-async-storage/async-storage': { __esModule: true, default: storage },
});
function render() { cursor = 0; return useInstallmentBooks(); }
(async () => {
  render(); effect();
  await new Promise(resolve => setImmediate(resolve));
  let hook = render();
  assert.equal(hook.isLoaded, true);
  assert.equal(await hook.updatePlan('a', { ...plan, title: 'Saved rename' }), true);
  assert.equal(JSON.parse(stored).plans[0].title, 'Saved rename');
  assert.deepEqual(JSON.parse(stored).plans[0].installments[0].payment, first.payment);
  hook = render();
  failWrite = true;
  assert.equal(await hook.deletePlan('a'), false);
  assert.equal(render().plans.length, 1);
  assert.equal(JSON.parse(stored).plans.length, 1);
  failWrite = false;
  assert.equal(await render().deletePlan('a'), true);
  assert.deepEqual(JSON.parse(stored).plans, []);
  assert.deepEqual(render().plans, []);
  console.log('Installment edit, payment preservation, deletion and failed-write checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });

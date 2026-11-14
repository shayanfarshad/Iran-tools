const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', source)(module, module.exports);
  return module.exports;
}
const calc = load('src/features/tools/calculators/remaining.ts');
assert.deepEqual(calc.splitBill(120, 3), [40]);
assert.throws(() => calc.splitBill(100, 0));
assert.throws(() => calc.splitBill(100, 2.5));
assert.deepEqual(calc.comparePurchase(100, 20, 10, 10), [120, 20, 20]);
assert.deepEqual(calc.finalPrice(100, 10, 10, 5), [104, 10, 9]);
assert.throws(() => calc.finalPrice(100, 101, 0, 0));
assert.deepEqual(calc.electricityConsumption(1000, 2, 30, 100), [60, 6000]);
assert.throws(() => calc.electricityConsumption(1000, 25, 30, 100));
assert.throws(() => calc.comparePurchase(1, 0, Number.MAX_VALUE, 2));
const dates = load('src/features/tools/calculators/date-calculator.ts');
assert.equal(new Date(dates.persianDateUtc(1403, 1, 1)).toISOString(), '2024-03-20T00:00:00.000Z');
assert.deepEqual(dates.calculateDateDifference(1403, 1, 1, 1404, 1, 1), [366, 1]);
assert.deepEqual(dates.calculateDateDifference(1403, 1, 1, 1403, 1, 1), [0, 0]);
assert.throws(() => dates.persianDateUtc(1402, 12, 30));
assert.throws(() => dates.persianDateUtc(1403, 7, 31));
assert.throws(() => dates.calculateDateDifference(1404, 1, 1, 1403, 1, 1));
const rates = load('src/features/tools/services/exchange-rates.ts');
const item = { id: 'usd', unit: 'IRT', price: 100, updated_utc: '2026-11-14T09:00:00', stale: false };
assert.equal(rates.parseExchangeRate({ item }, 'usd').updatedAt, Date.parse('2026-11-14T09:00:00Z'));
for (const change of [{ unit: 'IRR' }, { price: -1 }, { price: Infinity }, { id: 'eur' }, { updated_utc: 'invalid' }, { stale: undefined }]) {
  assert.throws(() => rates.parseExchangeRate({ item: { ...item, ...change } }, 'usd'));
}
console.log('Calculator and exchange-response validation passed.');

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function loader(mocks = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} }; cache.set(file, mod);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    new Function('module', 'exports', 'require', code)(mod, mod.exports, name => {
      if (name in mocks) return mocks[name];
      return load(path.resolve(path.dirname(file), name + '.ts'));
    });
    return mod.exports;
  }
  return load;
}
const prefix = 'src/features/vehicles/';
const model = loader()(prefix + 'model.ts');
const expense = { id: 'e1', title: 'Fuel', category: 'fuel', amount: 100, date: '2025-03-21', odometer: 0 };
const reminder = { id: 'r1', title: 'Insurance', kind: 'insurance', date: '2090-04-12', done: false };
const car = { id: 'c1', name: 'Car', currency: 'toman', expenses: [expense], reminders: [reminder] };
model.validateVehicles([car]);
assert.deepEqual(model.persianFields('2025-03-21'), { year: '1404', month: '1', day: '1' });
assert.equal(model.parseDateFields({ year: '۱۴۰۴', month: '۰۱', day: '۰۱' }), '2025-03-21');
assert.equal(model.parseDateFields({ year: '١٤٠٤', month: '٠١', day: '٠١' }), '2025-03-21');
assert.throws(() => model.parseDateFields({ year: '1404', month: '12', day: '30' }));
assert.throws(() => model.parseDateFields({ year: '', month: '', day: '' }));
const costs = [
  expense,
  { ...expense, id: 'e2', category: 'maintenance', amount: 250, date: '2025-04-20' },
  { ...expense, id: 'e3', amount: 1000, date: '2025-04-21' },
  { ...expense, id: 'e4', category: 'insurance', amount: 700, date: '2025-03-20' },
];
const summary = model.summarizeMonth({ ...car, expenses: costs }, 1404, 1);
assert.equal(summary.total, 350);
assert.equal(summary.count, 2);
assert.deepEqual(summary.categories, { fuel: 100, maintenance: 250, insurance: 0, other: 0 });
assert.equal(model.summarizeMonth({ ...car, expenses: costs }, 1403, 12).total, 700);
assert.equal(model.summarizeMonth({ ...car, expenses: [] }, 1404, 1).total, 0);
for (const patch of [
  { amount: 0 }, { amount: -1 }, { amount: 0.5 }, { amount: Number.MAX_SAFE_INTEGER + 1 },
  { date: '2026-02-30' }, { category: 'unknown' }, { odometer: -1 }, { odometer: 1.5 }, { title: '' },
]) assert.throws(() => model.validateVehicles([{ ...car, expenses: [{ ...expense, ...patch }] }]));
assert.throws(() => model.validateVehicles([car, car]));
assert.throws(() => model.validateVehicles([{ ...car, expenses: [expense, expense] }]));
assert.throws(() => model.validateVehicles([{ ...car, expenses: [{ ...expense, amount: Number.MAX_SAFE_INTEGER }, { ...expense, id: 'e2' }] }]));
assert.throws(() => model.validateVehicles([{ ...car, reminders: [{ ...reminder, done: 'false' }] }]));
const before = new Date(2090, 3, 12, 8, 59);
assert.equal(model.buildVehicleSchedule([car], before).items[0].date.getHours(), 9);
assert.equal(model.buildVehicleSchedule([car], new Date(2090, 3, 12, 9, 1)).items.length, 0);
assert.equal(model.buildVehicleSchedule([{ ...car, reminders: [{ ...reminder, done: true }] }], before).items.length, 0);

(async () => {
  const values = new Map();
  const KEY = 'iran-tools:vehicles:v1';
  let failWrite = false, failSchedule = false, allowed = true;
  const storageMock = {
    getItem: async key => values.get(key) ?? null,
    setItem: async (key, value) => { if (failWrite) throw new Error('disk full'); values.set(key, value); },
  };
  const pending = new Map([['unrelated', { identifier: 'unrelated', content: { data: { owner: 'other' } } }]]);
  let schedules = 0, prompts = 0;
  const notifications = {
    setNotificationHandler() {},
    getAllScheduledNotificationsAsync: async () => [...pending.values()],
    getPermissionsAsync: async () => ({ granted: allowed }),
    requestPermissionsAsync: async () => { prompts++; return { granted: allowed }; },
    setNotificationChannelAsync: async () => {},
    cancelScheduledNotificationAsync: async id => pending.delete(id),
    scheduleNotificationAsync: async entry => { if (failSchedule) throw new Error('schedule error'); schedules++; pending.set(entry.identifier, entry); return entry.identifier; },
    IosAuthorizationStatus: { PROVISIONAL: 3 }, AndroidImportance: { DEFAULT: 3 }, SchedulableTriggerInputTypes: { DATE: 'date' },
  };
  let cursor = 0, effect;
  const slots = [];
  const react = {
    useState(initial) { const index = cursor++; if (!(index in slots)) slots[index] = initial; return [slots[index], value => { slots[index] = value; }]; },
    useRef(initial) { const index = cursor++; if (!(index in slots)) slots[index] = { current: initial }; return slots[index]; },
    useEffect(callback) { if (!effect) effect = callback; },
  };
  const load = loader({
    '@react-native-async-storage/async-storage': { __esModule: true, default: storageMock },
    'react-native': { Platform: { OS: 'android' } }, 'expo-notifications': notifications, react,
  });
  const storage = load(prefix + 'storage.ts');
  const { useVehicles } = load(prefix + 'use-vehicles.ts');
  const render = () => { cursor = 0; return useVehicles(); };
  render(); effect(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(render().ready, true);
  assert.equal(await render().saveVehicle('My car', 'toman'), true);
  const id = render().vehicles[0].id;
  assert.equal(await render().saveExpense(id, expense), true);
  let saved = render().vehicles[0].expenses[0];
  assert.equal(await render().saveVehicle('Renamed', 'rial', id), false); // Never reinterpret existing prices.
  assert.equal(await render().saveVehicle('Renamed', 'toman', id), true);
  assert.equal(await render().saveExpense(id, { ...expense, amount: 350 }, saved.id), true);
  assert.equal(render().vehicles[0].expenses[0].amount, 350);
  assert.equal(await render().saveExpense(id, { ...expense, date: '9999-01-01' }), false);
  failWrite = true;
  assert.equal(await render().deleteExpense(id, saved.id), false);
  assert.equal(render().vehicles[0].expenses.length, 1);
  failWrite = false;
  assert.equal(await render().saveReminder(id, reminder), true);
  const rid = render().vehicles[0].reminders[0].id;
  assert.equal(await render().setReminderDone(id, rid, true), true);
  assert.equal(await render().saveReminder(id, { ...reminder, title: 'Changed' }, rid), true);
  assert.equal(render().vehicles[0].reminders[0].done, true);
  assert.equal(await render().setReminderDone(id, rid, false), true);
  assert.equal(await render().deleteReminder(id, rid), true);
  assert.equal(render().vehicles[0].reminders.length, 0);
  const original = values.get(KEY);
  values.set(KEY, 'corrupt');
  assert.equal(await render().saveVehicle('Must not replace corrupt data', 'toman'), false);
  assert.equal(values.get(KEY), 'corrupt');
  values.set(KEY, original);
  assert.equal(await render().deleteVehicle(id), true);
  assert.equal(render().vehicles.length, 0);

  let changes = 0;
  const unsubscribe = storage.subscribeVehicles(() => changes++);
  await storage.changeVehicles(() => [car]);
  assert.equal(changes, 1);
  await Promise.all([
    storage.changeVehicles(cars => cars.map(c => ({ ...c, name: 'Latest' }))),
    storage.readVehicles().then(cars => assert.equal(cars[0].name, 'Latest')),
  ]);
  const service = load(prefix + 'reminders.ts');
  assert.equal((await service.syncReminders('en')).enabled, false);
  assert.equal(prompts, 0);
  allowed = false;
  await assert.rejects(() => service.changeReminders(true, 'en'));
  allowed = true;
  assert.equal((await service.changeReminders(true, 'en')).count, 1);
  await service.syncReminders('en'); assert.equal(schedules, 1);
  await service.syncReminders('fa'); assert.equal(schedules, 2);
  await storage.changeVehicles(cars => cars.map(c => ({ ...c, reminders: c.reminders.map(r => ({ ...r, done: true })) })));
  await service.syncReminders('fa'); assert.equal(pending.size, 1);
  await storage.changeVehicles(() => [car]);
  failSchedule = true;
  await assert.rejects(() => service.syncReminders('fa'));
  failSchedule = false;
  await service.syncReminders('fa'); assert.equal(pending.size, 2);
  await storage.changeVehicles(() => []);
  await service.syncReminders('fa'); assert.equal(pending.size, 1);

  // Both providers may reconcile simultaneously on launch. Their shared queue
  // must preserve existing unrelated alerts and keep the device total <= 60.
  const installmentStorage = load('src/features/installments/storage.ts');
  const installmentReminders = load('src/features/installments/reminders.ts');
  await installmentStorage.replaceBooks(Array.from({ length: 40 }, (_, i) => ({
    id: `p${i}`, title: 'Loan', currency: 'toman', createdAt: '2026-01-01T00:00:00Z',
    installments: [{ id: `i${i}`, number: 1, amount: 100, dueDate: '2090-04-12', payment: null }],
  })));
  await storage.changeVehicles(() => Array.from({ length: 40 }, (_, i) => ({ ...car, id: `v${i}` })));
  const states = await Promise.all([installmentReminders.changeReminders(true, 'en'), service.changeReminders(true, 'en')]);
  assert.equal(pending.size, 60);
  assert.equal(states.some(s => s.limited), true);
  await service.changeReminders(false, 'en');
  assert.equal(pending.size, 41);
  assert.equal(pending.has('unrelated'), true);
  unsubscribe();
  console.log('Vehicle validation, Persian months, CRUD, failed writes, corrupt storage, reminder cancellation and shared notification capacity checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });

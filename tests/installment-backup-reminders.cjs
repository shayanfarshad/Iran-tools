const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function loader(mocks = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} };
    cache.set(file, mod);
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
const prefix = 'src/features/installments/';
const pure = loader();
const { encodeBackup, decodeBackup, MAX_BACKUP_BYTES } = pure(prefix + 'backup.ts');
const { buildReminderSchedule } = pure(prefix + 'reminder-schedule.ts');
const item = { id: 'p-1', number: 1, amount: 500, dueDate: '2090-04-12', payment: null };
const plan = { id: 'p', title: 'دفتر تست', currency: 'toman', createdAt: '2026-01-01T00:00:00Z', installments: [item] };
const paid = { ...plan, installments: [{ ...item, payment: { paidAt: '2026-01-02T10:00:00Z' } }] };
assert.deepEqual(decodeBackup(encodeBackup([paid])), [paid]);
assert.deepEqual(decodeBackup('\uFEFF' + encodeBackup([plan])), [plan]);
assert.deepEqual(decodeBackup(encodeBackup([])), []);
for (const raw of ['{', 'null', '{}', JSON.stringify({ ...JSON.parse(encodeBackup([plan])), version: 2 }), ' '.repeat(MAX_BACKUP_BYTES + 1)]) {
  assert.throws(() => decodeBackup(raw));
}
for (const patch of [
  { amount: 0 }, { amount: 1.5 }, { amount: Number.MAX_SAFE_INTEGER + 1 },
  { dueDate: '2090-02-30' }, { payment: {} }, { number: 2 }, { id: '' },
]) assert.throws(() => encodeBackup([{ ...plan, installments: [{ ...item, ...patch }] }]));
assert.throws(() => encodeBackup([plan, plan]));
assert.throws(() => encodeBackup([{ ...plan, installments: [item, { ...item, number: 2 }] }]));
const withExtra = JSON.parse(encodeBackup([plan]));
withExtra.plans[0].unexpected = 'drop me';
assert.equal(decodeBackup(JSON.stringify(withExtra))[0].unexpected, undefined);

const before = new Date(2090, 3, 12, 8, 59);
const schedule = buildReminderSchedule([plan, { ...paid, id: 'paid' }], before);
assert.equal(schedule.items.length, 1);
assert.equal(schedule.items[0].date.getHours(), 9);
assert.equal(schedule.items[0].date.getDate(), 12);
assert.equal(buildReminderSchedule([plan], new Date(2090, 3, 12, 9, 1)).items.length, 0);
const many = Array.from({ length: 65 }, (_, i) => ({ ...plan, id: `book${i}` }));
assert.equal(buildReminderSchedule(many, before).items.length, 60);
assert.equal(buildReminderSchedule(many, before).limited, true);
assert.equal(buildReminderSchedule(many, before, 0).items.length, 0);

(async () => {
  const values = new Map();
  const BOOKS = 'iran-tools:installment-books:v1';
  let failWrite = false;
  let failSchedule = false;
  let permission = true;
  let requests = 0;
  let scheduledCalls = 0;
  const storageMock = {
    getItem: async key => values.get(key) ?? null,
    setItem: async (key, value) => { if (failWrite) throw new Error('disk full'); values.set(key, value); },
  };
  const pending = new Map([['other', { identifier: 'other', content: { data: { owner: 'other-tool' } } }]]);
  const api = {
    setNotificationHandler() {},
    getAllScheduledNotificationsAsync: async () => [...pending.values()],
    getPermissionsAsync: async () => ({ granted: permission }),
    requestPermissionsAsync: async () => { requests++; return { granted: permission }; },
    setNotificationChannelAsync: async () => {},
    cancelScheduledNotificationAsync: async id => { pending.delete(id); },
    scheduleNotificationAsync: async entry => {
      if (failSchedule) throw new Error('OS refused');
      scheduledCalls++; pending.set(entry.identifier, entry); return entry.identifier;
    },
    IosAuthorizationStatus: { PROVISIONAL: 3 },
    AndroidImportance: { DEFAULT: 3 },
    SchedulableTriggerInputTypes: { DATE: 'date' },
  };
  const load = loader({
    '@react-native-async-storage/async-storage': { __esModule: true, default: storageMock },
    'react-native': { Platform: { OS: 'android' } },
    'expo-notifications': api,
  });
  const storage = load(prefix + 'storage.ts');
  const reminders = load(prefix + 'reminders.ts');
  let notifications = 0;
  const unsubscribe = storage.subscribeBooks(() => notifications++);
  await storage.replaceBooks([paid]);
  assert.deepEqual(await storage.readBooks(), [paid]);
  assert.equal(notifications, 1);
  failWrite = true;
  await assert.rejects(() => storage.replaceBooks([]));
  assert.deepEqual(await storage.readBooks(), [paid]);
  assert.equal(notifications, 1);
  failWrite = false;
  values.set(BOOKS, 'corrupt');
  await assert.rejects(() => storage.readBooks());
  await storage.replaceBooks([plan]);
  assert.deepEqual(await storage.readBooks(), [plan]);
  await Promise.all([
    storage.changeStoredPlans(plans => plans.map(p => ({ ...p, title: 'Updated' }))),
    storage.readBooks().then(plans => assert.equal(plans[0].title, 'Updated')),
  ]);
  let state = await reminders.syncReminders('en');
  assert.equal(state.enabled, false);
  assert.equal(requests, 0); // Never prompt on launch.
  permission = false;
  await assert.rejects(() => reminders.changeReminders(true, 'en'));
  assert.equal(pending.size, 1);
  permission = true;
  state = await reminders.changeReminders(true, 'en');
  assert.equal(state.count, 1);
  assert.equal(pending.size, 2);
  await reminders.syncReminders('en');
  assert.equal(scheduledCalls, 1); // Reconciliation is idempotent.
  await reminders.syncReminders('fa');
  assert.equal(scheduledCalls, 2); // Locale changes replace existing content.
  await storage.replaceBooks([{ ...plan, installments: [{ ...item, dueDate: '2090-04-13' }] }]);
  await reminders.syncReminders('fa');
  const shifted = [...pending.values()].find(entry => entry.content.data.owner === 'installment-book');
  assert.equal(shifted.trigger.date.getDate(), 13);
  assert.equal(shifted.trigger.date.getHours(), 9);
  await storage.replaceBooks([paid]);
  await reminders.syncReminders('fa');
  assert.equal(pending.size, 1); // Payment cancels only this feature's reminder.
  await storage.replaceBooks([plan]);
  await reminders.syncReminders('fa');
  assert.equal(pending.size, 2); // Undo payment restores it.
  await storage.replaceBooks([]);
  await reminders.syncReminders('fa');
  assert.equal(pending.size, 1); // Delete/empty restore cancels pending reminders.
  await storage.replaceBooks([plan]);
  failSchedule = true;
  await assert.rejects(() => reminders.syncReminders('fa'));
  failSchedule = false;
  assert.equal((await reminders.syncReminders('fa')).count, 1);
  permission = false;
  assert.equal((await reminders.syncReminders('fa')).permission, false);
  assert.equal(pending.size, 1);
  permission = true;
  await reminders.syncReminders('fa');
  state = await reminders.changeReminders(false, 'fa');
  assert.equal(state.enabled, false);
  assert.equal(pending.size, 1);
  assert.equal(pending.has('other'), true);
  unsubscribe();
  console.log('Backup validation, atomic restore, queue ordering, local-time scheduling, permissions, cancellation and retry checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });

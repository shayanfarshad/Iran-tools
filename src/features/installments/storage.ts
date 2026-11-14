import AsyncStorage from "@react-native-async-storage/async-storage";
import type { InstallmentPlan } from "../tools/calculators/installment-book";
import { copyPlans, validatePlans } from "./backup";

const STORAGE_KEY = "iran-tools:installment-books:v1";

type StoredData = {
  version: 1;
  plans: InstallmentPlan[];
};

// Serialize reads and writes to avoid overwriting another pending operation.
let storageQueue: Promise<unknown> = Promise.resolve();

function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const result = storageQueue.then(operation);

  storageQueue = result.then(
    () => undefined,
    () => undefined,
  );

  return result;
}

async function readStoredPlans(): Promise<InstallmentPlan[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (raw === null) return [];

  const parsed: unknown = JSON.parse(raw);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("invalid-storage");
  }

  const data = parsed as Partial<StoredData>;

  if (data.version !== 1) {
    throw new Error("unsupported-storage-version");
  }

  validatePlans(data.plans);
  return data.plans;
}

export async function changeStoredPlans(
  update: (plans: InstallmentPlan[]) => InstallmentPlan[],
): Promise<InstallmentPlan[]> {
  return serialize(async () => {
    const current = await readStoredPlans();
    const next = update(current);

    validatePlans(next);

    const data: StoredData = {
      version: 1,
      plans: next,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    notifyBooksChanged();
    return next;
  });
}


const listeners = new Set<() => void>();
function notifyBooksChanged() { listeners.forEach(listener => listener()); }
export function subscribeBooks(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function readBooks() { return serialize(readStoredPlans); }
export function replaceBooks(plans: InstallmentPlan[]) {
  const next = copyPlans(plans);
  return serialize(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, plans: next }));
    notifyBooksChanged();
    return next;
  });
}

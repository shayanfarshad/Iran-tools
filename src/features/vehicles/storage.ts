import AsyncStorage from "@react-native-async-storage/async-storage";
import { validateVehicles, type Vehicle } from "./model";

const KEY = "iran-tools:vehicles:v1";
let queue: Promise<unknown> = Promise.resolve();
const listeners = new Set<() => void>();
function serial<T>(task: () => Promise<T>) {
  const next = queue.then(task);
  queue = next.catch(() => undefined);
  return next;
}
async function read(): Promise<Vehicle[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw === null) return [];
  const data = JSON.parse(raw);
  if (data?.version !== 1) throw new Error("unsupported-version");
  validateVehicles(data.vehicles);
  return data.vehicles;
}
export function readVehicles() { return serial(read); }
export function changeVehicles(update: (vehicles: Vehicle[]) => Vehicle[]) {
  return serial(async () => {
    const next = update(await read());
    validateVehicles(next);
    await AsyncStorage.setItem(KEY, JSON.stringify({ version: 1, vehicles: next }));
    listeners.forEach(listener => listener());
    return next;
  });
}
export function subscribeVehicles(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function uniqueId(existing: { id: string }[]) {
  let id: string;
  do { id = `${Date.now()}-${Math.random().toString(36).slice(2)}`; } while (existing.some(item => item.id === id));
  return id;
}

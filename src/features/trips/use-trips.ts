import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { validateTrips, type Trip, type TripExpense } from "./calculator";

const key = "iran-tools:trips:v1";
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(action: () => Promise<T>): Promise<T> {
  const next = queue.then(action);
  queue = next.then(() => undefined, () => undefined);
  return next;
}
async function read(): Promise<Trip[]> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return [];
  const data = JSON.parse(raw);
  if (data?.version !== 1) throw new Error("unsupported-version");
  validateTrips(data.trips);
  return data.trips;
}
function uniqueId(existing: string[]) {
  let id: string;
  do { id = `${Date.now()}-${Math.random().toString(36).slice(2)}`; } while (existing.includes(id));
  return id;
}
export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(false);
  const lock = useRef(true);
  useEffect(() => {
    let active = true;
    serial(read).then(data => { if (active) { setTrips(data); setReady(true); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) { lock.current = false; setBusy(false); } });
    return () => { active = false; };
  }, []);
  const run = async (update?: (current: Trip[]) => Trip[]): Promise<boolean> => {
    if (lock.current || (update && !ready)) return false;
    lock.current = true;
    setBusy(true);
    setError(false);
    try {
      const result = await serial(async () => {
        const current = await read();
        if (!update) return current;
        const next = update(current);
        validateTrips(next);
        await AsyncStorage.setItem(key, JSON.stringify({ version: 1, trips: next }));
        return next;
      });
      setTrips(result);
      setReady(true);
      return true;
    } catch { setError(true); return false; }
    finally { lock.current = false; setBusy(false); }
  };
  const createTrip = (title: string, currency: Trip["currency"], names: string[]) => run(current => {
    const id = uniqueId(current.map(trip => trip.id));
    return [{ id, title: title.trim(), currency, members: names.map((name, index) => ({ id: `${id}-${index}`, name: name.trim() })), expenses: [] }, ...current];
  });
  const mutateTrip = (id: string, update: (trip: Trip) => Trip) => run(current => {
    if (!current.some(trip => trip.id === id)) throw new Error("trip-not-found");
    return current.map(trip => trip.id === id ? update(trip) : trip);
  });
  const saveExpense = (tripId: string, expense: Omit<TripExpense, "id">, expenseId?: string) => mutateTrip(tripId, trip => {
    if (expenseId && !trip.expenses.some(item => item.id === expenseId)) throw new Error("expense-not-found");
    const saved = { ...expense, id: expenseId ?? uniqueId(trip.expenses.map(item => item.id)) };
    return { ...trip, expenses: expenseId ? trip.expenses.map(item => item.id === expenseId ? saved : item) : [...trip.expenses, saved] };
  });
  const deleteExpense = (tripId: string, expenseId: string) => mutateTrip(tripId, trip => ({ ...trip, expenses: trip.expenses.filter(item => item.id !== expenseId) }));
  const deleteTrip = (id: string) => run(current => current.filter(trip => trip.id !== id));
  return { trips, ready, busy, error, reload: () => run(), createTrip, saveExpense, deleteExpense, deleteTrip };
}
export type TripStore = ReturnType<typeof useTrips>;

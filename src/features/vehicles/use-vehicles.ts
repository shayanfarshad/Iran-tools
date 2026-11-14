import { useEffect, useRef, useState } from "react";
import { changeVehicles, readVehicles, uniqueId } from "./storage";
import { localToday, type Vehicle, type VehicleExpense, type VehicleReminder } from "./model";

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(false);
  const lock = useRef(true);
  useEffect(() => {
    let active = true;
    readVehicles().then(data => { if (active) { setVehicles(data); setReady(true); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) { lock.current = false; setBusy(false); } });
    return () => { active = false; };
  }, []);

  const run = async (update?: (current: Vehicle[]) => Vehicle[]) => {
    if (lock.current || (update && !ready)) return false;
    lock.current = true;
    setBusy(true);
    setError(false);
    try {
      setVehicles(await (update ? changeVehicles(update) : readVehicles()));
      setReady(true);
      return true;
    } catch { setError(true); return false; }
    finally { lock.current = false; setBusy(false); }
  };
  const mutate = (id: string, update: (vehicle: Vehicle) => Vehicle) => run(current => {
    if (!current.some(car => car.id === id)) throw new Error("vehicle-not-found");
    return current.map(car => car.id === id ? update(car) : car);
  });
  const saveVehicle = (name: string, currency: Vehicle["currency"], id?: string) => {
    if (id) return mutate(id, vehicle => {
      if (vehicle.expenses.length && currency !== vehicle.currency) throw new Error("currency-locked");
      return { ...vehicle, name: name.trim(), currency };
    });
    return run(current => [{ id: uniqueId(current), name: name.trim(), currency, expenses: [], reminders: [] }, ...current]);
  };
  const deleteVehicle = (id: string) => run(current => {
    if (!current.some(car => car.id === id)) throw new Error("vehicle-not-found");
    return current.filter(car => car.id !== id);
  });
  const saveExpense = (vehicleId: string, expense: Omit<VehicleExpense, "id">, id?: string) => mutate(vehicleId, vehicle => {
    if (expense.date > localToday()) throw new Error("future-expense");
    if (id && !vehicle.expenses.some(item => item.id === id)) throw new Error("expense-not-found");
    const saved = { ...expense, title: expense.title.trim(), id: id ?? uniqueId(vehicle.expenses) };
    return { ...vehicle, expenses: id ? vehicle.expenses.map(item => item.id === id ? saved : item) : [saved, ...vehicle.expenses] };
  });
  const deleteExpense = (vehicleId: string, id: string) => mutate(vehicleId, vehicle => ({
    ...vehicle, expenses: vehicle.expenses.filter(item => item.id !== id),
  }));
  const saveReminder = (vehicleId: string, reminder: Omit<VehicleReminder, "id" | "done">, id?: string) => mutate(vehicleId, vehicle => {
    const previous = vehicle.reminders.find(item => item.id === id);
    if (id && !previous) throw new Error("reminder-not-found");
    const saved = { ...reminder, title: reminder.title.trim(), id: id ?? uniqueId(vehicle.reminders), done: previous?.done ?? false };
    return { ...vehicle, reminders: id ? vehicle.reminders.map(item => item.id === id ? saved : item) : [...vehicle.reminders, saved] };
  });
  const setReminderDone = (vehicleId: string, id: string, done: boolean) => mutate(vehicleId, vehicle => {
    if (!vehicle.reminders.some(item => item.id === id)) throw new Error("reminder-not-found");
    return { ...vehicle, reminders: vehicle.reminders.map(item => item.id === id ? { ...item, done } : item) };
  });
  const deleteReminder = (vehicleId: string, id: string) => mutate(vehicleId, vehicle => ({
    ...vehicle, reminders: vehicle.reminders.filter(item => item.id !== id),
  }));
  return { vehicles, ready, busy, error, reload: () => run(), saveVehicle, deleteVehicle, saveExpense, deleteExpense, saveReminder, setReminderDone, deleteReminder };
}
export type VehicleStore = ReturnType<typeof useVehicles>;

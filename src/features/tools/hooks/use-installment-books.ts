import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";

import {
    editInstallmentPlan,
    markInstallmentPaid,
    summarizeInstallments,
    undoInstallmentPayment,
    type Installment,
    type InstallmentPlan,
} from "../calculators/installment-book";

const STORAGE_KEY = "iran-tools:installment-books:v1";

type NewPlan = {
  title: string;
  currency: InstallmentPlan["currency"];
  installments: Installment[];
};

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

function isPlan(value: unknown): value is InstallmentPlan {
  if (!value || typeof value !== "object") return false;

  const plan = value as Partial<InstallmentPlan>;

  if (
    typeof plan.id !== "string" ||
    !plan.id.trim() ||
    typeof plan.title !== "string" ||
    !plan.title.trim() ||
    plan.title.length > 80 ||
    !["toman", "rial"].includes(plan.currency ?? "") ||
    typeof plan.createdAt !== "string" ||
    !Number.isFinite(Date.parse(plan.createdAt)) ||
    !Array.isArray(plan.installments) ||
    plan.installments.length < 1 ||
    plan.installments.length > 360
  ) {
    return false;
  }

  for (const item of plan.installments) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.id !== "string" ||
      typeof item.dueDate !== "string" ||
      !Number.isSafeInteger(item.number) ||
      item.number < 1
    ) {
      return false;
    }

    if (
      item.payment !== null &&
      (!item.payment ||
        typeof item.payment.paidAt !== "string" ||
        !Number.isFinite(Date.parse(item.payment.paidAt)))
    ) {
      return false;
    }
  }

  try {
    // Also validates amounts, due dates, duplicate IDs and total precision.
    summarizeInstallments(plan.installments, "2000-01-01");
    return true;
  } catch {
    return false;
  }
}

function validatePlans(value: unknown): asserts value is InstallmentPlan[] {
  if (!Array.isArray(value) || !value.every(isPlan)) {
    throw new Error("invalid-stored-plans");
  }

  const ids = value.map((plan) => plan.id);

  if (new Set(ids).size !== ids.length) {
    throw new Error("duplicate-plan-id");
  }
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

async function changeStoredPlans(
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

    return next;
  });
}

export function useInstallmentBooks() {
  const [plans, setPlans] = useState<InstallmentPlan[]>([]);
  const [isLoaded, setLoaded] = useState(false);
  const [isBusy, setBusy] = useState(true);
  const [hasStorageError, setStorageError] = useState(false);

  const busyRef = useRef(true);

  useEffect(() => {
    let active = true;

    serialize(readStoredPlans)
      .then((loadedPlans) => {
        if (!active) return;

        setPlans(loadedPlans);
        setLoaded(true);
        setStorageError(false);
      })
      .catch(() => {
        if (active) setStorageError(true);
      })
      .finally(() => {
        if (!active) return;

        busyRef.current = false;
        setBusy(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const execute = async (
    operation: () => Promise<InstallmentPlan[]>,
  ): Promise<boolean> => {
    if (busyRef.current) return false;

    busyRef.current = true;
    setBusy(true);
    setStorageError(false);

    try {
      const updated = await operation();

      setPlans(updated);
      setLoaded(true);
      return true;
    } catch {
      setStorageError(true);
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const reload = () => execute(() => serialize(readStoredPlans));

  const addPlan = (input: NewPlan): Promise<boolean> => {
    if (!isLoaded) return Promise.resolve(false);

    return execute(() =>
      changeStoredPlans((current) => {
        let id: string;

        do {
          id = `plan-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        } while (current.some((plan) => plan.id === id));

        const plan: InstallmentPlan = {
          id,
          title: input.title.trim(),
          currency: input.currency,
          createdAt: new Date().toISOString(),
          installments: input.installments.map((item, index) => ({
            ...item,
            id: `${id}-${index + 1}`,
            number: index + 1,
            payment: null,
          })),
        };

        return [plan, ...current];
      }),
    );
  };

  const updatePlan = (planId: string, input: NewPlan): Promise<boolean> => {
    if (!isLoaded) return Promise.resolve(false);
    return execute(() => changeStoredPlans(current => {
      if (!current.some(plan => plan.id === planId)) throw new Error("plan-not-found");
      return current.map(plan => plan.id === planId ? editInstallmentPlan(plan, input) : plan);
    }));
  };

  const deletePlan = (planId: string): Promise<boolean> => {
    if (!isLoaded) return Promise.resolve(false);
    return execute(() => changeStoredPlans(current => {
      if (!current.some(plan => plan.id === planId)) throw new Error("plan-not-found");
      return current.filter(plan => plan.id !== planId);
    }));
  };

  const setPayment = (
    planId: string,
    installmentId: string,
    paid: boolean,
  ): Promise<boolean> => {
    if (!isLoaded) return Promise.resolve(false);

    return execute(() =>
      changeStoredPlans((current) => {
        if (!current.some((plan) => plan.id === planId)) {
          throw new Error("plan-not-found");
        }

        return current.map((plan) => {
          if (plan.id !== planId) return plan;

          return paid
            ? markInstallmentPaid(plan, installmentId, new Date().toISOString())
            : undoInstallmentPayment(plan, installmentId);
        });
      }),
    );
  };

  return {
    plans,
    isLoaded,
    isBusy,
    hasStorageError,
    reload,
    addPlan,
    updatePlan,
    deletePlan,
    setPayment,
  };
}

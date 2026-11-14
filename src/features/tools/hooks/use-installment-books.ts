import { useEffect, useRef, useState } from "react";

import {
    editInstallmentPlan,
    markInstallmentPaid,
    undoInstallmentPayment,
    type Installment,
    type InstallmentPlan,
} from "../calculators/installment-book";

import { changeStoredPlans, readBooks, replaceBooks } from "../../installments/storage";

type NewPlan = {
  title: string;
  currency: InstallmentPlan["currency"];
  installments: Installment[];
};

export function useInstallmentBooks() {
  const [plans, setPlans] = useState<InstallmentPlan[]>([]);
  const [isLoaded, setLoaded] = useState(false);
  const [isBusy, setBusy] = useState(true);
  const [hasStorageError, setStorageError] = useState(false);

  const busyRef = useRef(true);

  useEffect(() => {
    let active = true;

    readBooks()
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

  const reload = () => execute(() => readBooks());

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
    restorePlans: (plans: InstallmentPlan[]) => execute(() => replaceBooks(plans)),
  };
}

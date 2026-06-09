"use client";

import { useEffect, useState } from "react";

export function useLocalRecords<T extends { id: string }>(key: string, seed: T[]) {
  const storageKey = `merit.v2.${key}`;
  const [records, setRecords] = useState<T[]>(() => {
    if (typeof window === "undefined") return seed;
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : seed;
    } catch (error) {
      console.warn(`Could not load ${storageKey} from localStorage`, error);
      return seed;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  }, [storageKey, records]);

  return {
    records,
    setRecords,
    addRecord: (record: T) => setRecords((current) => [record, ...current]),
    updateRecord: (id: string, updates: Partial<T>) =>
      setRecords((current) =>
        current.map((record) =>
          record.id === id ? { ...record, ...updates, updated_at: new Date().toISOString() } : record
        )
      ),
    deleteRecord: (id: string) => setRecords((current) => current.filter((record) => record.id !== id)),
    resetRecords: () => setRecords(seed),
  };
}

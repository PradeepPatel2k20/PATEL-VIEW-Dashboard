"use client";
import { useEffect, useState, useCallback } from "react";

const STORAGE_CHANGE_EVENT = "local-storage-change";

type StorageChangeDetail = { key: string; value: unknown };

function dispatchStorageChange(key: string, value: unknown) {
  window.dispatchEvent(new CustomEvent<StorageChangeDetail>(STORAGE_CHANGE_EVENT, { detail: { key, value } }));
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const onStorageChange = (event: Event) => {
      const { key: changedKey, value: changedValue } = (event as CustomEvent<StorageChangeDetail>).detail;
      if (changedKey === key) setValue(changedValue as T);
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, onStorageChange);
    return () => window.removeEventListener(STORAGE_CHANGE_EVENT, onStorageChange);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
          dispatchStorageChange(key, resolved);
        } catch {
          // storage full / disabled — fail silently, in-memory state still works
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, update, hydrated] as const;
}

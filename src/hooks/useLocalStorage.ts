// src/hooks/useLocalStorage.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { getStorageItem, setStorageItem, removeStorageItem } from "@/utils/storage";

type Serializer<T> = (value: T) => string;
type Deserializer<T> = (value: string) => T;
type Validator<T> = (value: T) => boolean;
type InitialValue<T> = T | (() => T);

interface UseLocalStorageOptions<T> {
  // Store raw string/primitive by default. Set to false to JSON encode/decode.
  raw?: boolean;
  // Validate values before committing them (return true if ok).
  validate?: Validator<T>;
  // Sync this state when another tab changes the same key.
  syncTabs?: boolean;
  // Custom (de)serializers if you need them.
  serialize?: Serializer<T>;
  deserialize?: Deserializer<T>;
}

/**
 * A minimal, SSR-safe localStorage-backed state hook.
 *
 * Features:
 * - Synchronous initial value (reads LS once; falls back to `initialValue`)
 * - Optional validator to reject bad values
 * - Optional JSON mode (default is raw string/primitive storage)
 * - Cross-tab sync via "storage" events
 * 
 * Uses shared storage utilities from @/utils/storage for consistency
 * across vanilla scripts and React components.
 */
export default function useLocalStorage<T = string>(
  key: string,
  initialValue: InitialValue<T>,
  options: UseLocalStorageOptions<T> = {}
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const {
    raw = true,
    validate,
    syncTabs = true,
    serialize = raw ? (v: T) => String(v) : (v: T) => JSON.stringify(v),
    deserialize = raw ? (v: string) => v as T : (v: string) => JSON.parse(v) as T,
  } = options;

  const initialRef = useRef(initialValue);

  const getInitial = useCallback((): T => {
    // SSR guard
    if (typeof window === "undefined") {
      return typeof initialRef.current === "function"
        ? (initialRef.current as () => T)()
        : initialRef.current as T;
    }
    
    try {
      const rawVal = getStorageItem(key);
      if (rawVal != null) {
        const parsed = deserialize(rawVal);
        if (!validate || validate(parsed)) return parsed;
      }
    } catch {}
    
    return typeof initialRef.current === "function"
      ? (initialRef.current as () => T)()
      : initialRef.current as T;
  }, [key, deserialize, validate]);

  const [value, setValue] = useState<T>(getInitial);

  // Persist on change
  useEffect(() => {
    try {
      // Validate before writing
      if (validate && !validate(value)) return;
      setStorageItem(key, serialize(value));
    } catch {}
  }, [key, value, serialize, validate]);

  // Cross-tab sync
  useEffect(() => {
    if (!syncTabs || typeof window === "undefined") return;

    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage) return;
      if (e.key !== key) return;
      try {
        if (e.newValue == null) return; // ignore removals
        const next = deserialize(e.newValue);
        if (!validate || validate(next)) setValue(next);
      } catch {}
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, deserialize, validate, syncTabs]);

  return [value, setValue];
}
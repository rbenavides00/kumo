import { useCallback, useState } from "react";
import type { Preference } from "@/utils/preferences";

export function readPreference<T extends string>({
  key,
  fallback,
  allowed,
}: Preference<T>): T {
  try {
    const stored = localStorage.getItem(key);
    return allowed.includes(stored as T) ? (stored as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T extends string>(preference: Preference<T>) {
  const [value, setValue] = useState(() => readPreference(preference));

  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(preference.key, next);
      } catch {
        // Storage unavailable
      }
    },
    [preference.key],
  );

  return [value, set] as const;
}

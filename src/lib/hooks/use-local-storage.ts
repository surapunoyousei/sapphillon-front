import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook for managing localStorage with React state synchronization
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof globalThis.window === "undefined") {
        return initialValue;
      }

      const item = globalThis.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage and state
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value;
      setStoredValue(valueToStore);

      if (typeof globalThis.window !== "undefined") {
        globalThis.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof globalThis.window !== "undefined") {
        globalThis.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(
            `Error parsing localStorage value for key "${key}":`,
            error,
          );
        }
      }
    };

    if (typeof globalThis.window !== "undefined") {
      globalThis.addEventListener("storage", handleStorageChange);
      return () =>
        globalThis.removeEventListener("storage", handleStorageChange);
    }
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing user preferences in localStorage
 */
export function useUserPreferences() {
  return useLocalStorage("sapphillon-user-preferences", {
    theme: "system" as "light" | "dark" | "system",
    language: "en",
    autoSaveInterval: 30,
    showNotifications: true,
    compactMode: false,
  });
}

/**
 * Hook for managing recent searches
 */
export function useRecentSearches(maxItems = 10) {
  const [searches, setSearches, clearSearches] = useLocalStorage<string[]>(
    "sapphillon-recent-searches",
    [],
  );

  const addSearch = useCallback((search: string) => {
    if (!search.trim()) return;

    setSearches((prev) => {
      const filtered = prev.filter((item) => item !== search);
      const updated = [search, ...filtered].slice(0, maxItems);
      return updated;
    });
  }, [setSearches, maxItems]);

  const removeSearch = useCallback((search: string) => {
    setSearches((prev) => prev.filter((item) => item !== search));
  }, [setSearches]);

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches,
  };
}

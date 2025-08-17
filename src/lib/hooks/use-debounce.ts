import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook for debouncing values
 * Delays updating the debounced value until after the specified delay
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debouncing callbacks
 * Returns a debounced version of the callback function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): T {
  const [debounceTimer, setDebounceTimer] = useState<number>();

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const newTimer = setTimeout(() => {
        callback(...args);
      }, delay) as unknown as number;

      setDebounceTimer(newTimer);
    }) as T,
    [callback, delay, debounceTimer],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
}

/**
 * Custom hook for search functionality with debouncing
 */
export function useSearch(
  initialQuery = "",
  delay = 300,
) {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, delay);

  // Reset searching state when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== query) {
      setIsSearching(false);
    }
  }, [debouncedQuery, query]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setIsSearching(true);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery("");
    setIsSearching(false);
  }, []);

  return {
    query,
    debouncedQuery,
    isSearching,
    updateQuery,
    clearQuery,
    hasQuery: query.trim().length > 0,
    hasDebouncedQuery: debouncedQuery.trim().length > 0,
  };
}

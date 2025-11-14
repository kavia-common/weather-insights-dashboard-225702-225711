import { useEffect, useState } from 'react';

// PUBLIC_INTERFACE
export function useLocalStorage(key, initialValue) {
  /** Hook that persists state in localStorage with JSON serialization. */
  const readValue = () => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(readValue);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // ignore quota errors
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

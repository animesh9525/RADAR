import { useState, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  const setValue = useCallback((value) => {
    setStored(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch (e) { /* ignore */ }
      return next;
    });
  }, [key]);

  return [stored, setValue];
}
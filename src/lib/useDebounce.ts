import { useEffect, useState } from 'react';

/** Devolve `value` debounced em `delay`ms — útil pra busca-ao-digitar. */
export function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

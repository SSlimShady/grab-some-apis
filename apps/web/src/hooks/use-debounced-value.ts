import { useEffect, useState } from 'react'

/**
 * useDebouncedValue
 * Returns a debounced version of a changing value after the specified delay.
 * The debounced value only updates after no changes occur for `delay` ms.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])

  return debounced
}

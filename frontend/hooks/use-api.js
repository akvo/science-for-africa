import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Custom hook for data fetching and API calls.
 * @param {Function} apiFn - The API function to call (e.g. from strapi.js)
 * @param {Object} options - { immediate, args }
 * @returns {Object} { data, loading, error, execute }
 */
export function useApi(apiFn, { immediate = false, args = [] } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use a ref to keep track of the latest apiFn to avoid stale closures in useEffect
  const apiFnRef = useRef(apiFn);
  apiFnRef.current = apiFn;

  const execute = useCallback(async (...executeArgs) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFnRef.current(...executeArgs);

      // If result has an error property (consistent with strapi.js/api-client),
      // we check for it.
      if (result && result.error) {
        setError(result.error);
        return result;
      }

      setData(result);
      return result;
    } catch (err) {
      const message =
        err?.error || err?.message || "An unexpected error occurred";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Use a ref to prevent infinite loops if args are not memoized
  const prevArgsRef = useRef(null);

  useEffect(() => {
    if (immediate) {
      // Only execute if it's the first time or if args have actually changed (shallow check)
      const argsChanged =
        !prevArgsRef.current ||
        args.length !== prevArgsRef.current.length ||
        args.some((arg, i) => arg !== prevArgsRef.current[i]);

      if (argsChanged) {
        execute(...args);
        prevArgsRef.current = args;
      }
    }
  }, [immediate, execute, args]);

  return { data, loading, error, execute };
}

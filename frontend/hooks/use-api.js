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

  useEffect(() => {
    if (immediate) {
      execute(...args);
    }
  }, [immediate, ...args]); // Warning: ...args in dependency array can cause loops if args is recreated

  return { data, loading, error, execute };
}

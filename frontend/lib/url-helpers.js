/**
 * Resolves the Backend API URL dynamically based on the current environment.
 * Multi-stack portability:
 * - In local dev: defaults to http://localhost:1337/api
 * - In production: if running on a real domain but the baked-in env var is localhost,
 *   it dynamically swaps to `${origin}/cms/api`.
 */
export const getBackendApiUrl = () => {
  const bakedInUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337/api";

  // If on server-side (SSR), use the baked-in URL or internal container discovery
  if (typeof window === "undefined") {
    return bakedInUrl;
  }

  const { origin, hostname } = window.location;

  // Logic: If we are NOT on localhost, but our baked-in URL IS localhost,
  // we need to perform a dynamic swap to the current domain + /cms/api.
  if (hostname !== "localhost" && bakedInUrl.includes("localhost")) {
    // This assumes the standard proxy configuration: FRONTEND/cms -> BACKEND
    return `${origin}/cms/api`;
  }

  return bakedInUrl;
};

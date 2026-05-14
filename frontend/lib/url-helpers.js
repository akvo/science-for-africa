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

  // If on server-side (SSR/SSG), try to use internal container discovery
  if (typeof window === "undefined") {
    // If we have a dedicated server-only variable, use it.
    // Otherwise, if we are in a container, localhost should be backend.
    return process.env.BACKEND_URL || bakedInUrl.replace("localhost", "backend");
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

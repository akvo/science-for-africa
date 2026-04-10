import axios from "axios";
import { useAuthStore } from "./auth-store";

const API_URL =
  (typeof window !== "undefined" && window.__ENV?.NEXT_PUBLIC_BACKEND_URL) ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:1337/api";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Inject JWT if present
apiClient.interceptors.request.use(
  (config) => {
    const jwt = useAuthStore.getState().jwt;

    // Skip Authorization header for public auth endpoints
    const publicAuthEndpoints = [
      "/auth/local",
      "/auth/local/register",
      "/auth/send-email-confirmation",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/email-confirmation",
    ];
    const isPublicAuthEndpoint = publicAuthEndpoints.some((endpoint) =>
      config.url?.includes(endpoint),
    );

    if (jwt && !isPublicAuthEndpoint) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }

    // Inject locale parameter from window/url if on client
    if (typeof window !== "undefined") {
      const pathParts = window.location.pathname.split("/");
      // Check if first part of path is a supported locale (e.g. 'fr')
      const supportedLocales = ["en", "fr"];
      const currentLocale = supportedLocales.includes(pathParts[1])
        ? pathParts[1]
        : "en";

      config.params = {
        ...config.params,
        locale: currentLocale,
      };
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Transform axios error into consistent Strapi-like error format
    const transformedError = {
      error: "An unexpected error occurred",
      status: error.response?.status,
    };

    if (error.response?.data?.error?.message) {
      transformedError.error = error.response.data.error.message;
    } else if (error.response?.status) {
      transformedError.error = `HTTP error! status: ${error.response.status}`;
    } else if (error.message) {
      transformedError.error = error.message;
    }

    return Promise.reject(transformedError);
  },
);

export default apiClient;

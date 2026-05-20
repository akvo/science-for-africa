import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Custom storage handler to toggle between localStorage and sessionStorage
const dynamicStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name) || sessionStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    try {
      const { state } = JSON.parse(value);
      if (state?.isPersistent) {
        localStorage.setItem(name, value);
        sessionStorage.removeItem(name);
      } else {
        sessionStorage.setItem(name, value);
        localStorage.removeItem(name);
      }
    } catch (e) {
      sessionStorage.setItem(name, value);
    }
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      jwt: null,
      isAuthenticated: false,
      isPersistent: false,

      setAuth: (user, jwt, isPersistent = false) =>
        set({
          user,
          jwt,
          isPersistent,
          isAuthenticated: !!jwt,
        }),

      logout: () =>
        set({
          user: null,
          jwt: null,
          isAuthenticated: false,
          isPersistent: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : userData,
        })),
    }),
    {
      name: "sfa-auth-storage",
      storage: createJSONStorage(() => dynamicStorage),
    },
  ),
);

// Listen for storage events to sync logout across tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "sfa-auth-storage") {
      // If the storage was cleared or changed in another tab,
      // we can trigger a re-hydration or just reload if it was a logout
      useAuthStore.persist.rehydrate();

      // Optional: If we detect a logout (jwt becomes null), we could force a redirect
      const state = useAuthStore.getState();
      if (!state.jwt && window.location.pathname.startsWith("/profile")) {
        window.location.href = "/login";
      }
    }
  });
}

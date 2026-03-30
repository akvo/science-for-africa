import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      jwt: null,
      isAuthenticated: false,

      setAuth: (user, jwt) =>
        set({
          user,
          jwt,
          isAuthenticated: !!jwt,
        }),

      logout: () =>
        set({
          user: null,
          jwt: null,
          isAuthenticated: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : userData,
        })),
    }),
    {
      name: "sfa-auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

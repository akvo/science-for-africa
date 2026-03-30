import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useOnboardingStore = create(
  persist(
    (set) => ({
      step: 1,
      userType: "individual", // Default to individual as per Figma tabs
      formData: {
        // Step 1
        roleType: "",
        institutionName: "", // for Institutional account type tab
        // Step 2
        interests: [],
        // Step 3
        educationLevel: "",
        educationInstitution: { id: null, name: "" },
        // Step 4
        orcidId: "",
        // Step 5
        affiliationInstitution: { id: null, name: "" },
      },

      // Actions
      setStep: (step) => set({ step }),
      setUserType: (userType) => set({ userType }),

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      toggleInterest: (interest) =>
        set((state) => {
          const currentInterests = state.formData.interests;
          if (currentInterests.includes(interest)) {
            return {
              formData: {
                ...state.formData,
                interests: currentInterests.filter((i) => i !== interest),
              },
            };
          }
          if (currentInterests.length >= 5) {
            return state; // Limit to 5
          }
          return {
            formData: {
              ...state.formData,
              interests: [...currentInterests, interest],
            },
          };
        }),

      nextStep: () =>
        set((state) => {
          let nextStep = state.step + 1;
          // Skip Step 3 and 4 for institutions
          if (state.userType === "institution" && (nextStep === 3 || nextStep === 4)) {
            nextStep = 5; // Jump to final step or whatever is next
          }
          return { step: nextStep };
        }),
      prevStep: () =>
        set((state) => {
          let prevStep = state.step - 1;
          // Skip Step 3 and 4 for institutions
          if (state.userType === "institution" && (prevStep === 3 || prevStep === 4)) {
            prevStep = 2;
          }
          return { step: Math.max(1, prevStep) };
        }),

      skipStep: () =>
        set((state) => {
          let nextStep = state.step + 1;
          if (state.userType === "institution" && (nextStep === 3 || nextStep === 4)) {
            nextStep = 5;
          }
          return { step: nextStep };
        }),

      resetStore: () =>
        set({
          step: 1,
          userType: "individual",
          formData: {
            roleType: "",
            institutionName: "",
            interests: [],
            educationLevel: "",
            educationInstitution: { id: null, name: "" },
            orcidId: "",
            affiliationInstitution: { id: null, name: "" },
          },
        }),
    }),
    {
      name: "sfa-onboarding-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

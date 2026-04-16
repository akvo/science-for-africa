import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCollaborationStore = create(
  persist(
    (set) => ({
      isOpen: false,
      step: 1,
      formData: {
        topics: [],
        communityName: "",
        title: "",
        description: "",
        startDate: null,
        endDate: null,
        inviteEmails: [],
        mentorEmails: [],
        mentors: [],
      },

      open: () => set({ isOpen: true, step: 1 }),
      close: () =>
        set({
          isOpen: false,
          step: 1,
          formData: {
            topics: [],
            communityName: "",
            title: "",
            description: "",
            startDate: null,
            endDate: null,
            inviteEmails: [],
            mentorEmails: [],
            mentors: [],
          },
        }),

      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      toggleTopic: (topic) =>
        set((state) => {
          const current = state.formData.topics;
          if (current.includes(topic)) {
            return {
              formData: {
                ...state.formData,
                topics: current.filter((t) => t !== topic),
              },
            };
          }
          return {
            formData: {
              ...state.formData,
              topics: [...current, topic],
            },
          };
        }),

      addInviteEmail: (email) =>
        set((state) => {
          if (state.formData.inviteEmails.includes(email)) return state;
          return {
            formData: {
              ...state.formData,
              inviteEmails: [...state.formData.inviteEmails, email],
            },
          };
        }),

      removeInviteEmail: (email) =>
        set((state) => ({
          formData: {
            ...state.formData,
            inviteEmails: state.formData.inviteEmails.filter(
              (e) => e !== email,
            ),
            mentorEmails: state.formData.mentorEmails.filter(
              (e) => e !== email,
            ),
          },
        })),

      toggleMentor: (email) =>
        set((state) => {
          const current = state.formData.mentorEmails;
          if (current.includes(email)) {
            return {
              formData: {
                ...state.formData,
                mentorEmails: current.filter((e) => e !== email),
              },
            };
          }
          return {
            formData: {
              ...state.formData,
              mentorEmails: [...current, email],
            },
          };
        }),

      removeMentor: (email) =>
        set((state) => ({
          formData: {
            ...state.formData,
            mentorEmails: state.formData.mentorEmails.filter(
              (e) => e !== email,
            ),
          },
        })),

      addMentor: (user) =>
        set((state) => {
          if (state.formData.mentors.some((m) => m.id === user.id))
            return state;
          return {
            formData: {
              ...state.formData,
              mentors: [...state.formData.mentors, user],
              mentorEmails: [...state.formData.mentorEmails, user.email],
            },
          };
        }),

      removeMentorById: (userId) =>
        set((state) => {
          const mentor = state.formData.mentors.find((m) => m.id === userId);
          return {
            formData: {
              ...state.formData,
              mentors: state.formData.mentors.filter((m) => m.id !== userId),
              mentorEmails: mentor
                ? state.formData.mentorEmails.filter(
                    (e) => e !== mentor.email,
                  )
                : state.formData.mentorEmails,
            },
          };
        }),
    }),
    {
      name: "sfa-collaboration-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

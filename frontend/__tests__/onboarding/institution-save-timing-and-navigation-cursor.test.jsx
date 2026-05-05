import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import OnboardingStep3 from "@/components/onboarding/OnboardingStep3";
import OnboardingStep1 from "@/components/onboarding/OnboardingStep1";
import OnboardingStep2 from "@/components/onboarding/OnboardingStep2";
import OnboardingStep4 from "@/components/onboarding/OnboardingStep4";
import OnboardingStep5 from "@/components/onboarding/OnboardingStep5";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { updateUserProfile } from "@/lib/strapi";

// Mock dependencies
jest.mock("next-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({ locale: "en", push: jest.fn() })),
}));

jest.mock("@/lib/strapi", () => ({
  updateUserProfile: jest.fn().mockResolvedValue({ success: true }),
  fetchLocalized: jest.fn().mockResolvedValue({ data: [] }),
}));

jest.mock("@/lib/auth-store", () => ({
  useAuthStore: jest.fn(() => ({
    jwt: "mock-jwt",
    updateUser: jest.fn(),
  })),
}));

describe("QA-046 Onboarding UX Refinement", () => {
  beforeEach(() => {
    useOnboardingStore.getState().resetStore();
    jest.clearAllMocks();
  });

  describe("Step 3 Institution Sync", () => {
    it("calls updateUserProfile when Confirm is clicked in Step 3", async () => {
      // Setup store state for valid Step 3
      act(() => {
        useOnboardingStore.getState().updateFormData({
          educationLevel: "Doctorate (PhD)",
          educationInstitution: { id: null, name: "New Test Uni" },
        });
      });

      render(<OnboardingStep3 />);

      const confirmBtn = screen.getByRole("button", {
        name: /steps\.confirm/i,
      });
      expect(confirmBtn).toBeEnabled();

      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(updateUserProfile).toHaveBeenCalled();
      });
    });
  });

  describe("Button Cursor UI", () => {
    const steps = [
      { Component: OnboardingStep1, buttons: ["steps.skip"] },
      { Component: OnboardingStep2, buttons: ["steps.back", "steps.skip"] },
      { Component: OnboardingStep3, buttons: ["steps.back", "steps.skip"] },
      { Component: OnboardingStep4, buttons: ["steps.back", "steps.skip"] },
      { Component: OnboardingStep5, buttons: ["steps.back"] },
    ];

    steps.forEach(({ Component, buttons }) => {
      it(`adds cursor-pointer class to navigation buttons in ${Component.name}`, () => {
        render(<Component />);
        buttons.forEach((btnKey) => {
          const btn = screen.getByRole("button", {
            name: new RegExp(btnKey, "i"),
          });
          expect(btn).toHaveClass("cursor-pointer");
        });
      });
    });
  });
});

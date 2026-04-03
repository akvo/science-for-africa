import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OnboardingStep1 from "@/components/onboarding/OnboardingStep1";
import OnboardingStep5 from "@/components/onboarding/OnboardingStep5";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { fetchFromStrapi } from "@/lib/strapi";

// Mock dependencies
jest.mock("@/lib/auth-store", () => ({
  useAuthStore: jest.fn(() => ({
    jwt: "mock-jwt",
    updateUser: jest.fn(),
  })),
}));

jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock("@/lib/strapi", () => ({
  fetchFromStrapi: jest.fn().mockResolvedValue({ data: [] }),
  updateUserProfile: jest.fn().mockResolvedValue({ success: true }),
}));

describe("Institution Search Optimization", () => {
  beforeEach(() => {
    const { resetStore } = useOnboardingStore.getState();
    resetStore();
    jest.clearAllMocks();
  });

  describe("OnboardingStep1 - Institutional Path", () => {
    it("encodes search terms with spaces correctly", async () => {
      useOnboardingStore.getState().setUserType("institution");
      render(<OnboardingStep1 />);

      const input = screen.getByPlaceholderText(/Type your institution name/i);

      // Simulate typing a name with spaces
      fireEvent.change(input, { target: { value: "Univ of Nairobi" } });

      await waitFor(() => {
        // This will FAIL initially if encodeURIComponent is not used
        expect(fetchFromStrapi).toHaveBeenCalledWith(
          expect.stringContaining("Univ%20of%20Nairobi"),
        );
      });
    });

    it("triggers search for 3-character substrings", async () => {
      useOnboardingStore.getState().setUserType("institution");
      render(<OnboardingStep1 />);

      const input = screen.getByPlaceholderText(/Type your institution name/i);

      fireEvent.change(input, { target: { value: "nai" } });

      await waitFor(() => {
        expect(fetchFromStrapi).toHaveBeenCalledWith(
          expect.stringContaining("filters[name][$containsi]=nai"),
        );
      });
    });
  });

  describe("OnboardingStep5 - Individual Path (Affiliation)", () => {
    it("encodes search terms with spaces correctly in Step 5", async () => {
      render(<OnboardingStep5 />);

      const input = screen.getByPlaceholderText(
        /Type your primary institution/i,
      );

      fireEvent.change(input, { target: { value: "Oxford Uni" } });

      await waitFor(() => {
        expect(fetchFromStrapi).toHaveBeenCalledWith(
          expect.stringContaining("Oxford%20Uni"),
        );
      });
    });
  });
});

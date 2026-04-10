import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import OnboardingStep1 from "@/components/onboarding/OnboardingStep1";
import OnboardingStep5 from "@/components/onboarding/OnboardingStep5";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { fetchFromStrapi } from "@/lib/strapi";

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => (options?.email ? options.email : key),
  }),
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => (options?.email ? options.email : key),
  }),
}));

// Mock store
const mockSetUserType = jest.fn();
const mockUpdateFormData = jest.fn();
const mockPrevStep = jest.fn();
const mockResetStore = jest.fn();

jest.mock("@/lib/onboarding-store", () => ({
  useOnboardingStore: jest.fn(),
}));

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
    jest.clearAllMocks();
  });

  describe("OnboardingStep1 - Institutional Path", () => {
    it("encodes search terms with spaces correctly", async () => {
      useOnboardingStore.mockReturnValue({
        userType: "institution",
        setUserType: mockSetUserType,
        institutions: [],
        setInstitutions: jest.fn(),
        setSelectedInstitution: jest.fn(),
        formData: {},
        updateFormData: mockUpdateFormData,
      });

      render(<OnboardingStep1 />);

      const input = screen.getByPlaceholderText(/step1\.institution_placeholder/i);

      // Simulate typing a name with spaces
      fireEvent.change(input, { target: { value: "Univ of Nairobi" } });

      await waitFor(() => {
        expect(fetchFromStrapi).toHaveBeenCalledWith(
          expect.stringContaining("Univ%20of%20Nairobi"),
        );
      });
    });

    it("triggers search for 3-character substrings", async () => {
      useOnboardingStore.mockReturnValue({
        userType: "institution",
        setUserType: mockSetUserType,
        institutions: [],
        setInstitutions: jest.fn(),
        setSelectedInstitution: jest.fn(),
        formData: {},
        updateFormData: mockUpdateFormData,
      });

      render(<OnboardingStep1 />);

      const input = screen.getByPlaceholderText(/step1\.institution_placeholder/i);

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
      useOnboardingStore.mockReturnValue({
        formData: { affiliationInstitution: { name: "" } },
        updateFormData: mockUpdateFormData,
        prevStep: mockPrevStep,
        userType: "individual",
        resetStore: mockResetStore,
      });
      
      render(<OnboardingStep5 />);

      const input = screen.getByPlaceholderText(/step5\.search_placeholder/i);

      fireEvent.change(input, { target: { value: "Oxford Uni" } });

      await waitFor(() => {
        expect(fetchFromStrapi).toHaveBeenCalledWith(
          expect.stringContaining("Oxford%20Uni"),
        );
      });
    });
  });
});

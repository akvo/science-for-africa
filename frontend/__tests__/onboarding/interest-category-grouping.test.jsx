import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import OnboardingStep2 from "@/components/onboarding/OnboardingStep2";
import { useOnboardingStore } from "@/lib/onboarding-store";
import { fetchLocalized } from "@/lib/strapi";

// Mock next-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({
    locale: "en",
    push: jest.fn(),
  })),
}));

// Mock onboarding store
jest.mock("@/lib/onboarding-store", () => ({
  useOnboardingStore: jest.fn(),
}));

// Mock strapi lib
jest.mock("@/lib/strapi", () => ({
  fetchLocalized: jest.fn(),
  updateUserProfile: jest.fn(),
}));

// Mock auth store
jest.mock("@/lib/auth-store", () => ({
  useAuthStore: jest.fn(() => ({
    jwt: "mock-jwt",
    updateUser: jest.fn(),
  })),
}));

describe("OnboardingStep2 - Interest Grouping", () => {
  beforeEach(() => {
    useOnboardingStore.mockReturnValue({
      formData: { interests: [] },
      toggleInterest: jest.fn(),
      nextStep: jest.fn(),
      prevStep: jest.fn(),
      skipStep: jest.fn(),
      userType: "individual",
      resetStore: jest.fn(),
    });
  });

  it("should group interests by category name from the populated relation", async () => {
    const mockData = {
      data: [
        {
          name: "Bioinformatics",
          interestCategory: { name: "Popular" },
        },
        {
          name: "Genetics",
          interestCategory: { name: "Popular" },
        },
        {
          name: "Climate Change",
          interestCategory: { name: "Environmental" },
        },
      ],
    };

    fetchLocalized.mockResolvedValue(mockData);

    render(<OnboardingStep2 />);

    // Check if category headers are rendered
    await waitFor(() => {
      expect(screen.getByText("Popular")).toBeInTheDocument();
      expect(screen.getByText("Environmental")).toBeInTheDocument();
    });

    // Check if interests are under correct headers
    // Note: In the component, they are just rendered in sequence, but grouped in categories state
    expect(screen.getByText("Bioinformatics")).toBeInTheDocument();
    expect(screen.getByText("Genetics")).toBeInTheDocument();
    expect(screen.getByText("Climate Change")).toBeInTheDocument();
  });

  it("should handle missing interestCategory by falling back to 'Uncategorized'", async () => {
    const mockData = {
      data: [
        {
          name: "Shadow Science",
          interestCategory: null,
        },
      ],
    };

    fetchLocalized.mockResolvedValue(mockData);

    render(<OnboardingStep2 />);

    await waitFor(() => {
      expect(screen.getByText("Uncategorized")).toBeInTheDocument();
    });
    expect(screen.getByText("Shadow Science")).toBeInTheDocument();
  });

  it("skips interests belonging to inactive categories", async () => {
    const mockData = {
      data: [
        {
          name: "Active Interest",
          interestCategory: { name: "Active Cat", isActive: true },
        },
        {
          name: "Inactive Interest",
          interestCategory: { name: "Inactive Cat", isActive: false },
        },
        {
          name: "Uncategorized Interest",
          interestCategory: null,
        },
      ],
    };

    fetchLocalized.mockResolvedValue(mockData);

    render(<OnboardingStep2 />);

    await waitFor(() => {
      expect(screen.queryByText("Active Cat")).toBeInTheDocument();
    });

    expect(screen.getByText("Active Interest")).toBeInTheDocument();
    expect(screen.getByText("Uncategorized")).toBeInTheDocument();
    expect(screen.getByText("Uncategorized Interest")).toBeInTheDocument();

    // Inactive category should NOT be visible
    expect(screen.queryByText("Inactive Cat")).not.toBeInTheDocument();
    expect(screen.queryByText("Inactive Interest")).not.toBeInTheDocument();
  });

  it("skips individual interests that are marked as inactive", async () => {
    const mockData = {
      data: [
        {
          name: "Active Interest",
          isActive: true,
          interestCategory: { name: "Test Cat", isActive: true },
        },
        {
          name: "Inactive Interest",
          isActive: false,
          interestCategory: { name: "Test Cat", isActive: true },
        },
      ],
    };

    fetchLocalized.mockResolvedValue(mockData);

    render(<OnboardingStep2 />);

    await waitFor(() => {
      expect(screen.getByText("Active Interest")).toBeInTheDocument();
    });

    // Inactive interest should NOT be visible
    expect(screen.queryByText("Inactive Interest")).not.toBeInTheDocument();
  });
});

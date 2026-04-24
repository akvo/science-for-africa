import React from "react";
import { render, screen, act } from "@testing-library/react";
import OnboardingPage from "../../pages/onboarding/index";
import { useOnboardingStore } from "../../lib/onboarding-store";

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock router
jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    pathname: "/onboarding",
    query: {},
  })),
}));

// Mock Auth Store
jest.mock("@/lib/auth-store", () => ({
  useAuthStore: jest.fn(() => ({
    jwt: "mock-jwt",
    isAuthenticated: true,
    user: { id: 1, onboardingComplete: false },
    updateUser: jest.fn(),
  })),
}));

// Mock Strapi
jest.mock("@/lib/strapi", () => ({
  fetchLocalized: jest.fn().mockResolvedValue({ data: [] }),
}));

describe("Onboarding Back Button Visibility", () => {
  beforeEach(() => {
    const { resetStore } = useOnboardingStore.getState();
    act(() => {
      resetStore();
    });
  });

  it("should NOT show the Back button on Step 1", () => {
    render(<OnboardingPage />);
    const backButton = screen.queryByRole("button", { name: /steps\.back/i });
    expect(backButton).not.toBeInTheDocument();
  });

  it("should show the Back button on Step 2", async () => {
    const { setStep } = useOnboardingStore.getState();
    act(() => {
      setStep(2);
    });

    render(<OnboardingPage />);
    const backButton = await screen.findByRole("button", {
      name: /steps\.back/i,
    });
    expect(backButton).toBeInTheDocument();
  });
});

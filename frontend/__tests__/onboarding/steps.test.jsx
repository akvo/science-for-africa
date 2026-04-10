import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
} from "@testing-library/react";
import OnboardingPage from "../../pages/onboarding/index";
import { useOnboardingStore } from "../../lib/onboarding-store";
import OnboardingStep2 from "@/components/onboarding/OnboardingStep2";
import OnboardingStep3 from "@/components/onboarding/OnboardingStep3";
import OnboardingStep4 from "@/components/onboarding/OnboardingStep4";
import OnboardingStep5 from "@/components/onboarding/OnboardingStep5";
import { updateUserProfile } from "@/lib/strapi";
import { useAuthStore } from "@/lib/auth-store";

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

// Mock auth store
jest.mock("@/lib/auth-store", () => ({
  useAuthStore: jest.fn(() => ({
    jwt: "mock-jwt",
    isAuthenticated: true,
    user: { id: 1, onboardingComplete: false },
    setAuth: jest.fn(),
    updateUser: jest.fn(),
  })),
}));

// Mock router
jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    pathname: "/onboarding",
    query: {},
  })),
}));

// Mock layout
jest.mock("../../components/layout/AuthLayout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="auth-layout">{children}</div>,
}));

// Mock strapi lib
jest.mock("@/lib/strapi", () => ({
  updateUserProfile: jest.fn().mockResolvedValue({ success: true }),
  fetchFromStrapi: jest.fn().mockImplementation((endpoint) => {
    if (endpoint.includes("/interests")) {
      return Promise.resolve({
        data: [
          { name: "Bioinformatics", category: "Popular" },
          { name: "Genetics", category: "Popular" },
          { name: "Virology", category: "Popular" },
          { name: "Ecology", category: "Popular" },
          { name: "Immunology", category: "Popular" },
          { name: "Sustainability", category: "Popular" },
        ],
      });
    }
    if (endpoint.includes("/institutions")) {
      return Promise.resolve({
        data: [{ id: 51, name: "Science Foundation" }],
      });
    }
    return Promise.resolve({ data: [] });
  }),
}));

describe("Onboarding Flow - Steps 1, 2, 3, 4 & 5", () => {
  beforeEach(() => {
    // Reset store before each test
    const { resetStore } = useOnboardingStore.getState();
    act(() => {
      resetStore();
    });
    jest.clearAllMocks();
  });

  it("renders Step 1 (Account Type Selection) by default", () => {
    render(<OnboardingPage />);
    expect(
      screen.getByRole("heading", {
        name: /step1\.title/i,
      }),
    ).toBeInTheDocument();
  });

  it("allows selecting 'Individual' and selecting a role type", async () => {
    render(<OnboardingPage />);

    // Step 1: Individual should be selected by default or clickable
    const { setUserType, updateFormData } = useOnboardingStore.getState();
    act(() => {
      setUserType("individual");
    });

    // Should see role type selector
    const roleSelectTrigger = screen.getByRole("combobox");
    fireEvent.click(roleSelectTrigger);

    // In Radix Select, items are often in a portal
    // For now, let's just manually call the store update to simulate selection
    act(() => {
      updateFormData({ roleType: "Researcher" });
    });

    const confirmBtn = screen.getByRole("button", { name: /steps\.confirm/i });
    await waitFor(() => {
      expect(confirmBtn).not.toBeDisabled();
    });
    fireEvent.click(confirmBtn);

    // Should advance to Step 2
    expect(await screen.findByText(/step2\.title/i)).toBeInTheDocument();
  }, 10000);

  it("handles 'Skip' on Step 1 correctly", async () => {
    render(<OnboardingPage />);

    const skipBtn = screen.getByRole("button", { name: /steps\.skip/i });
    fireEvent.click(skipBtn);

    // Should advance to Step 2
    expect(await screen.findByText(/step2\.title/i)).toBeInTheDocument();
  });

  it("enforces max 5 interests in Step 2", async () => {
    // Advance to Step 2
    const { setStep } = useOnboardingStore.getState();
    act(() => {
      setStep(2);
    });

    render(<OnboardingPage />);

    // Wait for dynamic data
    await screen.findByText("Bioinformatics");

    // Find tags
    const tags = [
      "Bioinformatics",
      "Genetics",
      "Virology",
      "Ecology",
      "Immunology",
      "Sustainability",
    ];

    // Click 6 tags
    for (const tag of tags) {
      const tagBtn = screen.getByText(tag);
      fireEvent.click(tagBtn);
    }

    // Interests in store should be 5
    const { formData } = useOnboardingStore.getState();
    expect(formData.interests.length).toBe(5);
  });

  it("enables 'Confirm' button in Step 2 only after at least 1 interest is selected", async () => {
    act(() => {
      useOnboardingStore.getState().setStep(2);
    });
    render(<OnboardingPage />);

    // Wait for dynamic data
    await screen.findByText("Bioinformatics");

    const confirmBtn = screen.getByText(
      /steps\.confirm|step5\.complete_button/i,
    );
    expect(confirmBtn).toBeDisabled();

    // Select 1 tag
    fireEvent.click(screen.getByText(/Bioinformatics/i));

    expect(confirmBtn).not.toBeDisabled();
  });

  test("renders Step 3 (Education & Career) and handles input", async () => {
    act(() => {
      useOnboardingStore.getState().setStep(3);
      useOnboardingStore
        .getState()
        .updateFormData({ educationInstitution: "" });
    });

    const { getByText, getByPlaceholderText, findByText } = render(
      <OnboardingStep3 />,
    );

    expect(getByText(/step3\.title/i)).toBeInTheDocument();

    const input = getByPlaceholderText(/step3\.institution_placeholder/i);

    // Simulate typing to trigger search
    fireEvent.change(input, { target: { value: "Scien" } });

    // Wait for dropdown result
    const option = await findByText("Science Foundation");
    fireEvent.click(option);

    expect(useOnboardingStore.getState().formData.educationInstitution).toEqual(
      {
        id: 51,
        name: "Science Foundation",
      },
    );
  });

  test("enables 'Confirm' button in Step 3 only after required fields are filled", () => {
    act(() => {
      useOnboardingStore.getState().setStep(3);
      useOnboardingStore.getState().updateFormData({
        educationLevel: "",
        educationInstitution: "",
      });
    });

    const { getByRole } = render(<OnboardingStep3 />);
    const confirmBtn = getByRole("button", { name: /steps\.confirm/i });
    expect(confirmBtn).toBeDisabled();

    // Fill fields via store to simulate Select + Input
    act(() => {
      useOnboardingStore.getState().updateFormData({
        educationLevel: "Doctorate (PhD)",
        educationInstitution: "MIT",
      });
    });

    cleanup();
    const { getByRole: getByRoleAfter } = render(<OnboardingStep3 />);
    expect(getByRoleAfter("button", { name: /steps\.confirm/i })).toBeEnabled();
  });

  test("renders Step 4 (ORCID) and handles input", async () => {
    act(() => {
      useOnboardingStore.getState().setStep(4);
    });
    const { getByPlaceholderText, getByRole } = render(<OnboardingStep4 />);

    expect(getByRole("heading", { name: /step4\.title/i })).toBeInTheDocument();

    const input = getByPlaceholderText(/step4\.orcid_placeholder/i);
    fireEvent.change(input, { target: { value: "0000-0002-1825-0097" } });

    expect(useOnboardingStore.getState().formData.orcidId).toBe(
      "0000-0002-1825-0097",
    );

    const confirmBtn = getByRole("button", { name: /steps\.confirm/i });
    fireEvent.click(confirmBtn);

    expect(useOnboardingStore.getState().step).toBe(5);
  });

  test("institutions skip Step 3 and 4", () => {
    // Start at Step 2 as an institution
    act(() => {
      useOnboardingStore.getState().setUserType("institution");
      useOnboardingStore.getState().setStep(2);
    });

    // Call nextStep - should jump to 6 (Finish)
    act(() => {
      useOnboardingStore.getState().nextStep();
    });

    expect(useOnboardingStore.getState().step).toBe(6);
  });

  test("renders Step 5 (Affiliation) and handles completion", async () => {
    act(() => {
      useOnboardingStore.getState().setStep(5);
    });
    const { getByPlaceholderText, getByRole, findByText } = render(
      <OnboardingStep5 />,
    );

    expect(getByRole("heading", { name: /step5\.title/i })).toBeInTheDocument();

    const input = getByPlaceholderText(/step5\.search_placeholder/i);

    // Simulate typing to trigger search
    fireEvent.change(input, { target: { value: "Scien" } });

    // Wait for dropdown result
    const option = await findByText("Science Foundation");
    fireEvent.click(option);

    expect(
      useOnboardingStore.getState().formData.affiliationInstitution,
    ).toEqual({
      id: 51,
      name: "Science Foundation",
    });

    const completeBtn = screen.getByText(/step5\.complete_button/i);
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalled();
      // Verify store is reset (PII purged)
      expect(useOnboardingStore.getState().formData.roleType).toBe("");
      expect(useOnboardingStore.getState().step).toBe(1);
    });
  });
});

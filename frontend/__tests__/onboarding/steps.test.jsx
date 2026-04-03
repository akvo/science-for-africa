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
    act(() => {
      useOnboardingStore.getState().resetStore();
    });
    jest.clearAllMocks();
  });

  it("renders Step 1 (Account Type Selection) by default", () => {
    render(<OnboardingPage />);
    expect(
      screen.getByRole("heading", {
        name: /What kind of account you'd like to create\?/i,
      }),
    ).toBeInTheDocument();
  });

  it("allows selecting 'Individual' and selecting a role type", async () => {
    render(<OnboardingPage />);

    // Step 1: Individual should be selected by default or clickable
    act(() => {
      useOnboardingStore.getState().setUserType("individual");
    });

    // Should see role type selector

    const roleSelectTrigger = screen.getByRole("combobox");
    fireEvent.click(roleSelectTrigger);

    // In Radix Select, items are often in a portal
    // For now, let's just manually call the store update to simulate selection
    act(() => {
      useOnboardingStore.getState().updateFormData({ roleType: "Researcher" });
    });

    const confirmBtn = screen.getByRole("button", { name: /Confirm/i });
    await waitFor(() => {
      expect(confirmBtn).not.toBeDisabled();
    });
    fireEvent.click(confirmBtn);

    // Should advance to Step 2
    expect(
      await screen.findByText(/Interests and expertise/i),
    ).toBeInTheDocument();
  });

  it("handles 'Skip' on Step 1 correctly", async () => {
    render(<OnboardingPage />);

    const skipBtn = screen.getByRole("button", { name: /Skip/i });
    fireEvent.click(skipBtn);

    // Should advance to Step 2
    expect(
      await screen.findByText(/Interests and expertise/i),
    ).toBeInTheDocument();
  });

  it("enforces max 5 interests in Step 2", async () => {
    // Advance to Step 2
    act(() => {
      useOnboardingStore.getState().setStep(2);
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

    const confirmBtn = screen.getByText(/Confirm|Complete Setup/i);
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

    expect(getByText(/Education and career/i)).toBeInTheDocument();

    const input = getByPlaceholderText(/Search or type your university/i);

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
    const confirmBtn = getByRole("button", { name: /Confirm/i });
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
    expect(getByRoleAfter("button", { name: /Confirm/i })).toBeEnabled();
  });

  test("renders Step 4 (ORCID) and handles input", async () => {
    act(() => {
      useOnboardingStore.getState().setStep(4);
    });
    const { getByPlaceholderText, getByRole } = render(<OnboardingStep4 />);

    expect(
      getByRole("heading", { name: /Do you have ORCID\?/i }),
    ).toBeInTheDocument();

    const input = getByPlaceholderText("0000-0000-0000-0000");
    fireEvent.change(input, { target: { value: "0000-0002-1825-0097" } });

    expect(useOnboardingStore.getState().formData.orcidId).toBe(
      "0000-0002-1825-0097",
    );

    const confirmBtn = getByRole("button", { name: /Confirm/i });
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

    expect(
      getByRole("heading", { name: /Current affiliation/i }),
    ).toBeInTheDocument();

    const input = getByPlaceholderText(/Type your primary institution/i);

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

    const completeBtn = screen.getByText(/Complete Setup/i);
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalled();
      // Verify store is reset (PII purged)
      expect(useOnboardingStore.getState().formData.roleType).toBe("");
      expect(useOnboardingStore.getState().step).toBe(1);
    });
  });
});

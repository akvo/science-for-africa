import React from "react";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import OnboardingPage from "../../pages/onboarding/index";
import { useOnboardingStore } from "../../lib/onboarding-store";
import OnboardingStep2 from "@/components/onboarding/OnboardingStep2";
import OnboardingStep3 from "@/components/onboarding/OnboardingStep3";
import OnboardingStep4 from "@/components/onboarding/OnboardingStep4";
import OnboardingStep5 from "@/components/onboarding/OnboardingStep5";
import { updateUserProfile } from "@/lib/strapi";

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
}));

describe("Onboarding Flow - Steps 1, 2, 3, 4 & 5", () => {
  beforeEach(() => {
    // Reset store before each test
    const { resetStore } = useOnboardingStore.getState();
    resetStore();
    jest.clearAllMocks();
  });

  it("renders Step 1 (Account Type Selection) by default", () => {
    render(<OnboardingPage />);
    expect(
      screen.getByRole("heading", { name: /What kind of account you'd like to create\?/i }),
    ).toBeInTheDocument();
  });

  it("allows selecting 'Individual' and selecting a role type", async () => {
    render(<OnboardingPage />);

    // Step 1: Individual should be selected by default or clickable
    const { setUserType, updateFormData } = useOnboardingStore.getState();
    setUserType("individual");

    // Should see role type selector

    const roleSelectTrigger = screen.getByRole("combobox");
    fireEvent.click(roleSelectTrigger);

    // In Radix Select, items are often in a portal
    // For now, let's just manually call the store update to simulate selection
    updateFormData({ roleType: "Researcher" });

    const confirmBtn = screen.getByRole("button", { name: /Confirm/i });
    await waitFor(() => {
      expect(confirmBtn).not.toBeDisabled();
    });
    fireEvent.click(confirmBtn);

    // Should advance to Step 2
    expect(
      await screen.findByText(/Expertise & Interests/i),
    ).toBeInTheDocument();
  });

  it("handles 'Skip' on Step 1 correctly", async () => {
    render(<OnboardingPage />);

    const skipBtn = screen.getByRole("button", { name: /Skip/i });
    fireEvent.click(skipBtn);

    // Should advance to Step 2
    expect(
      await screen.findByText(/Expertise & Interests/i),
    ).toBeInTheDocument();
  });

  it("enforces max 5 interests in Step 2", async () => {
    // Advance to Step 2
    const { setStep } = useOnboardingStore.getState();
    setStep(2);

    render(<OnboardingPage />);

    expect(screen.getByText(/Expertise & Interests/i)).toBeInTheDocument();

    // Find tags (assuming they have specific text or labels)
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
    expect(formData.interests).not.toContain("Chemistry");
  });

  it("enables 'Confirm' button in Step 2 only after at least 1 interest is selected", async () => {
    useOnboardingStore.getState().setStep(2);
    render(<OnboardingPage />);

    const confirmBtn = screen.getByRole("button", { name: /Confirm/i });
    expect(confirmBtn).toBeDisabled();

    // Select 1 tag
    fireEvent.click(screen.getByText(/Bioinformatics/i));

    expect(confirmBtn).not.toBeDisabled();
  });

  test("renders Step 3 (Education & Career) and handles input", () => {
    useOnboardingStore.getState().setStep(3);
    const { getByText, getByPlaceholderText } = render(
      <OnboardingStep3 />,
    );

    expect(getByText(/Education and career/i)).toBeInTheDocument();
    
    // Use a more specific selector for the label
    const labels = screen.getAllByText(/Education level/i);
    expect(labels.length).toBeGreaterThanOrEqual(1);

    const input = getByPlaceholderText(/Type your institution name/i);

    fireEvent.change(input, { target: { value: "Harvard University" } });

    // Note: Select component testing in RTL/shadcn can be tricky,
    // usually requires looking for the trigger or mocking Select.
    // For now, we verify the input change affects the store.
    expect(useOnboardingStore.getState().formData.educationInstitution).toBe(
      "Harvard University",
    );
  });

  test("enables 'Confirm' button in Step 3 only after required fields are filled", () => {
    useOnboardingStore.getState().setStep(3);
    useOnboardingStore.getState().updateFormData({
      educationLevel: "",
      educationInstitution: "",
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

  test("renders Step 4 (ORCID) and handles connect", async () => {
    useOnboardingStore.getState().setStep(4);
    const { getByText, getByRole } = render(<OnboardingStep4 />);

    expect(getByRole("heading", { name: /Connect ORCID/i })).toBeInTheDocument();
    
    // Select the button specifically. It includes the image alt text "ORCID iD"
    const connectBtn = getByRole("button", { name: /Connect ORCID/i });
    fireEvent.click(connectBtn);


    // Wait for mock connect timeout
    await waitFor(() => {
      expect(useOnboardingStore.getState().formData.orcidId).toBeTruthy();
    }, { timeout: 1000 });
  });

  test("institutions skip Step 3 and 4", () => {
    // Start at Step 2 as an institution
    act(() => {
      useOnboardingStore.getState().setUserType("institution");
      useOnboardingStore.getState().setStep(2);
    });

    // Call nextStep - should jump to 5
    act(() => {
        useOnboardingStore.getState().nextStep();
    });

    expect(useOnboardingStore.getState().step).toBe(5);
  });

  test("renders Step 5 (Affiliation) and handles completion", async () => {
    useOnboardingStore.getState().setStep(5);
    const { getByText, getByPlaceholderText, getByRole } = render(<OnboardingStep5 />);

    expect(getByRole("heading", { name: /Institutional affiliation/i })).toBeInTheDocument();
    
    const input = getByPlaceholderText(/Type your primary institution/i);

    fireEvent.change(input, { target: { value: "Science Foundation" } });

    const completeBtn = getByRole("button", { name: /Complete Onboarding/i });
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(updateUserProfile).toHaveBeenCalled();
    });
  });
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { useRouter } from "next/router";

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock lib/strapi
jest.mock("@/lib/strapi", () => ({
  forgotPassword: jest.fn(),
}));

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

describe("ForgotPasswordForm", () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  it("renders correctly with initial state", () => {
    render(<ForgotPasswordForm />);
    expect(
      screen.getByRole("heading", { name: /forgot_password\.title/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/forgot_password\.email_label/i),
    ).toBeInTheDocument();

    const submitButton = screen.getByRole("button", {
      name: /forgot_password\.button/i,
    });
    expect(submitButton).toBeDisabled();
    // Styling check for disabled state
    expect(submitButton).toHaveClass("bg-primary-50");
  });

  it("enables the button when email is present", async () => {
    render(<ForgotPasswordForm />);
    const emailInput = screen.getByLabelText(/forgot_password\.email_label/i);
    const submitButton = screen.getByRole("button", {
      name: /forgot_password\.button/i,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveClass("bg-primary-500");
  });

  it("shows success message and dynamic email on submission", async () => {
    const { forgotPassword } = require("@/lib/strapi");
    forgotPassword.mockResolvedValue({ ok: true });

    render(<ForgotPasswordForm />);
    const emailInput = screen.getByLabelText(/forgot_password\.email_label/i);
    const submitButton = screen.getByRole("button", {
      name: /forgot_password\.button/i,
    });

    fireEvent.change(emailInput, { target: { value: "galih@akvo.org" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/forgot_password\.success_title/i),
      ).toBeInTheDocument();
      // Check for the bold teal email text
      const emailText = screen.getByText("galih@akvo.org");
      expect(emailText).toBeInTheDocument();
    });
  });

  it("navigates back to login", () => {
    render(<ForgotPasswordForm />);
    const backLink = screen.getByText(/navbar\.back/i);
    expect(backLink).toHaveAttribute("href", "/login");
  });
});

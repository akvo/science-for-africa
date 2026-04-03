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
      screen.getByRole("heading", { name: /Reset password/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();

    const submitButton = screen.getByRole("button", {
      name: /Reset password/i,
    });
    expect(submitButton).toBeDisabled();
    // Styling check for disabled state
    expect(submitButton).toHaveClass("bg-primary-50");
  });

  it("enables the button when email is present", async () => {
    render(<ForgotPasswordForm />);
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole("button", {
      name: /Reset password/i,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveClass("bg-primary-500");
  });

  it("shows success message and dynamic email on submission", async () => {
    const { forgotPassword } = require("@/lib/strapi");
    forgotPassword.mockResolvedValue({ ok: true });

    render(<ForgotPasswordForm />);
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole("button", {
      name: /Reset password/i,
    });

    fireEvent.change(emailInput, { target: { value: "galih@akvo.org" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/We sent you an email to/i)).toBeInTheDocument();
      // Check for the bold teal email text
      const emailSpan = screen.getByText("galih@akvo.org");
      expect(emailSpan).toBeInTheDocument();
      expect(emailSpan).toHaveClass("text-brand-teal-600");
    });
  });

  it("navigates back to login", () => {
    render(<ForgotPasswordForm />);
    const backLink = screen.getByText(/Back/i);
    expect(backLink).toHaveAttribute("href", "/login");
  });
});

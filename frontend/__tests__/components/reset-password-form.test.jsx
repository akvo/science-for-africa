import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { useRouter } from "next/router";

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock lib/strapi
jest.mock("@/lib/strapi", () => ({
  resetPassword: jest.fn(),
}));

describe("ResetPasswordForm", () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      query: { code: "test-code" },
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  it("renders correctly with initial state", () => {
    render(<ResetPasswordForm />);
    // Title update from "Set new" to "Create new"
    expect(screen.getByText(/Create new password/i)).toBeInTheDocument();

    // Check initial button state (Submit text update to "Reset password")
    const submitButton = screen.getByRole("button", {
      name: /Reset password/i,
    });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass("bg-primary-50");
  });

  it("button remains disabled when only one field is filled", async () => {
    render(<ResetPasswordForm />);
    const passwordInput = screen.getByLabelText(/New password/i);
    const submitButton = screen.getByRole("button", {
      name: /Reset password/i,
    });

    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    expect(submitButton).toBeDisabled();
  });

  it("enables the button when both fields are present", async () => {
    render(<ResetPasswordForm />);
    const passwordInput = screen.getByLabelText(/New password/i);
    const confirmInput = screen.getByLabelText(/Confirm password/i);
    const submitButton = screen.getByRole("button", {
      name: /Reset password/i,
    });

    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmInput, { target: { value: "Password123!" } });

    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveClass("bg-primary-500");
  });

  it("shows success message on submission", async () => {
    const { resetPassword } = require("@/lib/strapi");
    resetPassword.mockResolvedValue({ id: 1 });

    render(<ResetPasswordForm />);
    const passwordInput = screen.getByLabelText(/New password/i);
    const confirmInput = screen.getByLabelText(/Confirm password/i);
    const submitButton = screen.getByRole("button", {
      name: /Reset password/i,
    });

    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmInput, { target: { value: "Password123!" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      // Current implementation shows "Password updated"
      expect(screen.getByText(/Password updated/i)).toBeInTheDocument();
    });
  });
});

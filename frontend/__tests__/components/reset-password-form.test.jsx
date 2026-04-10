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
    expect(screen.getByText(/reset_password\.title/i)).toBeInTheDocument();

    const submitButton = screen.getByRole("button", {
      name: /reset_password\.button/i,
    });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass("bg-primary-50");
  });

  it("button remains disabled when only one field is filled", async () => {
    render(<ResetPasswordForm />);
    const passwordInput = screen.getByLabelText(
      /reset_password\.password_label/i,
    );
    const submitButton = screen.getByRole("button", {
      name: /reset_password\.button/i,
    });

    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    expect(submitButton).toBeDisabled();
  });

  it("enables the button when both fields are present", async () => {
    render(<ResetPasswordForm />);
    const passwordInput = screen.getByLabelText(
      /reset_password\.password_label/i,
    );
    const confirmInput = screen.getByLabelText(
      /reset_password\.confirm_password_label/i,
    );
    const submitButton = screen.getByRole("button", {
      name: /reset_password\.button/i,
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
    const passwordInput = screen.getByLabelText(
      /reset_password\.password_label/i,
    );
    const confirmInput = screen.getByLabelText(
      /reset_password\.confirm_password_label/i,
    );
    const submitButton = screen.getByRole("button", {
      name: /reset_password\.button/i,
    });

    fireEvent.change(passwordInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmInput, { target: { value: "Password123!" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/reset_password\.success_title/i),
      ).toBeInTheDocument();
    });
  });
});

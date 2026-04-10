import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SignUpForm } from "@/components/auth/signup-form";
import { useRouter } from "next/router";

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock lib/strapi
jest.mock("@/lib/strapi", () => ({
  registerUser: jest.fn(),
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

describe("SignUpForm", () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<SignUpForm />);
    expect(
      screen.getByLabelText(/signup\.fullname_label/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/signup\.email_label/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^signup\.password_label$/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/signup\.confirm_password_label/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /signup\.button/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<SignUpForm />);
    fireEvent.click(screen.getByRole("button", { name: /signup\.button/i }));

    expect(
      await screen.findByText(/validation\.fullname_min/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/validation\.email_invalid/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/validation\.password_required/i),
    ).toBeInTheDocument();
  });

  it("shows error for password mismatch", async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/signup\.fullname_label/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/signup\.email_label/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^signup\.password_label$/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/signup\.confirm_password_label/i), {
      target: { value: "Different123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /signup\.button/i }));

    expect(
      await screen.findByText(/validation\.passwords_mismatch/i),
    ).toBeInTheDocument();
  });

  it("shows error for weak password", async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/^signup\.password_label$/i), {
      target: { value: "weak" },
    });
    fireEvent.click(screen.getByRole("button", { name: /signup\.button/i }));

    expect(
      await screen.findByText(/validation\.password_minLength/i),
    ).toBeInTheDocument();
  });

  it("redirects to verify-email on successful registration without JWT", async () => {
    const { registerUser } = require("@/lib/strapi");
    registerUser.mockResolvedValue({
      user: { id: 1, email: "john@example.com", username: "john@example.com" },
    });

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/signup\.fullname_label/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/signup\.email_label/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^signup\.password_label$/i), {
      target: { value: "Password123!" },
    });
    fireEvent.change(screen.getByLabelText(/signup\.confirm_password_label/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /signup\.button/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/auth/verify-email?email=john%40example.com",
      );
    });
  });
});

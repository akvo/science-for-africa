import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "../../components/auth/login-form";
import { loginUser } from "../../lib/strapi";
import { useRouter } from "next/router";
import { useAuthStore } from "../../lib/auth-store";

// Mock the router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock the strapi lib
jest.mock("../../lib/strapi", () => ({
  loginUser: jest.fn(),
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

// Mock the auth store
jest.mock("../../lib/auth-store", () => ({
  useAuthStore: Object.assign(jest.fn(), {
    getState: jest.fn(() => ({
      setAuth: jest.fn(),
    })),
  }),
}));

describe("LoginForm", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush,
      query: {},
    });
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<LoginForm />);
    expect(screen.getByText(/login\.title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/login\.email_label/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/login\.password_label/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login\.button/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /login\.button/i }));

    expect(
      await screen.findByText(/validation\.email_invalid/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/validation\.password_required/i),
    ).toBeInTheDocument();
  });

  it("submits the form successfully and redirects", async () => {
    loginUser.mockResolvedValue({
      jwt: "fake-jwt",
      user: { id: 1, email: "test@example.com", onboardingComplete: true },
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/login\.email_label/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/login\.password_label/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login\.button/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        identifier: "test@example.com",
        password: "Password123!",
      });
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("submits the form and redirects to /onboarding if not onboarded", async () => {
    loginUser.mockResolvedValue({
      jwt: "fake-jwt",
      user: { id: 1, email: "test@example.com", onboardingComplete: false },
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/login\.email_label/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/login\.password_label/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login\.button/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/onboarding");
    });
  });

  it("shows error message on failure", async () => {
    loginUser.mockResolvedValue({
      error: "Invalid identifier or password",
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/login\.email_label/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/login\.password_label/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login\.button/i }));

    expect(
      await screen.findByText(/Invalid identifier or password/i),
    ).toBeInTheDocument();
  });
});

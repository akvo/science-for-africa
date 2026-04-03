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
    expect(screen.getByText(/Log in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    expect(
      await screen.findByText(/Please enter a valid email address/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Password is required/i),
    ).toBeInTheDocument();
  });

  it("submits the form successfully and redirects", async () => {
    loginUser.mockResolvedValue({
      jwt: "fake-jwt",
      user: { id: 1, email: "test@example.com", onboardingComplete: true },
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

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

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/onboarding");
    });
  });

  it("handles 2FA redirection", async () => {
    loginUser.mockResolvedValue({
      requires2FA: true,
      email: "test@example.com",
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/auth/verify-2fa?email=test%40example.com",
      );
    });
  });

  it("shows error message on failure", async () => {
    loginUser.mockResolvedValue({
      error: "Invalid identifier or password",
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    expect(
      await screen.findByText(/Invalid identifier or password/i),
    ).toBeInTheDocument();
  });
});

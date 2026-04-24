import React from "react";
import { render, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";
import { useAuthStore } from "@/lib/auth-store";

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock useAuthStore
jest.mock("@/lib/auth-store", () => ({
  useAuthStore: jest.fn(),
}));

// Mock layout sub-components
jest.mock("@/components/layout/AppLayout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="app-layout">{children}</div>,
}));
jest.mock("@/components/layout/AuthLayout", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="auth-layout">{children}</div>,
}));
jest.mock("@/components/seo/Meta", () => ({
  __esModule: true,
  default: () => <div data-testid="meta" />,
}));

describe("MainLayout Navigation Guards", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({
      pathname: "/",
      push: mockPush,
      startsWith: (path) => "/".startsWith(path), // Simplified for tests
    });
  });

  it("should redirect unauthenticated users from /onboarding to /login", async () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });
    useRouter.mockReturnValue({
      pathname: "/onboarding",
      push: mockPush,
      startsWith: (path) => "/onboarding".startsWith(path),
    });

    render(
      <MainLayout>
        <div>Onboarding Page</div>
      </MainLayout>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("should redirect authenticated users who completed onboarding away from /onboarding to /", async () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { onboardingComplete: true },
    });
    useRouter.mockReturnValue({
      pathname: "/onboarding",
      push: mockPush,
      startsWith: (path) => "/onboarding".startsWith(path),
    });

    render(
      <MainLayout>
        <div>Onboarding Page</div>
      </MainLayout>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("should redirect authenticated users who NOT completed onboarding to /onboarding if on a private page", async () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { onboardingComplete: false },
    });
    useRouter.mockReturnValue({
      pathname: "/dashboard",
      push: mockPush,
      startsWith: (path) => "/dashboard".startsWith(path),
    });

    render(
      <MainLayout>
        <div>Dashboard</div>
      </MainLayout>,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/onboarding");
    });
  });

  it("should allow authenticated users who NOT completed onboarding to stay on /onboarding", async () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { onboardingComplete: false },
    });
    useRouter.mockReturnValue({
      pathname: "/onboarding",
      push: mockPush,
      startsWith: (path) => "/onboarding".startsWith(path),
    });

    render(
      <MainLayout>
        <div>Onboarding</div>
      </MainLayout>,
    );

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalledWith("/onboarding");
    });
  });
});

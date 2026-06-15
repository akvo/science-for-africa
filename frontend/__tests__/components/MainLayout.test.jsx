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
jest.mock("@/lib/auth-store", () => {
  const mockStore = jest.fn();
  mockStore.getState = jest.fn(() => ({
    isAuthenticated: false,
    user: null,
    updateLastActive: jest.fn(),
    logout: jest.fn(),
  }));
  return {
    useAuthStore: mockStore,
  };
});

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
    // Default mock behavior
    useAuthStore.mockImplementation((selector) => {
      const state = {
        isAuthenticated: false,
        user: null,
      };
      return selector ? selector(state) : state;
    });
    useAuthStore.getState = jest.fn(() => ({
      isAuthenticated: false,
      user: null,
      updateLastActive: jest.fn(),
      logout: jest.fn(),
    }));
  });

  const setupStoreMock = (authState) => {
    useAuthStore.mockImplementation((selector) => {
      return selector ? selector(authState) : authState;
    });
    useAuthStore.getState = jest.fn(() => ({
      ...authState,
      updateLastActive: jest.fn(),
      logout: jest.fn(),
    }));
  };

  it("should redirect unauthenticated users from /onboarding to /login", async () => {
    setupStoreMock({
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
    setupStoreMock({
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
    setupStoreMock({
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
    setupStoreMock({
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

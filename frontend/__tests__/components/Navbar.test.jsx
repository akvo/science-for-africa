import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navbar from "../../components/layout/Navbar";
import { useRouter } from "next/router";
import { useAuthStore } from "../../lib/auth-store";

// Mock the router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock the auth store
jest.mock("../../lib/auth-store", () => ({
  useAuthStore: jest.fn(),
}));

describe("Navbar Component (TDD)", () => {
  const mockPush = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush,
      pathname: "/",
    });
    jest.clearAllMocks();
  });

  it("renders correctly for an unauthenticated user", async () => {
    // Setup: Unauthenticated state
    useAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: mockLogout,
    });

    render(<Navbar />);

    // Expectations: Login and Sign up buttons are visible
    // Must wait for component to mount (asynchronous due to setMounted in useEffect)
    await waitFor(() => {
      expect(screen.getByText("navbar.login")).toBeInTheDocument();
      expect(screen.getByText("navbar.signup")).toBeInTheDocument();

      // Expectations: Authenticated-only actions are hidden
      expect(screen.queryByText("navbar.publish")).not.toBeInTheDocument();
      expect(screen.queryByTestId("avatar")).not.toBeInTheDocument();
    });
  });

  it("renders correctly for an authenticated user", async () => {
    // Setup: Authenticated state
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        username: "jdoe",
        fullName: "John Doe",
        email: "john@example.com",
      },
      logout: mockLogout,
    });

    render(<Navbar />);

    // Expectations: Login and Sign up buttons are hidden
    // Must wait for component to mount
    await waitFor(() => {
      expect(screen.queryByText("navbar.login")).not.toBeInTheDocument();
      expect(screen.queryByText("navbar.signup")).not.toBeInTheDocument();

      // Expectations: Authenticated actions are visible
      expect(screen.getByText("navbar.publish")).toBeInTheDocument();

      // Check for user initials in Avatar (using JD from "John Doe")
      expect(screen.getByText("JD")).toBeInTheDocument();
    });
  });

  it("executes logout logic correctly", async () => {
    // Setup: Authenticated state
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        username: "jdoe",
        fullName: "John Doe",
      },
      logout: mockLogout,
    });

    render(<Navbar />);

    // 1. Click the Avatar to open the dropdown
    // Wait for initials to appear before clicking
    await waitFor(() => {
      const avatar = screen.getByText("JD");
      fireEvent.click(avatar);
    });

    // 2. Verify new dropdown items are present
    expect(
      screen.getByText("navbar.profile_dropdown.details"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("navbar.profile_dropdown.communities"),
    ).toBeInTheDocument();
    expect(screen.getByText("navbar.profile_dropdown.faq")).toBeInTheDocument();

    // 3. Click the Sign out button (new key)
    const logoutBtn = screen.getByText("navbar.profile_dropdown.logout");
    fireEvent.click(logoutBtn);

    // 4. Verify store action and redirection
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("renders correctly for an authenticated user with no full name (uses username initials)", async () => {
    // Setup: Authenticated state with username fallback
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        username: "scientist_alpha",
        fullName: "",
      },
      logout: mockLogout,
    });

    render(<Navbar />);

    // Expecting initials from username: SC (first two chars of scientist_alpha)
    // Must wait for component to mount
    await waitFor(() => {
      expect(screen.getByText("SC")).toBeInTheDocument();
    });
  });
});

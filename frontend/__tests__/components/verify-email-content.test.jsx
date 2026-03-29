import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";

// Mock lib/strapi
jest.mock("@/lib/strapi", () => ({
  resendVerification: jest.fn(),
  verifyEmailToken: jest.fn(),
}));

// Mock next/router
const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("VerifyEmailContent", () => {
  const email = "test@example.com";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders with the correct email", () => {
    render(<VerifyEmailContent email={email} />);
    expect(screen.getByText(/confirm email/i)).toBeInTheDocument();
    expect(screen.getByText(email)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /resend verification email/i }),
    ).toBeInTheDocument();
  });

  it("starts countdown after successful resend", async () => {
    const { resendVerification } = require("@/lib/strapi");
    resendVerification.mockResolvedValueOnce({ success: true });
    render(<VerifyEmailContent email={email} />);

    const resendBtn = screen.getByRole("button", {
      name: /resend verification email/i,
    });
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/verification email resent successfully/i),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/resend link in 30s/i)).toBeInTheDocument();
    expect(resendBtn).toBeDisabled();

    // Fast-forward 10 seconds (1s at a time to allow useEffect to reschedule)
    for (let i = 0; i < 10; i++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    expect(screen.getByText(/resend link in 20s/i)).toBeInTheDocument();

    // Fast-forward to end (20 more seconds)
    for (let i = 0; i < 20; i++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    expect(screen.queryByText(/resend link in/i)).not.toBeInTheDocument();
    expect(resendBtn).not.toBeDisabled();
  });

  it("shows error if resend fails", async () => {
    const { resendVerification } = require("@/lib/strapi");
    resendVerification.mockResolvedValueOnce({ error: "Fail" });
    render(<VerifyEmailContent email={email} />);

    fireEvent.click(
      screen.getByRole("button", { name: /resend verification email/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/fail/i)).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /resend verification email/i }),
    ).not.toBeDisabled();
  });

  it("automatically verifies token when confirmation prop is provided", async () => {
    const { verifyEmailToken } = require("@/lib/strapi");
    verifyEmailToken.mockResolvedValueOnce({
      jwt: "fake-jwt",
      user: { id: 1 },
    });

    render(<VerifyEmailContent email={email} confirmation="test-token" />);

    expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/email verified successfully/i),
      ).toBeInTheDocument();
    });

    expect(verifyEmailToken).toHaveBeenCalledWith("test-token");

    // Check for countdown or immediate redirect
    expect(
      screen.getByText(/redirecting to login page in 3s/i),
    ).toBeInTheDocument();

    // Fast-forward 3 seconds for redirect (sequentially)
    for (let i = 0; i < 3; i++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("shows error when token verification fails", async () => {
    const { verifyEmailToken } = require("@/lib/strapi");
    verifyEmailToken.mockResolvedValueOnce({ error: "Invalid token" });

    render(<VerifyEmailContent email={email} confirmation="invalid-token" />);

    expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
      expect(
        screen.getByText(/The verification link was invalid or already used/i),
      ).toBeInTheDocument();
    });

    // Should show "Return to Login" button on failure
    expect(
      screen.getByRole("button", { name: /return to login/i }),
    ).toBeInTheDocument();
  });
});

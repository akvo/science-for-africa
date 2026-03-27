import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";
import { postToStrapi } from "@/lib/strapi";

// Mock lib/strapi
jest.mock("@/lib/strapi", () => ({
  resendVerification: jest.fn(),
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
    expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
    expect(screen.getByText(email)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /resend email/i })).toBeInTheDocument();
  });

  it("starts countdown after successful resend", async () => {
    const { resendVerification } = require("@/lib/strapi");
    resendVerification.mockResolvedValueOnce({ success: true });
    render(<VerifyEmailContent email={email} />);
    
    const resendBtn = screen.getByRole("button", { name: /resend email/i });
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(screen.getByText(/verification email resent successfully/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/resend in 30s/i)).toBeInTheDocument();
    expect(resendBtn).toBeDisabled();

    // Fast-forward 10 seconds (1s at a time to allow useEffect to reschedule)
    for (let i = 0; i < 10; i++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    expect(screen.getByText(/resend in 20s/i)).toBeInTheDocument();

    // Fast-forward to end (20 more seconds)
    for (let i = 0; i < 20; i++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    expect(screen.queryByText(/resend in/i)).not.toBeInTheDocument();
    expect(resendBtn).not.toBeDisabled();
  });

  it("shows error if resend fails", async () => {
    const { resendVerification } = require("@/lib/strapi");
    resendVerification.mockResolvedValueOnce(null);
    render(<VerifyEmailContent email={email} />);
    
    fireEvent.click(screen.getByRole("button", { name: /resend email/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to resend email/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /resend email/i })).not.toBeDisabled();
  });
});

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

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => {
      // Return email if provided for description check
      if (options?.email) return options.email;
      // Return key for everything else
      return key;
    },
  }),
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, options) => {
      if (options?.email) return options.email;
      return key;
    },
  }),
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
    expect(
      screen.getByText(/verify_email\.confirm_title/i),
    ).toBeInTheDocument();
    expect(screen.getByText(email)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /verify_email\.resend_button/i }),
    ).toBeInTheDocument();
  });

  it("starts countdown after successful resend", async () => {
    const { resendVerification } = require("@/lib/strapi");
    resendVerification.mockResolvedValueOnce({ success: true });
    render(<VerifyEmailContent email={email} />);

    const resendBtn = screen.getByRole("button", {
      name: /verify_email\.resend_button/i,
    });
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/verify_email\.resend_success/i),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/verify_email\.resend_countdown/i),
    ).toBeInTheDocument();
    expect(resendBtn).toBeDisabled();

    // Fast-forward 10 seconds (1s at a time to allow useEffect to reschedule)
    for (let i = 0; i < 10; i++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    expect(
      screen.getByText(/verify_email\.resend_countdown/i),
    ).toBeInTheDocument();

    // Fast-forward to end (20 more seconds)
    for (let i = 0; i < 20; i++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }
    expect(
      screen.queryByText(/verify_email\.resend_countdown/i),
    ).not.toBeInTheDocument();
    expect(resendBtn).not.toBeDisabled();
  });

  it("shows error if resend fails", async () => {
    const { resendVerification } = require("@/lib/strapi");
    resendVerification.mockResolvedValueOnce({ error: "Fail" });
    render(<VerifyEmailContent email={email} />);

    fireEvent.click(
      screen.getByRole("button", { name: /verify_email\.resend_button/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/fail/i)).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /verify_email\.resend_button/i }),
    ).not.toBeDisabled();
  });

  it("automatically verifies token when confirmation prop is provided", async () => {
    const { verifyEmailToken } = require("@/lib/strapi");
    verifyEmailToken.mockResolvedValueOnce({
      jwt: "fake-jwt",
      user: { id: 1 },
    });

    render(<VerifyEmailContent email={email} confirmation="test-token" />);

    expect(
      screen.getByText(/verify_email\.verifying_title/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/verify_email\.success_title/i),
      ).toBeInTheDocument();
    });

    expect(verifyEmailToken).toHaveBeenCalledWith("test-token");

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

    expect(
      screen.getByText(/verify_email\.verifying_title/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/verify_email\.failed_title/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/verify_email\.failed_link_invalid/i),
      ).toBeInTheDocument();
    });

    // Should show "Return to Login" button on failure
    expect(
      screen.getByRole("button", { name: /verify_email\.return_login/i }),
    ).toBeInTheDocument();
  });
});

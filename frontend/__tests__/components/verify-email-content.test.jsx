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
  resendOtp: jest.fn(),
  verifyEmailToken: jest.fn(),
  verifyOtp: jest.fn(),
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

  it("renders with the correct email and OTP form", () => {
    render(<VerifyEmailContent email={email} />);
    // When no confirmation token is present, it should render the OTP form
    // The OTP form has an 'otp.verify_title' heading
    expect(screen.getByText(/otp\.verify_title/i)).toBeInTheDocument();
    // Confirm the Link-based resend button is NOT present in OTP mode
    expect(
      screen.queryByText(/verify_email\.resend_button/i),
    ).not.toBeInTheDocument();
  });

  it("starts countdown after successful resend", async () => {
    const { resendOtp } = require("@/lib/strapi");
    resendOtp.mockResolvedValueOnce({ success: true });
    render(<VerifyEmailContent email={email} />);

    // In OTP mode, look for the 'otp.resend_button'
    const resendBtn = screen.getByText(/otp\.resend_button/i).closest("button");
    fireEvent.click(resendBtn);

    await waitFor(() => {
      // In OTP mode, check for 'otp.resend_in' which only shows when disabled (cooldown)
      expect(screen.getByText(/otp\.resend_in/i)).toBeInTheDocument();
    });

    // Fast-forward cooldown (60 seconds)
    for (let i = 0; i < 60; i++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    }

    expect(resendBtn).not.toBeDisabled();
  });

  it("shows error if resend fails", async () => {
    const { resendOtp } = require("@/lib/strapi");
    resendOtp.mockResolvedValueOnce({ error: { message: "Fail" } });
    render(<VerifyEmailContent email={email} />);

    fireEvent.click(screen.getByText(/otp\.resend_button/i).closest("button"));

    await waitFor(() => {
      expect(screen.getByText(/fail/i)).toBeInTheDocument();
    });
    expect(
      screen.getByText(/otp\.resend_button/i).closest("button"),
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

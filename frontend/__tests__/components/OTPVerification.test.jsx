import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OTPVerificationForm } from "@/components/auth/otp-verification-form";
import { useRouter } from "next/router";

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock lib/strapi
jest.mock("@/lib/strapi", () => ({
  verifyOtp: jest.fn(),
  resendOtp: jest.fn(),
}));

// Mock next-i18next
jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("OTPVerificationForm", () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter;
  const testEmail = "test@example.com";

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      query: { email: testEmail },
    });
    jest.clearAllMocks();
  });

  it("renders 6 input slots", () => {
    render(<OTPVerificationForm email={testEmail} />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(6);
  });

  it("moves to next input when digit is entered", () => {
    render(<OTPVerificationForm email={testEmail} />);
    const inputs = screen.getAllByRole("textbox");

    fireEvent.change(inputs[0], { target: { value: "1" } });
    expect(inputs[1]).toHaveFocus();

    fireEvent.change(inputs[1], { target: { value: "2" } });
    expect(inputs[2]).toHaveFocus();
  });

  it("moves to previous input on backspace if current is empty", () => {
    render(<OTPVerificationForm email={testEmail} />);
    const inputs = screen.getAllByRole("textbox");

    fireEvent.change(inputs[0], { target: { value: "1" } });
    fireEvent.change(inputs[1], { target: { value: "2" } });
    expect(inputs[2]).toHaveFocus();

    fireEvent.keyDown(inputs[2], { key: "Backspace" });
    expect(inputs[1]).toHaveFocus();
  });

  it("submits the full code when last digit is entered or button clicked", async () => {
    const { verifyOtp } = require("@/lib/strapi");
    verifyOtp.mockResolvedValue({ success: true, jwt: "fake-jwt" });

    render(<OTPVerificationForm email={testEmail} />);
    const inputs = screen.getAllByRole("textbox");

    const code = "123456";
    for (let i = 0; i < 6; i++) {
      fireEvent.change(inputs[i], { target: { value: code[i] } });
    }

    // Usually auto-submits or user clicks button
    fireEvent.click(
      screen.getByRole("button", { name: /otp\.verify_button/i }),
    );

    await waitFor(() => {
      expect(verifyOtp).toHaveBeenCalledWith(testEmail, "123456");
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("shows error message on invalid OTP", async () => {
    const { verifyOtp } = require("@/lib/strapi");
    verifyOtp.mockResolvedValue({
      error: { message: "Invalid code" },
    });

    render(<OTPVerificationForm email={testEmail} />);
    const inputs = screen.getAllByRole("textbox");

    for (let i = 0; i < 6; i++) {
      fireEvent.change(inputs[i], { target: { value: "0" } });
    }

    fireEvent.click(
      screen.getByRole("button", { name: /otp\.verify_button/i }),
    );

    const { toast } = require("sonner");
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid code");
    });
  });
});

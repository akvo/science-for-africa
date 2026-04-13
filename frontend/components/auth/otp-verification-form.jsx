import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyOtp, resendOtp } from "@/lib/strapi";
import { toast } from "sonner";

/**
 * OTPVerificationForm component
 * Handles 6-digit numeric OTP entry with auto-focus and resend cooldown logic.
 */
export const OTPVerificationForm = ({ email }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputs = useRef([]);

  // Load saved timer from localStorage on mount
  useEffect(() => {
    if (!email) return;
    const savedEndTime = localStorage.getItem(`otp_timer_end_${email}`);
    if (savedEndTime) {
      const remaining = Math.max(
        0,
        Math.floor((parseInt(savedEndTime) - Date.now()) / 1000),
      );
      if (remaining > 0) {
        setTimer(remaining);
      } else {
        localStorage.removeItem(`otp_timer_end_${email}`);
      }
    }
  }, [email]);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            localStorage.removeItem(`otp_timer_end_${email}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, email]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    // Only allow numbers
    if (val && !/^\d+$/.test(val)) return;

    const newOtp = [...otp];
    // Handle both single digit entry and paste
    if (val.length > 1) {
      const pastedData = val.slice(0, 6).split("");
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      const nextIdx = Math.min(5, index + pastedData.length);
      inputs.current[nextIdx].focus();
    } else {
      newOtp[index] = val;
      setOtp(newOtp);
      // Auto-focus next input if value was entered
      if (val && index < 5) {
        inputs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(data)) return;

    const newOtp = [...otp];
    data
      .slice(0, 6)
      .split("")
      .forEach((char, i) => {
        newOtp[i] = char;
      });
    setOtp(newOtp);
    const focusIdx = Math.min(5, data.length);
    inputs.current[focusIdx].focus();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) return;

    setLoading(true);
    try {
      const res = await verifyOtp(email, fullOtp);
      if (res.success) {
        toast.success(t("auth.otp_verified_success"));
        // Redirect to onboarding or dashboard
        router.push("/onboarding/step-1");
      } else {
        const errorMsg =
          res.message || res.error?.message || t("auth.otp_invalid_error");
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error(t("auth.otp_verify_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;

    setResending(true);
    try {
      const res = await resendOtp(email);
      if (res.success) {
        toast.success(t("auth.otp_resent_success"));
        const cooldownSeconds = 60;
        const endTime = Date.now() + cooldownSeconds * 1000;
        setTimer(cooldownSeconds);
        localStorage.setItem(`otp_timer_end_${email}`, endTime.toString());
      } else {
        const errorMsg =
          res.message || res.error?.message || t("auth.otp_resend_error");
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error(t("auth.otp_resend_failed"));
    } finally {
      setResending(false);
    }
  };

  const checkVerificationStatus = () => {
    // Manual refresh to check if verified via link in another tab
    toast.info(t("auth.checking_status"));
    router.reload();
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-none md:border md:shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t("auth.otp_verify_title")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("auth.otp_verify_desc")} <br />
          <span className="font-semibold text-primary-700">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              autoComplete="one-time-code"
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-10 h-12 md:w-12 md:h-14 border-2 rounded-md text-xl font-bold text-center focus:border-primary-500 focus:ring-2 focus:ring-primary-50 outline-none transition-all placeholder:text-gray-200"
              placeholder="0"
            />
          ))}
        </div>

        <Button
          className="w-full rounded-full bg-primary-500 hover:bg-primary-700 h-12 text-lg font-semibold"
          onClick={handleSubmit}
          disabled={loading || otp.join("").length < 6}
        >
          {loading ? t("common.loading") : t("auth.verify_button")}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-gray-500 text-center">
          {t("auth.no_code")}
          <button
            onClick={handleResend}
            disabled={timer > 0 || resending}
            className={`ml-1 font-semibold transition-colors ${
              timer > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-primary-500 hover:text-primary-700"
            }`}
          >
            {timer > 0
              ? t("auth.resend_in", { seconds: timer })
              : t("auth.resend_button")}
          </button>
        </div>

        <div className="border-t pt-4 w-full">
          <button
            onClick={checkVerificationStatus}
            className="text-sm w-full text-center text-gray-500 hover:text-primary-500 transition-colors"
          >
            {t("auth.already_verified_check")}
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyOtp, resendOtp, getRegistrationStatus } from "@/lib/strapi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/**
 * OTPVerificationForm component
 * Handles 6-digit numeric OTP entry with auto-focus and resend cooldown logic.
 */
export const OTPVerificationForm = ({ email }) => {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputs = useRef([]);

  // Load saved timer from localStorage on mount or sync with backend
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
    } else {
      // Sync with backend if no local timer exists
      const syncTimer = async () => {
        try {
          const res = await getRegistrationStatus(email);
          if (res && res.lastOtpSentAt) {
            const lastSent = new Date(res.lastOtpSentAt).getTime();
            const cooldownMs = 60000;
            const remaining = Math.max(
              0,
              Math.floor((lastSent + cooldownMs - Date.now()) / 1000),
            );
            if (remaining > 0) {
              setTimer(remaining);
              localStorage.setItem(
                `otp_timer_end_${email}`,
                (lastSent + cooldownMs).toString(),
              );
            }
          }
        } catch (err) {
          console.error("Failed to sync timer with backend:", err);
        }
      };
      syncTimer();
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
    setError("");
    try {
      const res = await verifyOtp(email, fullOtp);
      console.log("OTP Verification Response:", res);
      if (res.success) {
        toast.success(t("otp.verified_success"));
        // Redirect to login
        router.push("/login");
      } else {
        const errorMsg =
          res.message || res.error?.message || t("otp.invalid_error");
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      setError(t("otp.verify_failed"));
      toast.error(t("otp.verify_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;

    setResending(true);
    setError("");
    try {
      const res = await resendOtp(email);
      if (res.success) {
        toast.success(t("otp.resent_success"));
        const cooldownSeconds = 60;
        const endTime = Date.now() + cooldownSeconds * 1000;
        setTimer(cooldownSeconds);
        localStorage.setItem(`otp_timer_end_${email}`, endTime.toString());
      } else {
        // Correctly handle transformed error from api-client
        const errorMsg =
          res.error?.message ||
          (typeof res.error === "string" ? res.error : null) ||
          res.message ||
          t("otp.resend_error");
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      setError(t("otp.resend_failed"));
      toast.error(t("otp.resend_failed"));
    } finally {
      setResending(false);
    }
  };

  const checkVerificationStatus = async () => {
    // Manual check to see if verified via link in another tab
    toast.info(t("otp.checking_status"));
    try {
      const res = await getRegistrationStatus(email);
      if (res && res.confirmed) {
        toast.success(t("otp.verified_success"));
        router.push("/login?verified=true");
      } else {
        toast.error(t("otp.invalid_error")); // "Invalid or expired code" as generic "not verified"
      }
    } catch (err) {
      router.reload(); // Fallback to reload if check fails
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-none md:border md:shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t("otp.verify_title")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("otp.verify_desc")} <br />
          <span className="font-semibold text-primary-700">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {error && (
          <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 text-center animate-in fade-in duration-300">
            {error}
          </div>
        )}
        <div
          className="flex justify-center mx-auto gap-2"
          onPaste={handlePaste}
        >
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
              className="w-10 h-12 md:w-12 md:h-14 border-2 rounded-xl text-xl font-bold text-center focus:border-brand-teal-500 focus:ring-4 focus:ring-brand-teal-50 outline-none transition-all placeholder:text-brand-gray-200 bg-white"
              placeholder="0"
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full rounded-full h-11 shadow-sm transition-all active:scale-[0.98] group"
          onClick={handleSubmit}
          disabled={loading || otp.join("").length < 6}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            t("otp.verify_button")
          )}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-gray-500 text-center">
          {t("otp.no_code")}
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
              ? t("otp.resend_in", { seconds: timer })
              : t("otp.resend_button")}
          </button>
        </div>

        <div className="border-t pt-4 w-full">
          <button
            onClick={checkVerificationStatus}
            className="text-sm w-full text-center text-gray-500 hover:text-primary-500 transition-colors"
          >
            {t("otp.already_verified_check")}
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

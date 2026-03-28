import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { resendVerification } from "@/lib/strapi";

export const VerifyEmailContent = ({ email }) => {
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const result = await resendVerification(email);

      if (result && result.error) {
        setIsError(true);
        if (
          result.error.toLowerCase().includes("already confirmed") ||
          result.status === 400
        ) {
          setMessage("Your account is already verified! Please log in.");
        } else {
          setMessage(result.error);
        }
        return;
      }

      if (result) {
        setMessage("Verification email resent successfully!");
        setCountdown(30);
      } else {
        setIsError(true);
        setMessage("Failed to resend email. Please try again later.");
      }
    } catch (err) {
      setIsError(true);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-6 text-center">
        <div className="mx-auto w-16 h-16 bg-brand-teal-50 rounded-full flex items-center justify-center text-brand-teal-600 shadow-sm border border-brand-teal-100/50">
          <Mail size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-display-sm font-bold text-brand-teal-900 tracking-tight">
            Check your inbox
          </h1>
          <p className="text-brand-gray-500 font-medium text-sm">
            We've sent a verification link to{" "}
            <span className="text-brand-gray-900 font-bold">
              {email || "your email"}
            </span>
            . Please click the link to activate your account.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {message && (
          <div
            className={`p-4 text-sm font-medium rounded-lg text-center ${isError ? "text-destructive bg-destructive/10 border border-destructive/20" : "text-brand-teal-700 bg-brand-teal-50 border border-brand-teal-100"}`}
          >
            {message}
          </div>
        )}

        <Button
          onClick={handleResend}
          disabled={isLoading || countdown > 0}
          variant="outline"
          className="w-full rounded-full border-brand-gray-200 text-brand-gray-700 font-bold h-11 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : countdown > 0 ? (
            <span>Resend in {countdown}s</span>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              <span>Resend email</span>
            </>
          )}
        </Button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm font-bold text-brand-gray-500 hover:text-brand-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    </div>
  );
};

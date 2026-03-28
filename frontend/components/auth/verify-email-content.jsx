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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-sm">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-gray-500 hover:text-brand-gray-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="space-y-3">
        <h1 className="text-[30px] font-bold text-brand-teal-900 leading-tight">
          Confirm email
        </h1>
        <div className="space-y-6">
          <p className="text-brand-gray-500 font-medium text-base leading-relaxed">
            We sent you an email to{" "}
            <span className="text-brand-teal-800 font-bold">
              {email || "your email"}
            </span>{" "}
            with a secret link to confirm your account.
          </p>

          <p className="text-brand-gray-500 font-medium text-base leading-relaxed">
            If you do not see the email within 5 minutes, please contact us at{" "}
            <span className="text-brand-teal-800 font-bold">
              support@sfa.com
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        {message && (
          <div
            className={`p-4 text-sm font-medium rounded-lg text-center ${
              isError
                ? "text-destructive bg-destructive/10 border border-destructive/20"
                : "text-brand-teal-700 bg-brand-teal-50 border border-brand-teal-100"
            }`}
          >
            {message}
          </div>
        )}

        {/* Resend Action - Subtly integrated as a secondary ghost button/link */}
        <div className="flex flex-col items-start gap-3">
          <Button
            onClick={handleResend}
            disabled={isLoading || countdown > 0}
            variant="ghost"
            className="p-0 h-auto text-brand-teal-700 hover:text-brand-teal-900 font-bold hover:bg-transparent transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : countdown > 0 ? (
              <span>Resend link in {countdown}s</span>
            ) : (
              <>
                <RefreshCw size={16} />
                <span>Resend verification email</span>
              </>
            )}
          </Button>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center gap-1 text-sm font-medium text-brand-gray-500 pt-4 border-t border-brand-gray-100">
          <span>Already have an account?</span>
          <Link
            href="/login"
            className="text-brand-teal-800 font-bold hover:text-brand-teal-900 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, RefreshCw, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router";
import { resendVerification, verifyEmailToken } from "@/lib/strapi";

export const VerifyEmailContent = ({ email, confirmation }) => {
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const router = useRouter();

  // Handle Token Verification
  useEffect(() => {
    if (confirmation && !isVerified && !isVerifying && !isError) {
      const performVerification = async () => {
        setIsVerifying(true);
        setIsError(false);
        setMessage("");

        const result = await verifyEmailToken(confirmation);

        if (result && result.error) {
          setIsError(true);
          setMessage(result.error);
          setIsVerifying(false);
        } else {
          setIsVerified(true);
          setIsVerifying(false);
          setMessage("Email verified successfully!");
          setRedirectCountdown(3);
        }
      };
      performVerification();
    }
  }, [confirmation, isVerified, isVerifying, isError]);

  // Handle Resend Countdown
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle Redirect Countdown
  useEffect(() => {
    let timer;
    if (redirectCountdown > 0) {
      timer = setTimeout(() => {
        if (redirectCountdown === 1) {
          router.push("/login");
        }
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [redirectCountdown, router]);

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

  // 1. Verifying State UI
  if (isVerifying) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in duration-500 max-w-sm">
        <div className="w-16 h-16 bg-brand-teal-50 rounded-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-teal-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-brand-teal-900">Verifying your email</h1>
          <p className="text-brand-gray-500 font-medium">Please wait while we confirm your email address...</p>
        </div>
      </div>
    );
  }

  // 2. Verified Success State UI
  if (isVerified) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500 max-w-sm">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-brand-teal-900">Email verified successfully!</h1>
          <p className="text-brand-gray-500 font-medium">Your account is now active. Redirecting to login page in {redirectCountdown}s...</p>
        </div>
        <Button 
          onClick={() => router.push("/login")}
          className="w-full bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-bold h-12 rounded-xl transition-all"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  // 3. Error Case (if it was an automatic verification error)
  if (isError && confirmation) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in duration-500 max-w-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-brand-teal-900">Verification failed</h1>
          <p className="text-destructive font-medium">{message || "The verification link is invalid or has expired."}</p>
        </div>
        <div className="space-y-4 w-full">
          <Button 
            onClick={() => router.push("/signup")}
            className="w-full bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-bold h-12 rounded-xl transition-all"
          >
            Return to Signup
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push("/login")}
            className="w-full border-brand-teal-200 text-brand-teal-700 font-bold h-12 rounded-xl transition-all"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  // 4. Default State (Pending Verification)
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
        <div className="w-12 h-12 bg-brand-teal-50 rounded-xl flex items-center justify-center mb-4">
          <Mail className="text-brand-teal-600" size={24} />
        </div>
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


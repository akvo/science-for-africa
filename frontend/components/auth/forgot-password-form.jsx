import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/strapi";
import Link from "next/link";
import { cn } from "@/lib/utils";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const emailValue = watch("email");

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await forgotPassword(values.email);

      if (result && result.error) {
        // If it's a specific error from Strapi, we could show it,
        // but for security it's often better to show success even if email doesn't exist.
        // However, if the server is down or something, we show a generic error.
        setError("An error occurred. Please try again later.");
        return;
      }

      setSubmittedEmail(values.email);
      setIsSubmitted(true);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-90 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-3 mb-10 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-brand-teal-900">
            Reset password
          </h1>
          <div className="text-base text-brand-gray-500 space-y-4">
            <p>
              We sent you an email to{" "}
              <span className="text-brand-teal-600 font-bold">
                {submittedEmail}
              </span>{" "}
              with a secret link to reset your password.
            </p>
            <p>
              If you do not see the email within 5 minutes, please contact us at{" "}
              <span className="text-brand-teal-600 font-bold">
                support@sfa.com
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm mt-8 border-t border-brand-gray-100 pt-8">
          <span className="text-brand-gray-500">Already have an account?</span>
          <Link
            href="/login"
            className="font-semibold text-brand-teal-700 hover:text-brand-teal-800 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-90 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-gray-500 hover:text-brand-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <div className="flex flex-col gap-3 mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-brand-teal-900">
          Reset password
        </h1>
        <p className="text-base text-brand-gray-500 leading-relaxed">
          Enter your email address or username and we&apos;ll send you a link to
          reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-bold text-brand-gray-900"
          >
            Email
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400 group-focus-within:text-brand-teal-500 transition-colors pointer-events-none">
              <Mail size={18} />
            </div>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="name@institution.org"
              className={`pl-10 h-11 ${errors.email ? "border-destructive ring-destructive" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !emailValue}
          size="lg"
          className={cn(
            "w-full rounded-full h-11 shadow-sm transition-all active:scale-[0.98] border-none font-semibold disabled:opacity-100 disabled:cursor-not-allowed",
            emailValue
              ? "bg-primary-500 text-white hover:bg-primary-600"
              : "bg-primary-50 text-white",
          )}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </div>
  );
};

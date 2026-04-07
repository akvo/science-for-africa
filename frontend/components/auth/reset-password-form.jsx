import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/strapi";
import { useRouter } from "next/router";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { passwordSchema } from "@/lib/validation";

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirmation: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export const ResetPasswordForm = () => {
  const router = useRouter();
  const { code } = router.query;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const password = watch("password");
  const passwordConfirmation = watch("passwordConfirmation");
  const isButtonEnabled =
    password.length > 0 && passwordConfirmation.length > 0;

  const onSubmit = async (values) => {
    if (!code) {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await resetPassword({
        code: code,
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
      });

      if (result && result.error) {
        const errorMessage =
          result.error.message ||
          result.error ||
          "Reset failed. Please try again.";
        setError(errorMessage);
        return;
      }

      setIsSuccess(true);
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-90 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-brand-teal-50 rounded-full flex items-center justify-center text-brand-teal-600 font-bold">
            <CheckCircle2 size={28} />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-teal-900 mb-3">
          Password updated
        </h1>
        <p className="text-base text-brand-gray-500 mb-8">
          Your password has been successfully updated. You can now log in with
          your new credentials. You will be redirected shortly...
        </p>
        <Link href="/login">
          <Button
            variant="primary"
            className="w-full rounded-full h-11 bg-primary-500 hover:bg-primary-600"
          >
            Log in now
          </Button>
        </Link>
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
          Create new password
        </h1>
        <p className="text-base text-brand-gray-500 leading-relaxed">
          Please enter and confirm your new password below to complete the reset
          process.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 whitespace-pre-line">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-bold text-brand-gray-900"
          >
            New password
          </Label>
          <div className="relative group">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="password"
              className={cn(
                "pr-10 h-11",
                errors.password ? "border-destructive ring-destructive" : "",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="passwordConfirmation"
            className="text-sm font-bold text-brand-gray-900"
          >
            Confirm password
          </Label>
          <div className="relative group">
            <Input
              id="passwordConfirmation"
              type={showConfirmPassword ? "text" : "password"}
              {...register("passwordConfirmation")}
              placeholder="password"
              className={cn(
                "pr-10 h-11",
                errors.passwordConfirmation
                  ? "border-destructive ring-destructive"
                  : "",
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.passwordConfirmation && (
            <p className="text-xs font-medium text-destructive">
              {errors.passwordConfirmation.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !isButtonEnabled}
          size="lg"
          className={cn(
            "w-full rounded-full h-11 shadow-sm transition-all active:scale-[0.98] border-none font-semibold disabled:opacity-100 disabled:cursor-not-allowed",
            isButtonEnabled
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

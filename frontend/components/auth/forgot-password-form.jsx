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
import { useTranslation } from "next-i18next";

export const ForgotPasswordForm = () => {
  const { t } = useTranslation("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState("");

  const forgotPasswordSchema = z.object({
    email: z.string().email(t("validation.email_invalid")),
  });

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
        setError(t("signup.error_unexpected"));
        return;
      }

      setSubmittedEmail(values.email);
      setIsSubmitted(true);
    } catch (err) {
      setError(t("signup.error_unexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-90 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-3 mb-10 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-brand-teal-900">
            {t("forgot_password.success_title")}
          </h1>
          <div className="text-base text-brand-gray-500 space-y-4">
            <p>
              {t("verify_email.confirm_sent_to", { email: submittedEmail })}
            </p>
            <p>{t("verify_email.confirm_no_email")}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm mt-8 border-t border-brand-gray-100 pt-8">
          <span className="text-brand-gray-500">
            {t("signup.already_have_account")}
          </span>
          <Link
            href="/login"
            className="font-semibold text-brand-teal-700 hover:text-brand-teal-800 transition-colors"
          >
            {t("signup.login_link")}
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
          {t("navbar.back", { ns: "common" })}
        </Link>
      </div>

      <div className="flex flex-col gap-3 mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-brand-teal-900">
          {t("forgot_password.title")}
        </h1>
        <p className="text-base text-brand-gray-500 leading-relaxed">
          {t("forgot_password.description")}
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
            {t("forgot_password.email_label")}
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400 group-focus-within:text-brand-teal-500 transition-colors pointer-events-none">
              <Mail size={18} />
            </div>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder={t("forgot_password.email_placeholder")}
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
            t("forgot_password.button")
          )}
        </Button>
      </form>
    </div>
  );
};

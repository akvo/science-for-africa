import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/strapi";
import { useRouter } from "next/router";
import { getPasswordSchema } from "@/lib/validation";
import { useTranslation } from "next-i18next";

export const SignUpForm = () => {
  const { t } = useTranslation("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const signupSchema = z
    .object({
      fullName: z.string().min(2, t("validation.fullname_min")),
      email: z.string().email(t("validation.email_invalid")),
      password: getPasswordSchema(t),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwords_mismatch"),
      path: ["confirmPassword"],
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError("");

    try {
      // Strapi register expects username, email, password.
      const payload = {
        username: values.email,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      };

      const result = await registerUser(payload);

      if (result && result.error) {
        setError(result.error);
        return;
      }

      if (result && (result.jwt || result.user)) {
        // Success! Redirect to verify email
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(values.email)}`,
        );
      } else {
        setError(t("signup.error_failed"));
      }
    } catch (err) {
      setError(t("signup.error_unexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150"
    >
      {error && (
        <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label
          htmlFor="fullName"
          className="text-sm font-bold text-brand-gray-900"
        >
          {t("signup.fullname_label")}
        </Label>
        <Input
          id="fullName"
          {...register("fullName")}
          placeholder={t("signup.fullname_placeholder")}
          className={`rounded-lg border-brand-gray-200 focus:ring-brand-teal-500 h-10 ${errors.fullName ? "border-destructive ring-destructive" : ""}`}
        />
        {errors.fullName && (
          <p className="text-xs font-medium text-destructive">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-sm font-bold text-brand-gray-900"
        >
          {t("signup.email_label")}
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder={t("signup.email_placeholder")}
          className={`rounded-lg border-brand-gray-200 focus:ring-brand-teal-500 h-10 ${errors.email ? "border-destructive ring-destructive" : ""}`}
        />
        {errors.email && (
          <p className="text-xs font-medium text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="password"
          title={t("signup.password_hint")}
          className="text-sm font-bold text-brand-gray-900"
        >
          {t("signup.password_label")}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="••••••••"
            className={`rounded-lg border-brand-gray-200 focus:ring-brand-teal-500 h-10 pr-10 ${errors.password ? "border-destructive ring-destructive" : ""}`}
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
          <p className="text-xs font-medium text-destructive leading-tight">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="confirmPassword"
          className="text-sm font-bold text-brand-gray-900"
        >
          {t("signup.confirm_password_label")}
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            placeholder={t("signup.confirm_password_placeholder")}
            className={`rounded-lg border-brand-gray-200 focus:ring-brand-teal-500 h-10 pr-10 ${errors.confirmPassword ? "border-destructive ring-destructive" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-gray-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs font-medium text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        size="lg"
        variant="primary"
        className="w-full rounded-full h-11 shadow-sm transition-all active:scale-[0.98] mt-2 group"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          t("signup.button")
        )}
      </Button>
    </form>
  );
};

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { loginUser } from "@/lib/strapi";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/router";
import { SocialButton } from "./social-auth";
import Link from "next/link";
import { useTranslation } from "next-i18next";

export const LoginForm = () => {
  const { t } = useTranslation("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Handle errors from OAuth redirects or other sources
  React.useEffect(() => {
    if (router.query.error) {
      setError(router.query.error);
    }
  }, [router.query.error]);

  const loginSchema = z.object({
    email: z.string().email(t("validation.email_invalid")),
    password: z.string().min(1, t("validation.password_required")),
    rememberMe: z.boolean().default(false),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await loginUser({
        identifier: values.email,
        password: values.password,
      });

      if (result && result.error) {
        setError(result.error);
        return;
      }

      if (result && result.jwt) {
        // Success! Persist auth state
        const { setAuth, updateUser } = useAuthStore.getState();
        setAuth(result.user, result.jwt, values.rememberMe);

        // Fetch full profile with relations (institutions, interests, etc.)
        // This ensures the store has populated data immediately after login
        try {
          const { fetchUserProfile } = require("@/lib/strapi");
          const fullProfile = await fetchUserProfile();
          if (fullProfile) {
            updateUser(fullProfile);
          }
        } catch (err) {
          console.error("Failed to sync full profile after login:", err);
        }

        // Redirect based on onboarding status
        if (result.user?.onboardingComplete) {
          router.push("/");
        } else {
          router.push("/onboarding");
        }
      } else {
        setError(t("login.error_failed"));
      }
    } catch (err) {
      setError(t("login.error_unexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-90 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-3 mb-32">
        <h1 className="text-3xl font-bold tracking-tight text-brand-teal-900">
          {t("login.title")}
        </h1>
        <p className="text-base text-brand-gray-500">
          {t("login.description")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            {t("login.email_label")}
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400 group-focus-within:text-brand-teal-500 transition-colors pointer-events-none">
              <Mail size={18} />
            </div>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder={t("login.email_placeholder")}
              className={`pl-10 h-11 ${errors.email ? "border-destructive ring-destructive" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-bold text-brand-gray-900"
          >
            {t("login.password_label")}
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400 group-focus-within:text-brand-teal-500 transition-colors pointer-events-none">
              <Lock size={18} />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder={t("login.password_placeholder")}
              className={`pl-10 pr-10 h-11 ${errors.password ? "border-destructive ring-destructive" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-gray-600 transition-colors focus:outline-none"
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm font-medium text-brand-gray-700 cursor-pointer"
            >
              {t("login.remember_me")}
            </Label>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-brand-teal-700 font-bold hover:text-brand-teal-900 transition-colors"
          >
            {t("login.forgot_password")}
          </Link>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            variant="primary"
            className="w-full rounded-full h-11 shadow-sm transition-all active:scale-[0.98] group"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              t("login.button")
            )}
          </Button>

          <SocialButton
            provider="google"
            className="h-11 border-brand-gray-200"
          />
        </div>
      </form>

      <div className="mt-8 text-center flex items-center justify-center gap-1.5">
        <p className="text-sm text-brand-gray-500">{t("login.no_account")}</p>
        <Link
          href="/signup"
          className="text-sm text-brand-teal-700 font-bold hover:text-brand-teal-900 transition-colors"
        >
          {t("login.signup_link")}
        </Link>
      </div>
    </div>
  );
};

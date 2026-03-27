import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialButton } from "@/components/auth/social-auth";

const LoginPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2 mb-32">
        <h1 className="text-display-sm font-bold text-brand-teal-900 tracking-tight">
          Log in
        </h1>
        <p className="text-brand-gray-500 font-medium text-sm">
          Welcome back to the platform! Please enter your details.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-bold text-brand-gray-900"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@institution.org"
            required
            className="rounded-lg border-brand-gray-200 focus:ring-brand-teal-500 h-10"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label
              htmlFor="password"
              className="text-sm font-bold text-brand-gray-900"
            >
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-bold text-brand-teal-700 hover:text-brand-teal-900 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            className="rounded-lg border-brand-gray-200 focus:ring-brand-teal-500 h-10"
          />
        </div>
        <Button
          size="lg"
          variant="primary"
          className="w-full rounded-full h-11 shadow-sm transition-all active:scale-[0.98]"
        >
          Login
        </Button>
      </div>

      <div className="relative flex items-center gap-4">
        <div className="h-px grow bg-brand-gray-100"></div>
        <span className="text-xs font-bold text-brand-gray-400 uppercase tracking-widest whitespace-nowrap">
          Or continue with
        </span>
        <div className="h-px grow bg-brand-gray-100"></div>
      </div>

      <SocialButton provider="google" />

      <p className="text-center text-sm text-brand-gray-500 font-medium pt-2">
        Don't have an account?{" "}
        <Link
          href="/signup"
          className="text-brand-teal-700 font-bold hover:text-brand-teal-900 transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;

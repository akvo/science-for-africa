import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { SocialButton } from "@/components/auth/social-auth";

const LoginPage = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-display-sm font-bold text-brand-gray-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-brand-gray-500 font-medium">
          Enter your details to access your account.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2.5">
          <Label htmlFor="email" className="text-brand-gray-700 font-bold">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@institution.org"
            required
          />
        </div>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-brand-gray-700 font-bold">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-bold text-primary-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        <Button size="2xl" className="w-full shadow-md active:scale-95">
          Sign In
        </Button>
      </div>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-brand-gray-100"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-brand-gray-400 font-bold tracking-widest">
            Or continue with
          </span>
        </div>
      </div>

      <SocialButton provider="google" />

      <p className="text-center text-sm text-brand-gray-500 font-medium">
        Don't have an account?{" "}
        <Link
          href="/signup"
          className="text-primary-600 font-bold hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;

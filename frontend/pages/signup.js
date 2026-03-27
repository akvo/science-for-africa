import React from "react";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/signup-form";
import { SocialButton } from "@/components/auth/social-auth";

const SignupPage = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2 mb-32">
        <h1 className="text-display-sm font-bold text-brand-teal-900 tracking-tight">
          Sign up
        </h1>
        <p className="text-brand-gray-500 font-medium text-sm">
          Please enter your details.
        </p>
      </div>

      <SignUpForm />

      <div className="relative flex items-center gap-4">
        <div className="h-px grow bg-brand-gray-100"></div>
        <span className="text-xs font-bold text-brand-gray-400 uppercase tracking-widest whitespace-nowrap">
          Or continue with
        </span>
        <div className="h-px grow bg-brand-gray-100"></div>
      </div>

      <SocialButton provider="google" />

      <p className="text-center text-sm text-brand-gray-500 font-medium pt-2">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand-teal-700 font-bold hover:text-brand-teal-900 transition-colors"
        >
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;

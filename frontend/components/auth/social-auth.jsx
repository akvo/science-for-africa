import React from "react";
import { Button } from "@/components/ui/button";

export const SocialButton = ({ provider, text, className, ...props }) => {
  const isGoogle = provider === "google";

  const icon = isGoogle ? (
    <svg
      className="size-6"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
        fill="#EA4335"
      />
    </svg>
  ) : (
    <svg
      className="size-6"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M17.05 20.28c-.96.95-2.1 2.37-3.66 2.37-1.5 0-1.92-.93-3.71-.93s-2.3.9-3.71.9c-1.46 0-2.68-1.4-3.65-2.39C.45 18.33-1 14.73-1 11.23c0-3.63 2.27-5.55 4.5-5.55 1.15 0 2.22.45 3 .94 1.12.68 2.32 1.48 3.5 1.48 1.15 0 1.95-.8 3.12-1.48.87-.52 2.13-1.05 3.5-1.05 1.5 0 3.3.75 4.5 2.4-3.08 1.73-2.55 5.5.38 6.75-.68 1.88-1.8 3.75-3.45 5.58zM12.03 5.48c-.08-2.33 1.83-4.35 4.05-4.5.15 2.55-1.95 4.73-4.05 4.5z" />
    </svg>
  );

  const defaultText = isGoogle ? "Sign in with Google" : "Sign in with Apple";
  const appleStyles = !isGoogle
    ? "bg-[#21252b] text-white border-transparent hover:bg-black"
    : "";

  return (
    <Button
      variant="social"
      size="social"
      className={`${appleStyles} ${className} w-full`}
      {...props}
    >
      {icon}
      {text || defaultText}
    </Button>
  );
};

export const SocialAuth = ({ className }) => {
  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      <SocialButton provider="google" />
      <SocialButton provider="apple" />
    </div>
  );
};

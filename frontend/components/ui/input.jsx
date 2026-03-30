import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-8 border border-brand-gray-100 bg-white px-4 py-3 text-base transition-all outline-none placeholder:text-brand-gray-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-brand-gray-900/10 dark:border-brand-gray-800 dark:text-brand-gray-100",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

import * as React from "react";
import { cn } from "@/lib/utils";

const ButtonGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex rounded-lg border border-brand-gray-200 bg-white overflow-hidden items-stretch",
      className,
    )}
    {...props}
  />
));
ButtonGroup.displayName = "ButtonGroup";

const ButtonGroupItem = React.forwardRef(
  ({ className, active, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors border-r border-brand-gray-200 last:border-r-0",
        active
          ? "bg-brand-teal-50 text-brand-teal-900"
          : "bg-white text-brand-gray-700 hover:bg-brand-gray-50",
        className,
      )}
      {...props}
    />
  ),
);
ButtonGroupItem.displayName = "ButtonGroupItem";

export { ButtonGroup, ButtonGroupItem };

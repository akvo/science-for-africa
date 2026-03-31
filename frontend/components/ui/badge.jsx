import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent font-bold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-brand-teal-50 text-brand-teal-700 border-brand-teal-100",
        primary: "bg-brand-teal-50 text-brand-teal-700 border-brand-teal-100",
        secondary:
          "bg-brand-orange-50 text-brand-orange-700 border-brand-orange-100",
        success: "bg-emerald-50 text-emerald-700 border-emerald-100",
        warning: "bg-amber-50 text-amber-700 border-amber-100",
        destructive: "bg-red-50 text-red-700 border-red-100",
        error: "bg-red-50 text-red-700 border-red-100",
        outline: "text-brand-gray-700 border-brand-gray-200 bg-transparent",
        gray: "bg-brand-gray-50 text-brand-gray-700 border-brand-gray-100",
      },
      size: {
        sm: "h-5 px-2 text-[10px]",
        md: "h-6 px-2.5 text-[11px]",
        lg: "h-7 px-3 text-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

function Badge({
  className,
  variant = "default",
  size = "md",
  render,
  ...props
}) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
      size,
    },
  });
}

export { Badge, badgeVariants };

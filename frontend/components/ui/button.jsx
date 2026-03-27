import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-brand-teal-700",
        secondary:
          "bg-brand-teal-50 text-brand-teal-700 hover:bg-brand-teal-100 dark:bg-brand-teal-900/20 dark:text-brand-teal-300",
        outline:
          "border-brand-gray-100 bg-transparent text-brand-gray-900 hover:bg-brand-gray-50 dark:border-brand-gray-800 dark:text-brand-gray-100",
        ghost:
          "hover:bg-brand-gray-50 text-brand-gray-600 hover:text-brand-gray-900 aria-expanded:bg-brand-gray-50 dark:hover:bg-brand-gray-800",
        tertiary:
          "text-brand-teal-700 hover:bg-brand-teal-50 dark:text-brand-teal-400 dark:hover:bg-brand-teal-900/20",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-base",
        xl: "h-12 px-6 text-base",
        "2xl": "h-14 px-8 text-lg font-semibold",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  if (asChild) {
    return (
      <ButtonPrimitive
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        render={props.children}
        {...(({ children, ...rest }) => rest)(props)}
      />
    );
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }

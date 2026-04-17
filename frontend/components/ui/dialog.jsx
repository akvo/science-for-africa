import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

function Dialog({ ...props }) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ asChild = false, ...props }) {
  if (asChild) {
    return (
      <DialogPrimitive.Trigger
        data-slot="dialog-trigger"
        render={props.children}
        {...(({ children, ...rest }) => rest)(props)}
      />
    );
  }

  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-primary-500/100 duration-100 supports-backdrop-filter:backdrop-blur-[8px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

const dialogContentVariants = cva(
  "fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-6 rounded-16 bg-white p-6 text-sm text-popover-foreground border border-brand-gray-100 shadow-lg duration-100 outline-none max-w-[calc(100%-2rem)] data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
  {
    variants: {
      size: {
        md: "sm:max-w-md",
        sm: "sm:max-w-[392px]",
        lg: "sm:max-w-[600px]",
        xl: "sm:max-w-[820px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

function DialogContent({
  className,
  children,
  showCloseButton = true,
  size = "md",
  ...props
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(dialogContentVariants({ size, className }))}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      data-testid="dialog-header"
      className={cn("flex flex-col gap-2 text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, variant = "default", children, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      data-testid="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
        variant === "block" &&
          "-mx-6 -mb-6 mt-4 rounded-b-16 border-t border-brand-gray-100 bg-brand-gray-50 p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      data-testid="dialog-title"
      className={cn(
        "font-heading text-xl leading-tight font-bold text-brand-gray-900",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      data-testid="dialog-description"
      className={cn(
        "text-md text-brand-gray-600 *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};

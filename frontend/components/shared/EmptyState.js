import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-brand-gray-25">
      <div className="size-14 bg-white rounded-2xl border border-brand-gray-100 flex items-center justify-center mb-6 shadow-sm">
        {Icon && <Icon className="size-7 text-brand-teal-900" />}
      </div>
      <h3 className="text-lg font-bold text-brand-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-brand-gray-500 max-w-xs mb-8">{description}</p>
      {actionHref && actionLabel && (
        <Button
          asChild
          variant="outline"
          className="rounded-full px-8 border-brand-teal-900 text-brand-teal-900"
        >
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

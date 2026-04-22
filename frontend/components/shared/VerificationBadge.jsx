import React from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const VerificationBadge = ({ verified, type = "user", className }) => {
  if (verified) return null;

  const tooltipText =
    type === "user"
      ? "pending account details confirmation"
      : "pending institution details confirmation";

  return (
    <Badge
      variant="secondary"
      size="sm"
      className={cn(
        "gap-1 font-bold tracking-tight text-[10px] px-2 py-0",
        className,
      )}
      title={tooltipText}
    >
      <Clock className="w-3 h-3" />
      Pending
    </Badge>
  );
};

export default VerificationBadge;

import React from "react";
import { Clock } from "lucide-react";
import { useTranslation } from "next-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const VerificationBadge = ({ verified, type = "user", className }) => {
  const { t } = useTranslation("common");

  if (verified) return null;

  const tooltipText =
    type === "user"
      ? t("verification.tooltip_user")
      : t("verification.tooltip_institution");

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
      {t("verification.pending")}
    </Badge>
  );
};

export default VerificationBadge;

import Link from "next/link";
import { useTranslation } from "next-i18next";
import { TrendingUp, Users, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_KEYS = [
  { key: "trending", i18nKey: "community.left_nav.trending", href: "/community/trending", icon: TrendingUp },
  { key: "communities", i18nKey: "community.left_nav.communities", href: "/community", icon: Users },
  { key: "collaboration-hub", i18nKey: "community.left_nav.collaboration", href: "/community/collaboration-hub", icon: Globe },
];

export default function CommunityLeftNav({
  activeKey,
  className,
}) {
  const { t } = useTranslation("common");

  return (
    <nav
      aria-label="Community navigation"
      className={cn("flex flex-col gap-1 text-sm", className)}
    >
      {NAV_KEYS.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-primary-50 text-brand-teal-700"
                : "text-brand-gray-700 hover:bg-brand-gray-50",
            )}
          >
            {Icon ? <Icon className="size-5 shrink-0" /> : null}
            {t(item.i18nKey)}
          </Link>
        );
      })}
    </nav>
  );
}

import Link from "next/link";
import { useTranslation } from "next-i18next";
import { cn } from "@/lib/utils";

const NAV_KEYS = [
  { key: "trending", i18nKey: "community.left_nav.trending", href: "/community/trending" },
  { key: "communities", i18nKey: "community.left_nav.communities", href: "/community" },
  { key: "active-discussions", i18nKey: "community.left_nav.discussions", href: "/community/discussions" },
  { key: "collaboration-hub", i18nKey: "community.left_nav.collaboration", href: "/community/collaboration-hub" },
  { key: "events", i18nKey: "community.left_nav.events", href: "/community/events" },
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
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-primary-50 text-brand-teal-700"
                : "text-brand-gray-700 hover:bg-brand-gray-50",
            )}
          >
            {t(item.i18nKey)}
          </Link>
        );
      })}
    </nav>
  );
}

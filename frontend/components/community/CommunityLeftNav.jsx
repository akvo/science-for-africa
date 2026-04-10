import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Left side navigation for the Community / Forum area.
 *
 * Reusable across all forum pages. Pass `activeKey` to highlight
 * the current section. Items are configurable so future engineers
 * can extend without modifying this component.
 */
const DEFAULT_ITEMS = [
  { key: "trending", label: "Trending now", href: "/community/trending" },
  { key: "communities", label: "Communities", href: "/community" },
  {
    key: "active-discussions",
    label: "Active discussions",
    href: "/community/discussions",
  },
  {
    key: "collaboration-hub",
    label: "Collaboration Hub",
    href: "/community/collaboration-hub",
  },
  { key: "events", label: "Events", href: "/community/events" },
];

export default function CommunityLeftNav({
  items = DEFAULT_ITEMS,
  activeKey,
  className,
}) {
  return (
    <nav
      aria-label="Community navigation"
      className={cn("flex flex-col gap-1 text-sm", className)}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-brand-teal-50 text-brand-teal-700"
                : "text-brand-gray-700 hover:bg-brand-gray-50",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

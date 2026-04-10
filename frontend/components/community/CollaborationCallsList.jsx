import { useMemo, useState } from "react";
import CollaborationCallCard from "./CollaborationCallCard";
import { cn } from "@/lib/utils";
import { COLLABORATION_CALL_STATUS } from "@/lib/community-mock-data";

const FILTERS = [
  { key: "all", label: "All" },
  { key: COLLABORATION_CALL_STATUS.ACTIVE, label: "Active" },
  { key: COLLABORATION_CALL_STATUS.COMPLETED, label: "Completed" },
];

/**
 * Collaboration Calls list with status filters and a sort control slot.
 *
 * Stateless w.r.t. data — pass `calls` in. The active/completed filter is
 * local UI state. Replace with server-driven filters when API is wired up.
 */
export default function CollaborationCallsList({
  calls = [],
  onView,
  className,
}) {
  const [filter, setFilter] = useState("all");

  const visibleCalls = useMemo(() => {
    if (filter === "all") return calls;
    return calls.filter((c) => c.status === filter);
  }, [calls, filter]);

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2 border-b border-brand-gray-100 pb-4 lg:pl-6">
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex h-[34px] items-center rounded-full px-[14px] text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-teal-500 text-white"
                  : "bg-white text-brand-gray-700 border border-brand-gray-100 hover:bg-brand-gray-50",
              )}
              aria-pressed={isActive}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {visibleCalls.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-gray-200 p-10 text-center text-sm text-brand-gray-500">
          No collaboration calls to show.
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-brand-gray-100">
          {visibleCalls.map((call) => (
            <CollaborationCallCard
              key={call.id}
              call={call}
              onView={onView}
            />
          ))}
        </div>
      )}
    </section>
  );
}

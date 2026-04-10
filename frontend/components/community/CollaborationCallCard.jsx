import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COLLABORATION_CALL_STATUS } from "@/lib/community-mock-data";

const STATUS_META = {
  [COLLABORATION_CALL_STATUS.ACTIVE]: {
    label: "Active",
    dotClass: "bg-emerald-500",
  },
  [COLLABORATION_CALL_STATUS.COMPLETED]: {
    label: "Completed",
    dotClass: "bg-red-500",
  },
};

function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  } catch {
    return String(value);
  }
}

/**
 * Single collaboration call list item.
 *
 * Reusable in any list (community page, search results, dashboard).
 * Pass `onView` to handle navigation; if omitted, the View button is hidden.
 */
export default function CollaborationCallCard({ call, onView }) {
  const status = STATUS_META[call.status] ?? STATUS_META.active;
  const datePrefix =
    call.status === COLLABORATION_CALL_STATUS.COMPLETED ? "Ended" : "Valid till";

  return (
    <article className="flex items-start justify-between gap-4 py-5 lg:px-6">
      <div className="min-w-0 flex-1">
        <div className="mb-3 inline-flex h-[34px] w-fit items-center divide-x divide-brand-gray-200 rounded-full bg-[#E8ECEF] text-sm font-medium text-brand-gray-700">
          <span className="inline-flex h-full items-center gap-2 px-4">
            <span className={`size-2 rounded-full ${status.dotClass}`} />
            {status.label}
          </span>
          <span className="inline-flex h-full items-center gap-2 px-4">
            <Calendar className="size-4" />
            {datePrefix}: {formatDate(call.endsAt)}
          </span>
        </div>
        <h3 className="truncate text-base font-semibold text-brand-gray-900">
          {call.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-brand-gray-600">
          {call.description}
        </p>
        {call.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {call.tags.map((tag) => (
              <Badge key={tag} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {onView ? (
        <Button
          variant="outline"
          size="sm"
          className="border-transparent bg-[#E8ECEF] hover:bg-[#dde2e6]"
          onClick={() => onView(call)}
        >
          View
        </Button>
      ) : null}
    </article>
  );
}

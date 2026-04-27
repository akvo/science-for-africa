import { useEffect, useMemo, useState } from "react";
import { Plus, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchResources } from "@/lib/strapi";
import AddResourceDialog from "./AddResourceDialog";

const RESOURCE_FILTERS = [
  { key: "all", label: "All" },
  { key: "report", label: "Report" },
  { key: "publication", label: "Publication" },
  { key: "practice-note", label: "Practice note" },
  { key: "case-study", label: "Case study" },
];

const TYPE_LABELS = {
  report: "Report",
  publication: "Publication",
  "practice-note": "Practice note",
  "case-study": "Case study",
};

function getFullFileUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  // Strapi returns relative paths like /uploads/file.pdf — prepend backend origin
  const backendOrigin = (
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337/api"
  ).replace(/\/api\/?$/, "");
  return `${backendOrigin}${url}`;
}

function ResourceCard({ resource }) {
  const fileUrl = getFullFileUrl(resource.file?.url);
  return (
    <div className="flex items-center gap-4 px-6 py-5">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-gray-100">
        <File className="size-6 text-brand-teal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-brand-gray-500">
          {TYPE_LABELS[resource.resourceType] || resource.resourceType}
        </p>
        <p className="text-base font-semibold text-brand-gray-900 truncate">
          {resource.name}
        </p>
      </div>
      {fileUrl && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="border-transparent bg-[#E8ECEF] hover:bg-[#dde2e6]"
            onClick={() => window.open(fileUrl, "_blank")}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-transparent bg-[#E8ECEF] hover:bg-[#dde2e6]"
            onClick={async () => {
              try {
                const res = await fetch(fileUrl);
                const blob = await res.blob();
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = resource.file?.name || resource.name;
                a.click();
                URL.revokeObjectURL(a.href);
              } catch {
                window.open(fileUrl, "_blank");
              }
            }}
          >
            Download
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ResourcesList({
  communityDocumentId,
  onAdd,
  className,
}) {
  const [filter, setFilter] = useState("all");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadResources = () => {
    if (!communityDocumentId) return;
    setLoading(true);
    fetchResources(communityDocumentId).then((res) => {
      setResources(Array.isArray(res?.data) ? res.data : []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadResources();
  }, [communityDocumentId]);

  const filtered = useMemo(() => {
    if (filter === "all") return resources;
    return resources.filter((r) => r.resourceType === filter);
  }, [resources, filter]);

  return (
    <section className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-2 border-b border-brand-gray-100 pb-4 lg:px-6">
        {RESOURCE_FILTERS.map((f) => {
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex h-[34px] cursor-pointer items-center rounded-full px-[14px] text-sm font-medium transition-colors",
                isActive
                  ? "border border-[#D0D5DD] bg-primary-50 text-brand-gray-900 shadow-[0_1px_2px_0_rgba(16,24,40,0.05),0_0_0_4px_var(--color-primary-50)]"
                  : "bg-white text-brand-gray-700 border border-brand-gray-100 hover:bg-brand-gray-50",
              )}
              aria-pressed={isActive}
            >
              {f.label}
            </button>
          );
        })}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto gap-1.5 rounded-full"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="size-4" />
          Add resource
        </Button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-brand-gray-500">
          Loading resources...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-gray-200 p-10 text-center text-sm text-brand-gray-500">
          No resources to show.
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-brand-gray-100 border-b border-brand-gray-100">
          {filtered.map((r) => (
            <ResourceCard
              key={r.documentId || r.id}
              resource={r}
            />
          ))}
        </div>
      )}

      <AddResourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        communityDocumentId={communityDocumentId}
        onSuccess={loadResources}
      />
    </section>
  );
}

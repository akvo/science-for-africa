import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, getFullFileUrl, downloadFile } from "@/lib/utils";
import { fetchResources } from "@/lib/strapi";
import AddResourceDialog from "./AddResourceDialog";
import ResourceTable from "@/components/shared/ResourceTable";

const RESOURCE_FILTER_KEYS = [
  { key: "all", i18nKey: "resources.all" },
  { key: "report", i18nKey: "resources.report" },
  { key: "publication", i18nKey: "resources.publication" },
  { key: "practice-note", i18nKey: "resources.practice_note" },
  { key: "case-study", i18nKey: "resources.case_study" },
];

export default function ResourcesList({
  communityDocumentId,
  onAdd,
  className,
}) {
  const { t } = useTranslation("common");
  const [filter, setFilter] = useState("all");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadResources = useCallback(() => {
    if (!communityDocumentId) return;
    setLoading(true);
    fetchResources(communityDocumentId).then((res) => {
      setResources(Array.isArray(res?.data) ? res.data : []);
      setLoading(false);
    });
  }, [communityDocumentId]);

  useEffect(() => {
    let ignore = false;
    if (!communityDocumentId) return;

    fetchResources(communityDocumentId).then((res) => {
      if (!ignore) {
        setResources(Array.isArray(res?.data) ? res.data : []);
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
    };
  }, [communityDocumentId]);

  const filtered = useMemo(() => {
    if (filter === "all") return resources;
    return resources.filter((r) => r.resourceType === filter);
  }, [resources, filter]);

  const handleView = (resource) => {
    const url = getFullFileUrl(resource.file?.url);
    if (url) window.open(url, "_blank");
  };

  const handleDownload = (resource) => {
    const url = getFullFileUrl(resource.file?.url);
    if (url) downloadFile(url, resource.file?.name || resource.name);
  };

  return (
    <section className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-brand-gray-100 pb-4 lg:px-0">
        {RESOURCE_FILTER_KEYS.map((f) => {
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
              {t(f.i18nKey)}
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
          {t("resources.add_resource")}
        </Button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-brand-gray-500">
          {t("resources.loading")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-gray-200 p-10 text-center text-sm text-brand-gray-500">
          {t("resources.no_resources")}
        </div>
      ) : (
        <ResourceTable
          resources={filtered}
          onView={handleView}
          onDownload={handleDownload}
          t={t}
        />
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

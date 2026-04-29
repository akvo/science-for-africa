import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "next-i18next";
import { FileSearch } from "lucide-react";
import { fetchMyResources, deleteResource } from "@/lib/strapi";
import { getFullFileUrl, downloadFile } from "@/lib/utils";
import ResourceTable from "@/components/shared/ResourceTable";
import EmptyState from "@/components/shared/EmptyState";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import { toast } from "sonner";

export default function ResourcesTab() {
  const { t } = useTranslation(["profile", "common"]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMyResources();
      // Strapi v5 response structure usually has data array
      setResources(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load resources:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleView = (resource) => {
    const url = getFullFileUrl(resource.file?.url);
    if (url) window.open(url, "_blank");
  };

  const handleDownload = (resource) => {
    const url = getFullFileUrl(resource.file?.url);
    if (url) downloadFile(url, resource.file?.name || resource.name);
  };

  const initiateDelete = (resource) => {
    setResourceToDelete(resource);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!resourceToDelete) return;
    setIsDeleting(true);
    try {
      await deleteResource(resourceToDelete.documentId || resourceToDelete.id);
      toast.success(t("common:success", { defaultValue: "Success" }));
      setResources((prev) =>
        prev.filter(
          (r) =>
            (r.documentId || r.id) !==
            (resourceToDelete.documentId || resourceToDelete.id),
        ),
      );
    } catch (error) {
      toast.error(t("common:error", { defaultValue: "Failed to delete" }));
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setResourceToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-brand-gray-500">
        {t("common:loading")}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <EmptyState
        icon={FileSearch}
        title={t("profile:resources.empty_title")}
        description={t("profile:resources.empty_description")}
        actionHref="/community"
        actionLabel={t("profile:resources.explore")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-brand-gray-900">
          {t("profile:resources.title", { defaultValue: "My Resources" })}
        </h2>
        <p className="text-sm text-brand-gray-500">
          {t("profile:resources.description", {
            defaultValue: "Manage your uploaded documents and resources.",
          })}
        </p>
      </div>

      <ResourceTable
        resources={resources}
        onView={handleView}
        onDownload={handleDownload}
        onRemove={initiateDelete}
        showStatus={true}
        t={t}
      />

      <ConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title={t("profile:resources.delete_confirm_title", {
          defaultValue: "Delete Resource",
        })}
        description={t("profile:resources.delete_confirm_description", {
          defaultValue:
            "Are you sure you want to delete this resource? This action cannot be undone.",
        })}
        onConfirm={handleDelete}
        confirmLabel={t("common:delete", { defaultValue: "Delete" })}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

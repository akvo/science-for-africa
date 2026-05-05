import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, File, XIcon } from "lucide-react";
import { getFullFileUrl } from "@/lib/utils";
import { fetchResource } from "@/lib/strapi";

const TYPE_LABEL_KEYS = {
  report: "resources.report",
  publication: "resources.publication",
  "practice-note": "resources.practice_note",
  "case-study": "resources.case_study",
};

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getAuthorName(author) {
  if (!author) return "";
  return (
    author.fullName ||
    `${author.firstName || ""} ${author.lastName || ""}`.trim() ||
    author.username ||
    author.email ||
    ""
  );
}

export default function ViewResourceDialog({
  open,
  onOpenChange,
  resource: resourceProp,
}) {
  const { t } = useTranslation("common");
  const [fullResource, setFullResource] = useState(null);

  const resourceId = resourceProp?.documentId;

  useEffect(() => {
    if (!open || !resourceId) {
      setFullResource(null);
      return;
    }
    fetchResource(resourceId).then((res) => {
      if (res?.data) setFullResource(res.data);
    });
  }, [open, resourceId]);

  const resource = fullResource || resourceProp;

  if (!resource) return null;

  const fileUrl = getFullFileUrl(resource.file?.url);
  const fileSize = formatFileSize(
    resource.file?.size ? resource.file.size * 1024 : 0,
  );
  const uploader = resource.uploadedBy;
  const uploaderName = getAuthorName(uploader);
  const topics = resource.topics || [];

  const handleDownload = async () => {
    if (!fileUrl) return;
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        showCloseButton={false}
        className="!flex !flex-col overflow-hidden !p-0 !gap-0"
      >
        {/* Header — fixed */}
        <div className="shrink-0 flex items-start gap-4 px-6 pt-5 pb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary-100 bg-primary-50 mt-0.5">
            <File className="size-5 text-primary-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-brand-gray-500 mb-1">
              <span className="font-medium text-brand-gray-700">
                {t(TYPE_LABEL_KEYS[resource.resourceType]) ||
                  resource.resourceType}
              </span>
              {fileSize && (
                <>
                  <span className="size-1 rounded-full bg-brand-gray-300" />
                  <span>{fileSize}</span>
                </>
              )}
              <span className="size-1 rounded-full bg-brand-gray-300" />
              <span>
                {t("resources.uploaded")} {formatShortDate(resource.createdAt)}
              </span>
            </div>
            <h2 className="text-lg font-bold text-brand-gray-900 leading-tight">
              {resource.name}
            </h2>
          </div>
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 -mt-1 -mr-1"
              />
            }
          >
            <XIcon />
          </DialogClose>
        </div>

        {/* Topic tags — fixed */}
        {topics.length > 0 && (
          <div className="shrink-0 flex flex-wrap gap-1.5 px-6 pb-4">
            {topics.map((topic) => (
              <Badge
                key={topic}
                variant="outline"
                className="rounded-full bg-primary-50 border-primary-200 text-primary-700 text-xs font-medium px-2.5 py-1"
              >
                #{topic}
              </Badge>
            ))}
          </div>
        )}

        {/* Author row — fixed */}
        {uploaderName && (
          <div className="shrink-0 flex items-center justify-between gap-3 border-t border-brand-gray-100 px-6 py-3">
            <div className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarFallback className="bg-primary-100 text-primary-700 text-xs font-semibold">
                  {getInitials(uploaderName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-brand-gray-900">
                    {uploaderName}
                  </span>
                  {uploader?.roleType && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary-50 text-primary-700">
                      {uploader.roleType}
                    </span>
                  )}
                </div>
                {uploader?.title && (
                  <p className="text-xs text-brand-gray-500">
                    {uploader.title}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              View profile
            </button>
          </div>
        )}

        {/* Description */}
        {resource.description && (
          <div className="flex-1 min-h-0 overflow-y-auto border-t border-brand-gray-100 px-6 py-4">
            <p className="text-sm leading-relaxed text-brand-gray-700">
              {resource.description}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end border-t border-brand-gray-100 px-6 py-4">
          {fileUrl && (
            <Button size="md" className="gap-2" onClick={handleDownload}>
              {t("resources.download")}
              <Download className="size-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

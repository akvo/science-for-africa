import React from "react";
import { File, Trash2, Eye, Download } from "lucide-react";
import { formatFileSize, getFullFileUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const TYPE_LABEL_KEYS = {
  report: "resources.report",
  publication: "resources.publication",
  "practice-note": "resources.practice_note",
  "case-study": "resources.case_study",
};

const STATUS_STYLES = {
  pending: "bg-orange-50 text-orange-600 border-orange-100",
  approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
  declined: "bg-red-50 text-red-600 border-red-100",
};

export default function ResourceTable({
  resources = [],
  onView,
  onDownload,
  onRemove,
  showStatus = false,
  t,
}) {
  if (!resources.length) return null;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-brand-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-gray-50 border-b border-brand-gray-200">
              <th className="px-6 py-3.5 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                {t("resources.table.file_name")}
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider text-right lg:text-left">
                {t("resources.table.file_size")}
              </th>
              <th className="hidden lg:table-cell px-6 py-3.5 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                {t("resources.table.date_uploaded")}
              </th>
              {showStatus && (
                <th className="px-6 py-3.5 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                  {t("resources.table.status")}
                </th>
              )}
              <th className="px-6 py-3.5 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider text-right">
                {t("resources.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-100">
            {resources.map((resource) => {
              const file = resource.file;
              const createdAt = resource.createdAt || resource.publishedAt;
              const status = resource.status || "pending";

              return (
                <tr
                  key={resource.documentId || resource.id}
                  className="hover:bg-brand-gray-25 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gray-100">
                        <File className="size-5 text-primary-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-brand-gray-500 mb-0.5">
                          {t(TYPE_LABEL_KEYS[resource.resourceType]) ||
                            resource.resourceType}
                        </p>
                        <p className="text-sm font-semibold text-brand-gray-900 truncate max-w-50 lg:max-w-md">
                          {resource.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-brand-gray-500 text-right lg:text-left">
                    {file?.size ? formatFileSize(file.size * 1024) : "-"}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-5 text-sm text-brand-gray-500">
                    {createdAt ? format(new Date(createdAt), "yy-MM-dd") : "-"}
                  </td>
                  {showStatus && (
                    <td className="px-6 py-5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full font-medium px-2.5 py-0.5",
                          STATUS_STYLES[status],
                        )}
                      >
                        {t(`resources.status.${status}`)}
                      </Badge>
                    </td>
                  )}
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-brand-gray-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onRemove(resource)}
                        >
                          <span className="hidden sm:inline mr-1">
                            {t("resources.actions.remove")}
                          </span>
                          <Trash2 className="size-4" />
                        </Button>
                      )}

                      {onDownload ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-brand-gray-200 text-brand-gray-700 hover:bg-brand-gray-50"
                          onClick={() => onDownload(resource)}
                        >
                          <span className="hidden sm:inline mr-1">
                            {t("resources.actions.download")}
                          </span>
                          <Download className="size-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full border-brand-gray-200 text-brand-gray-700 hover:bg-brand-gray-50 px-4"
                          onClick={() => onView(resource)}
                        >
                          <span className="hidden sm:inline mr-1">
                            {t("resources.actions.view")}
                          </span>
                          <Eye className="size-4 lg:hidden" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

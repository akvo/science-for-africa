import { useCollaborationStore } from "@/lib/collaboration-store";
import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/button";
import { Globe, Link2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const VISIBILITY_OPTIONS = [
  {
    value: "public",
    labelKey: "visibility.public",
    descriptionKey: "visibility.public_description",
    icon: Globe,
  },
  {
    value: "restricted",
    labelKey: "visibility.restricted",
    descriptionKey: "visibility.restricted_description",
    icon: Link2,
  },
  {
    value: "private",
    labelKey: "visibility.private",
    descriptionKey: "visibility.private_description",
    icon: Lock,
  },
];

export default function StepVisibility() {
  const { t } = useTranslation("community");
  const { formData, updateFormData, prevStep, nextStep } =
    useCollaborationStore();
  const selected = formData.visibility || "public";

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-brand-gray-500">
        {t("visibility.description")}
      </p>

      <div className="flex flex-col gap-3">
        {VISIBILITY_OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateFormData({ visibility: opt.value })}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 text-left transition-colors",
                isSelected
                  ? "border-primary-500 bg-primary-50/30"
                  : "border-brand-gray-200 bg-white hover:border-brand-gray-300",
              )}
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full",
                  isSelected
                    ? "bg-primary-100 text-primary-700"
                    : "bg-brand-gray-100 text-brand-gray-500",
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-brand-gray-900">
                  {t(opt.labelKey)}
                </div>
                <div className="text-sm text-brand-gray-500">
                  {t(opt.descriptionKey)}
                </div>
              </div>
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                  isSelected
                    ? "border-primary-500 bg-primary-500"
                    : "border-brand-gray-300 bg-white",
                )}
              >
                {isSelected && (
                  <svg
                    className="size-3 text-white"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-end pt-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={prevStep} className="rounded-full">
            {t("visibility.back")}
          </Button>
          <Button onClick={nextStep} className="rounded-full">
            {t("visibility.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}

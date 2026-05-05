import { useCollaborationStore } from "@/lib/collaboration-store";
import { Button } from "@/components/ui/button";
import { Globe, Link2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const VISIBILITY_OPTIONS = [
  {
    value: "public",
    label: "Public",
    description:
      "Everyone can view and add posts and comments in this community.",
    icon: Globe,
  },
  {
    value: "restricted",
    label: "With limited access",
    description:
      "Everyone can view posts and comments, but only verified users can add them.",
    icon: Link2,
  },
  {
    value: "private",
    label: "Private",
    description: "Only approved users can see and publish content",
    icon: Lock,
  },
];

export default function StepVisibility() {
  const { formData, updateFormData, prevStep, nextStep } =
    useCollaborationStore();
  const selected = formData.visibility || "public";

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-brand-gray-500">
        Decide who can view and add posts in your community. Only public
        communities are displayed in search results. Important: After setting up
        your community, you will need to submit a request to change the community
        type.
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
                  {opt.label}
                </div>
                <div className="text-sm text-brand-gray-500">
                  {opt.description}
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

      {/* Step dots */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={cn(
                "size-2 rounded-full",
                s === 5
                  ? "bg-primary-500"
                  : "bg-brand-gray-200",
              )}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={prevStep} className="rounded-full">
            Back
          </Button>
          <Button onClick={nextStep} className="rounded-full">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

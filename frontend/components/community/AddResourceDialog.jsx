import { useState, useRef, useCallback } from "react";
import { useTranslation } from "next-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, CheckCircle, XIcon } from "lucide-react";
import { createResource } from "@/lib/strapi";
import { cn } from "@/lib/utils";

const RESOURCE_TYPES = [
  { value: "report", i18nKey: "resources.report" },
  { value: "publication", i18nKey: "resources.publication" },
  { value: "practice-note", i18nKey: "resources.practice_note" },
  { value: "case-study", i18nKey: "resources.case_study" },
];

const RESOURCE_TOPICS = [
  "STI Policy & Governance",
  "Research Funding & Financing",
  "Cybersecurity",
  "Open Science & Data Sharing",
  "One Health",
  "Science Diplomacy",
  "Intellectual Property & Technology Transfer",
  "Evidence-Based Policymaking",
  "Public & Global Health",
  "Epidemiology & Disease Surveillance",
  "Biomedical Research",
  "Digital Health",
  "Health Systems Strengthening",
  "Pharmaceutical & Vaccine Development",
  "Agricultural Innovation",
  "Climate Change & Adaptation",
  "Biodiversity & Conservation",
  "Water Security",
  "Sustainable Energy",
  "Artificial Intelligence & ML",
  "Data Science & Analytics",
  "FinTech & Digital Finance",
  "ICT for Development (ICT4D)",
  "Higher Education & Training",
  "Migration & Mobility",
  "Gender & Social Equity",
];

export default function AddResourceDialog({
  open,
  onOpenChange,
  communityDocumentId,
  onSuccess,
}) {
  const { t } = useTranslation("common");
  const [step, setStep] = useState(1);
  const [resourceType, setResourceType] = useState("report");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const reset = () => {
    setStep(1);
    setResourceType("report");
    setName("");
    setFile(null);
    setSelectedTopics([]);
    setSubmitting(false);
    setShowSuccess(false);
    setError("");
  };

  const handleClose = (nextOpen) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const handleFile = (f) => {
    if (f) {
      setFile(f);
      setError("");
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFile(f);
  }, []);

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const handlePublish = async () => {
    if (!name.trim() || !file) return;
    setSubmitting(true);
    setError("");
    try {
      await createResource({
        name: name.trim(),
        resourceType,
        communityId: communityDocumentId,
        file,
        topics: selectedTopics,
      });
      setShowSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err.message || t("resources.upload_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent size="md" showCloseButton={false}>
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle className="size-6 text-emerald-600" />
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-bold text-brand-gray-900">
                {t("resources.published_title")}
              </h2>
              <p className="text-sm text-brand-gray-500">
                {t("resources.published_description")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="shrink-0 -mt-1 -mr-1 p-1 text-brand-gray-400 hover:text-brand-gray-600"
            >
              <XIcon className="size-5" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-brand-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded border-brand-gray-300" />
              {t("resources.dont_show_again")}
            </label>
            <Button
              size="md"
              className="rounded-full px-8"
              onClick={() => handleClose(false)}
            >
              {t("resources.access")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 2: Topic selection
  if (step === 2) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent size="lg" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>{t("resources.upload_title")}</DialogTitle>
            <DialogDescription>
              {t("resources.choose_topic")}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-brand-gray-200 scrollbar-track-transparent border-t border-brand-gray-100 pt-5">
            <div className="flex flex-wrap gap-2">
              {RESOURCE_TOPICS.map((topic) => {
                const selected = selectedTopics.includes(topic);
                return (
                  <Badge
                    key={topic}
                    role="button"
                    variant="outline"
                    onClick={() => toggleTopic(topic)}
                    className={cn(
                      "px-3.5 py-4 text-sm font-normal rounded-full transition-all duration-300 cursor-pointer",
                      selected
                        ? "bg-primary-50 text-brand-gray-700 border-[#D0D5DD] shadow-[0_1px_2px_0_rgba(16,24,40,0.05),0_0_0_4px_var(--color-primary-50)] active:scale-95"
                        : "bg-white text-brand-gray-700 border-brand-gray-200 shadow-none hover:bg-brand-teal-50 hover:border-brand-teal-200 active:scale-95",
                    )}
                  >
                    {topic}
                  </Badge>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              size="md"
              className="rounded-full min-w-[120px]"
              onClick={() => setStep(1)}
            >
              {t("resources.back")}
            </Button>
            <Button
              size="md"
              className="rounded-full min-w-[120px]"
              disabled={submitting}
              onClick={handlePublish}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              {t("resources.publish")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 1: Upload form
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="md" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>{t("resources.upload_title")}</DialogTitle>
          <DialogDescription>
            {t("resources.upload_description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 border-t border-brand-gray-100 pt-5">
          {/* Resource Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-gray-700">
              {t("resources.select_type")}
            </label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {t(RESOURCE_TYPES.find((rt) => rt.value === resourceType)?.i18nKey)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {RESOURCE_TYPES.map((rt) => (
                  <SelectItem key={rt.value} value={rt.value}>
                    {t(rt.i18nKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resource Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-gray-700">
              {t("resources.resource_name")}<span className="text-red-500">*</span>
            </label>
            <Input
              placeholder={t("resources.name_placeholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-gray-700">
              {t("resources.upload_file")}
            </label>
            <div
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer ${
                dragActive
                  ? "border-primary-400 bg-primary-50"
                  : "border-brand-gray-200 bg-white hover:border-brand-gray-300"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="flex size-10 items-center justify-center rounded-full bg-brand-gray-100 mb-3">
                <Upload className="size-5 text-brand-gray-500" />
              </div>
              {file ? (
                <p className="text-sm font-medium text-brand-gray-700">
                  {file.name}
                </p>
              ) : (
                <>
                  <p className="text-sm text-brand-gray-600">
                    <span className="font-semibold text-primary-600">
                      {t("resources.click_to_upload")}
                    </span>{" "}
                    {t("resources.or_drag_drop")}
                  </p>
                  <p className="mt-1 text-xs text-brand-gray-400">
                    {t("resources.file_hint")}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter variant="block">
          <DialogClose
            render={
              <Button variant="outline" size="md" className="rounded-full">
                {t("resources.cancel")}
              </Button>
            }
          />
          <Button
            size="md"
            className="rounded-full"
            disabled={!name.trim() || !file}
            onClick={() => setStep(2)}
          >
            {t("resources.next")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

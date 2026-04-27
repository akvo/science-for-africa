import { useState, useRef, useCallback } from "react";
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
import { Upload, Loader2, CheckCircle, XIcon } from "lucide-react";
import { createResource } from "@/lib/strapi";

const RESOURCE_TYPES = [
  { value: "report", label: "Report" },
  { value: "publication", label: "Publication" },
  { value: "practice-note", label: "Practice note" },
  { value: "case-study", label: "Case study" },
];

export default function AddResourceDialog({
  open,
  onOpenChange,
  communityDocumentId,
  onSuccess,
}) {
  const [resourceType, setResourceType] = useState("report");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const reset = () => {
    setResourceType("report");
    setName("");
    setFile(null);
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
      });
      setShowSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Failed to upload resource");
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
                Resource has been published
              </h2>
              <p className="text-sm text-brand-gray-500">
                Lorem ipsum dolor sit amet consectetur.
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
              Don&apos;t show again
            </label>
            <Button
              size="md"
              className="rounded-full px-8"
              onClick={() => handleClose(false)}
            >
              Access
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Upload form
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="md" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Upload a resource</DialogTitle>
          <DialogDescription>
            Lorem ipsum dolor sit amet consectetur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 border-t border-brand-gray-100 pt-5">
          {/* Resource Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-gray-700">
              Select resource type
            </label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {RESOURCE_TYPES.find((t) => t.value === resourceType)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {RESOURCE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resource Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-gray-700">
              Resource name<span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Type anything"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-gray-700">
              Upload file
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
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-brand-gray-400">
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </p>
                </>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <DialogFooter variant="block">
          <DialogClose
            render={
              <Button variant="outline" size="md" className="rounded-full">
                Cancel
              </Button>
            }
          />
          <Button
            size="md"
            className="rounded-full"
            disabled={!name.trim() || !file || submitting}
            onClick={handlePublish}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

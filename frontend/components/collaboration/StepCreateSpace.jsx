import { useEffect, useState } from "react";
import { useCollaborationStore } from "@/lib/collaboration-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Bold, Italic, Underline, List, Link } from "lucide-react";
import { fetchCommunities } from "@/lib/strapi";

export default function StepCreateSpace() {
  const { formData, updateFormData, nextStep, prevStep } =
    useCollaborationStore();
  const [errors, setErrors] = useState({});
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  useEffect(() => {
    fetchCommunities()
      .then((res) => {
        setCommunities(res?.data || []);
      })
      .finally(() => setLoadingCommunities(false));
  }, []);

  const charCount = formData.description?.length || 0;

  const validate = () => {
    const newErrors = {};
    if (!formData.communityName) newErrors.communityName = "Select a community";
    if (!formData.title?.trim()) newErrors.title = "Title is required";
    if (formData.title?.length > 200)
      newErrors.title = "Title must be 200 characters or less";
    if (!formData.description?.trim())
      newErrors.description = "Description is required";
    if (formData.description?.length > 275)
      newErrors.description = "Description must be 275 characters or less";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) nextStep();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Community</Label>
          <Select
            value={formData.communityName}
            onValueChange={(val) => updateFormData({ communityName: val })}
            disabled={loadingCommunities}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loadingCommunities
                    ? "Loading communities..."
                    : "Select a community"
                }
              />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {communities.map((c) => (
                <SelectItem
                  key={c.documentId || c.id}
                  value={c.name}
                >
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.communityName && (
            <p className="text-xs text-red-500">{errors.communityName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={formData.title || ""}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="Enter a descriptive title"
            maxLength={200}
          />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <div className="rounded-8 border border-brand-gray-100 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500">
            <div className="flex items-center gap-1 px-3 py-2 border-b border-brand-gray-100 bg-brand-gray-50">
              <button
                type="button"
                className="p-1.5 rounded hover:bg-brand-gray-200 text-brand-gray-500"
                tabIndex={-1}
              >
                <Bold className="size-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded hover:bg-brand-gray-200 text-brand-gray-500"
                tabIndex={-1}
              >
                <Italic className="size-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded hover:bg-brand-gray-200 text-brand-gray-500"
                tabIndex={-1}
              >
                <Underline className="size-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded hover:bg-brand-gray-200 text-brand-gray-500"
                tabIndex={-1}
              >
                <List className="size-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded hover:bg-brand-gray-200 text-brand-gray-500"
                tabIndex={-1}
              >
                <Link className="size-4" />
              </button>
            </div>
            <Textarea
              value={formData.description || ""}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Describe the purpose and goals of this collaboration..."
              maxLength={275}
              className="border-0 rounded-none focus:ring-0 min-h-[120px]"
            />
          </div>
          <div className="flex justify-between">
            {errors.description ? (
              <p className="text-xs text-red-500">{errors.description}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-brand-gray-400">{charCount}/275</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={prevStep} className="rounded-full">
          Back
        </Button>
        <Button onClick={handleNext} className="rounded-full">
          Next
        </Button>
      </div>
    </div>
  );
}

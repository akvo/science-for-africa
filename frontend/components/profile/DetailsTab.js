import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, UploadCloud, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateUserProfile } from "@/lib/strapi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  displayName: z.string().optional(),
  biography: z
    .string()
    .max(275, "Biography must be less than 275 characters")
    .optional(),
  role: z.string().optional(),
  orcidId: z.string().optional(),
  educationLevel: z.string().optional(),
  institutionType: z.string().optional(),
  language: z.string().optional(),
  careerStage: z.string().optional(),
});

const DetailsTab = () => {
  const { t } = useTranslation("common");
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      biography: user?.biography || "",
      role: user?.role || "",
      orcidId: user?.orcidId || "608-429-3268",
      educationLevel: user?.educationLevel || "",
      institutionType: user?.institutionType || "",
      language: user?.languagePreferences?.[0] || "English",
      careerStage: user?.careerStage || "",
    },
  });

  const bioContent = watch("biography", "");
  const charsLeft = 275 - (bioContent?.length || 0);

  const onSave = async (data) => {
    setIsSaving(true);
    try {
      const response = await updateUserProfile(data);
      if (response.data) {
        updateUser(response.data);
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const FormRow = ({ label, description, children, error }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 border-b border-brand-gray-100 last:border-0 items-start">
      <div className="md:col-span-4 transition-all pr-4">
        <Label className="text-[15px] font-bold text-brand-gray-900 mb-1 block">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-brand-gray-500 leading-relaxed font-medium">
            {description}
          </p>
        )}
      </div>
      <div className="md:col-span-8 flex flex-col gap-3">
        {children}
        {error && (
          <p className="text-[11px] text-red-600 font-bold mt-1">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );

  const ViewRow = ({ label, value, badge }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 border-b border-brand-gray-100 last:border-0 items-baseline">
      <div className="md:col-span-4">
        <span className="text-[15px] font-bold text-brand-gray-900">
          {label}
        </span>
      </div>
      <div className="md:col-span-8 flex items-baseline gap-3">
        <span className="text-[15px] text-brand-gray-500 font-medium">
          {value || (
            <span className="italic text-brand-gray-300">Not provided</span>
          )}
        </span>
        {badge}
      </div>
    </div>
  );

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit(onSave)}
        className="animate-in fade-in duration-500"
      >
        {/* Header with buttons */}
        <div className="flex items-center justify-between pb-8 border-b border-brand-gray-100">
          <div>
            <h2 className="text-lg font-bold text-brand-gray-900">
              Personal info
            </h2>
            <p className="text-xs text-brand-gray-500 font-medium">
              Update your photo and personal details here.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-full px-6 h-10 font-bold border-brand-gray-300"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSaving}
              className="rounded-xl px-10 h-10 bg-brand-teal-800 hover:bg-brand-teal-900 font-bold transition-all"
            >
              {isSaving ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : null}
              Save
            </Button>
          </div>
        </div>

        <div className="max-w-4xl">
          <FormRow label="Full name">
            <Input
              defaultValue={user?.fullName || "Stuart Harber"}
              className="max-w-lg h-11 border-brand-gray-200 rounded-xl px-4 text-brand-gray-700"
            />
          </FormRow>

          <FormRow label="Email address">
            <div className="relative max-w-lg group">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400 group-focus-within:text-brand-teal-600"
              />
              <Input
                defaultValue={user?.email || "Stuart.Harber72@yahoo.com"}
                className="h-11 border-brand-gray-200 rounded-xl pl-10 pr-4 text-brand-gray-700"
              />
            </div>
          </FormRow>

          <FormRow
            label="Your photo (Optional)"
            description="This will be displayed on your profile."
          >
            <div className="flex items-center gap-5">
              <div className="size-14 rounded-full bg-brand-teal-50 flex items-center justify-center text-brand-teal-600 shadow-inner">
                <Avatar className="size-10">
                  <AvatarImage src={user?.profilePhoto?.url} />
                  <AvatarFallback className="bg-transparent">
                    <UploadCloud size={20} />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 w-full max-w-lg border-2 border-dashed border-brand-gray-100 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:border-brand-teal-500 hover:bg-brand-teal-50/10 cursor-pointer group transition-all">
                <div className="p-2 bg-brand-gray-50 rounded-full group-hover:bg-brand-teal-50">
                  <UploadCloud
                    size={20}
                    className="text-brand-gray-400 group-hover:text-brand-teal-600"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-brand-gray-700">
                    <span className="text-brand-teal-600 cursor-pointer">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-brand-gray-400 font-medium">
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </p>
                </div>
              </div>
            </div>
          </FormRow>

          <FormRow label="Role">
            <div className="relative max-w-lg">
              <select className="w-full h-11 border border-brand-gray-200 rounded-xl px-4 flex items-center bg-white text-brand-gray-700 text-sm appearance-none font-medium focus:ring-2 focus:ring-brand-teal-500/20 outline-none">
                <option value="">Select</option>
                <option value="Researcher">Researcher</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400"
              />
            </div>
          </FormRow>

          <FormRow label="Education">
            <div className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-bold text-brand-gray-900">
                  Education level
                </Label>
                <div className="relative">
                  <select className="w-full h-11 border border-brand-gray-200 rounded-xl px-4 bg-white text-sm appearance-none font-medium text-brand-gray-700 focus:ring-2 focus:ring-brand-teal-500/20 outline-none">
                    <option value="">Select</option>
                    <option value="Master">Master Degree</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-bold text-brand-gray-900">
                  Type of educational institution
                </Label>
                <Input
                  placeholder="type of educational institution"
                  className="h-11 border-brand-gray-200 rounded-xl px-4 text-brand-gray-700 placeholder:text-brand-gray-300"
                />
              </div>
            </div>
          </FormRow>

          <FormRow label="Institutional affiliation">
            <div className="max-w-lg space-y-4">
              <div className="relative">
                <select className="w-full h-11 border border-brand-gray-200 rounded-xl px-4 bg-white text-sm appearance-none font-medium text-brand-gray-700 focus:ring-2 focus:ring-brand-teal-500/20 outline-none">
                  <option value="">Select org</option>
                  <option value="SFA">Science for Africa</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="rounded-full shadow-sm px-6 h-9 text-xs font-bold border-brand-gray-300"
                >
                  Request
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  className="text-xs font-bold text-brand-gray-500 hover:text-brand-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </FormRow>

          <FormRow
            label="Bio (Optional)"
            description="Write a short introduction."
            error={errors.biography}
          >
            <div className="max-w-lg space-y-2">
              <Textarea
                {...register("biography")}
                rows={6}
                className="border-brand-gray-200 rounded-xl p-4 text-sm font-medium resize-none text-brand-gray-700"
              />
              <p className="text-[11px] text-brand-gray-400 font-bold">
                {charsLeft} characters left
              </p>
            </div>
          </FormRow>

          <FormRow label="Language preferences">
            <div className="relative max-w-lg">
              <select
                {...register("language")}
                className="w-full h-11 border border-brand-gray-200 rounded-xl px-4 bg-white text-sm appearance-none font-medium text-brand-gray-700 focus:ring-2 focus:ring-brand-teal-500/20 outline-none"
              >
                <option value="English">English</option>
                <option value="French">French</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400"
              />
            </div>
          </FormRow>

          <FormRow label="ORCHID">
            <div className="max-w-lg space-y-4">
              <Input
                {...register("orcidId")}
                className="h-11 border-brand-gray-200 rounded-xl px-4 text-brand-gray-700"
              />
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="rounded-full shadow-sm px-6 h-9 text-xs font-bold border-brand-gray-300"
                >
                  Request
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  className="text-xs font-bold text-brand-gray-500 hover:text-brand-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </FormRow>
        </div>
      </form>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header with edit button */}
      <div className="flex items-center justify-between pb-8 border-b border-brand-gray-100">
        <div>
          <h2 className="text-lg font-bold text-brand-gray-900">
            Personal info
          </h2>
          <p className="text-xs text-brand-gray-500 font-medium">
            Update your photo and personal details here.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="rounded-full px-6 h-9 font-bold border-brand-gray-300 shadow-sm transition-all hover:bg-brand-gray-100"
        >
          Edit
        </Button>
      </div>

      <div className="max-w-4xl">
        <ViewRow label="Full name" value={user?.fullName || "Stuart Harber"} />
        <ViewRow
          label="Email address"
          value={user?.email || "Stuart.Harber72@yahoo.com"}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 border-b border-brand-gray-100 items-center">
          <div className="md:col-span-4 transition-all">
            <span className="text-[15px] font-bold text-brand-gray-900">
              Your photo (Optional)
            </span>
            <p className="text-xs text-brand-gray-500 font-medium leading-tight">
              This will be displayed on your profile.
            </p>
          </div>
          <div className="md:col-span-8">
            <Avatar className="size-14 rounded-full border border-brand-gray-100 shadow-sm">
              <AvatarImage src={user?.profilePhoto?.url} />
              <AvatarFallback className="bg-brand-teal-50 text-brand-teal-600">
                <UploadCloud size={20} />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <ViewRow label="Role" value={user?.role || "Researcher"} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 border-b border-brand-gray-100 items-baseline">
          <div className="md:col-span-4">
            <span className="text-[15px] font-bold text-brand-gray-900">
              Education
            </span>
          </div>
          <div className="md:col-span-8 space-y-4">
            <p className="text-[15px] text-brand-gray-500 font-medium">
              {user?.educationLevel || "Master degree in Computer science"}
            </p>
            <p className="text-[15px] text-brand-gray-500 font-medium">
              {user?.institution?.name || "University of Sydney"}
            </p>
          </div>
        </div>

        <ViewRow
          label="Institutional affiliation"
          value={user?.institution?.name || "Science for Africa"}
          badge={
            <Badge
              variant="outline"
              className="border-brand-orange-200 text-brand-orange-600 bg-brand-orange-50 font-bold tracking-tight text-[10px] px-2 py-0"
            >
              Pending
            </Badge>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 border-b border-brand-gray-100 items-start">
          <div className="md:col-span-4 transition-all">
            <span className="text-[15px] font-bold text-brand-gray-900 block">
              Bio (Optional)
            </span>
            <p className="text-xs text-brand-gray-500 font-medium leading-tight">
              Write a short introduction.
            </p>
          </div>
          <div className="md:col-span-8">
            <p className="text-[15px] text-brand-gray-500 font-medium leading-relaxed max-w-2xl">
              {user?.biography ||
                "Lorem ipsum dolor sit amet consectetur. Libero adipiscing justo orci convallis sed risus arcu sit enim. Accumsan dapibus ut nunc sed pulvinar lectus. Etiam magna eget vitae eget. Posuere aliquam accumsan penatibus in tortor quam tellus orci."}
            </p>
          </div>
        </div>

        <ViewRow
          label="Language preferences"
          value={user?.languagePreferences?.[0] || "English"}
        />
        <ViewRow label="ORCHID" value={user?.orcidId || "608-429-3268"} />
      </div>
    </div>
  );
};

export default DetailsTab;

import React from "react";
import Image from "next/image";
import {
  Mail,
  UploadCloud,
  ChevronDown,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormRow } from "./SharedComponents";

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  displayName: z.string().optional().nullable(),
  biography: z
    .string()
    .max(275, "Biography must be less than 275 characters")
    .optional()
    .nullable(),
  roleType: z.string().optional().nullable(),
  orcidId: z.string().optional().nullable(),
  educationLevel: z.string().optional().nullable(),
  educationInstitutionName: z.string().optional().nullable(),
  institutionType: z.string().optional().nullable(),
  affiliationInstitution: z
    .object({
      id: z.string().optional().nullable(),
      name: z.string().optional().nullable(),
    })
    .optional(),
  language: z.string().optional().nullable(),
  careerStage: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
});

const DetailsEditMode = ({ user, t, onCancel, onSave, isSaving }) => {
  const fileInputRef = React.useRef(null);
  const [photoPreview, setPhotoPreview] = React.useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      displayName: user?.displayName || "",
      biography: user?.biography || "",
      roleType: user?.roleType || "",
      orcidId: user?.orcidId || "",
      educationLevel: user?.educationLevel || "",
      language: user?.languagePreferences || "en",
      educationInstitutionName: user?.educationInstitutionName || "",
      affiliationInstitution: {
        id: user?.institution?.id?.toString() || "",
        name: user?.institutionName || "",
      },
    },
  });

  const bioContent = watch("biography", "");
  const charsLeft = 275 - (bioContent?.length || 0);

  const selectedInstitutionId = watch("affiliationInstitution.id");
  const customInstitutionName = watch("affiliationInstitution.name");

  React.useEffect(() => {
    if (selectedInstitutionId && selectedInstitutionId !== "") {
      setValue("affiliationInstitution.name", "");
    }
  }, [selectedInstitutionId, setValue]);

  React.useEffect(() => {
    if (customInstitutionName && customInstitutionName !== "") {
      setValue("affiliationInstitution.id", "");
    }
  }, [customInstitutionName, setValue]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setPhotoPreview(URL.createObjectURL(file));
      setValue("profilePhoto", file);
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data) => onSave(data, setPhotoPreview))}
      className="animate-in fade-in duration-500"
    >
      <div className="flex items-center justify-between pb-9 border-b border-brand-gray-100">
        <div>
          <h2 className="text-lg font-bold text-brand-gray-900">
            {t("details.title")}
          </h2>
          <p className="text-xs text-brand-gray-500 font-medium">
            {t("details.description")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            className="px-6 font-bold"
          >
            {t("details.cancel_button")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSaving}
            className="px-10 font-bold shadow-sm"
          >
            {isSaving && <Loader2 className="animate-spin mr-2" size={16} />}
            {t("details.save_button")}
          </Button>
        </div>
      </div>

      <div>
        <FormRow label={t("details.full_name")} error={errors.fullName}>
          <Input
            {...register("fullName")}
            className="w-full h-11 border-brand-gray-200 rounded-xl px-4 text-brand-gray-700"
          />
        </FormRow>

        <FormRow label={t("details.email")}>
          <div className="relative w-full group">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400 group-focus-within:text-brand-teal-600"
            />
            <Input
              {...register("email")}
              disabled
              className="h-11 border-brand-gray-200 rounded-xl pl-10 pr-4 bg-brand-gray-50 text-brand-gray-500 cursor-not-allowed"
            />
          </div>
        </FormRow>

        <FormRow
          label={t("details.photo_label")}
          description={t("details.photo_description")}
        >
          <div className="flex items-center gap-5">
            <div className="relative size-14 rounded-full bg-brand-teal-50 flex items-center justify-center text-brand-teal-600 shadow-inner overflow-hidden">
              {photoPreview || user?.profilePhoto?.url ? (
                <Image
                  src={photoPreview || user.profilePhoto.url}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <UserIcon size={24} />
              )}
            </div>
            <div className="flex-1 w-full">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={handlePhotoClick}
                className="w-full flex flex-col items-center justify-center border border-brand-gray-200 rounded-xl py-5 px-4 bg-white cursor-pointer hover:bg-brand-gray-50 hover:border-brand-teal-200 transition-all group shadow-sm"
              >
                <div className="size-10 rounded-full bg-brand-gray-100 flex items-center justify-center text-brand-gray-500 mb-3 group-hover:bg-brand-teal-50 group-hover:text-brand-teal-600 transition-colors">
                  <UploadCloud
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="text-sm text-center mb-1">
                  <span className="font-bold text-brand-teal-600 hover:underline">
                    {t("details.click_to_upload")}
                  </span>{" "}
                  <span className="text-brand-gray-600 font-medium">
                    {t("details.drag_drop")}
                  </span>
                </div>
                <p className="text-[11px] text-brand-gray-400 font-medium">
                  {t("details.upload_hint")}
                </p>
              </div>
            </div>
          </div>
        </FormRow>

        <FormRow label={t("details.role")} error={errors.roleType}>
          <div className="w-full relative group">
            <select
              {...register("roleType")}
              className="w-full h-11 border border-brand-gray-200 rounded-xl px-4 bg-white text-sm appearance-none font-medium text-brand-gray-700 focus:ring-2 focus:ring-brand-teal-500/20 outline-none"
            >
              <option value="">{t("details.role_placeholder")}</option>
              {[
                "Researcher",
                "Principal Investigator / Lab Lead",
                "Program Manager / Funder representative",
                "Journal Editor / Publisher",
                "Institution administrator / librarian",
                "Public official / Public policy person",
                "Other",
              ].map((role) => (
                <option key={role} value={role}>
                  {t(`roles.${role}`)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray-400 pointer-events-none group-focus-within:text-brand-teal-600"
            />
          </div>
        </FormRow>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 border-b border-brand-gray-100 items-start">
          <div className="md:col-span-4">
            <span className="text-[15px] font-bold text-brand-gray-900">
              {t("details.education_title")}
            </span>
          </div>
          <div className="md:col-span-8 flex flex-col gap-5">
            <div className="w-full relative group">
              <select
                {...register("educationLevel")}
                className="w-full h-11 border border-brand-gray-200 rounded-xl px-4 bg-white text-sm appearance-none font-medium text-brand-gray-700 focus:ring-2 focus:ring-brand-teal-500/20 outline-none"
              >
                <option value="">Select level</option>
                {[
                  "High School",
                  "Associate Degree",
                  "Bachelor's Degree",
                  "Master's Degree",
                  "Doctorate (PhD / MD / etc.)",
                  "Post-Doctorate",
                  "Other",
                ].map((level) => (
                  <option key={level} value={level}>
                    {t(`education_levels.${level}`)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray-400 pointer-events-none"
              />
            </div>
            <Input
              {...register("educationInstitutionName")}
              placeholder={t("details.university_placeholder")}
              className="w-full h-11 border-brand-gray-200 rounded-xl px-4 text-sm font-medium text-brand-gray-700"
            />
          </div>
        </div>

        <FormRow
          label={t("details.affiliation_title")}
          error={
            errors["affiliationInstitution.id"] ||
            errors["affiliationInstitution.name"]
          }
        >
          <div className="w-full space-y-4">
            <div className="relative group">
              <select
                {...register("affiliationInstitution.id")}
                className="w-full h-11 border border-brand-gray-200 rounded-xl px-4 bg-white text-sm appearance-none font-medium text-brand-gray-700 focus:ring-2 focus:ring-brand-teal-500/20 outline-none"
              >
                <option value="">Select official institution</option>
                <option value="1">Akvo</option>
                <option value="2">Science for Africa</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray-400 pointer-events-none"
              />
            </div>
            <div className="space-y-4">
              <Input
                {...register("affiliationInstitution.name")}
                placeholder={t("details.affiliation_placeholder")}
                className="h-11 border-brand-gray-200 rounded-xl px-4 text-sm font-medium text-brand-gray-700 w-full"
              />
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="px-8 rounded-full text-sm h-10 border-brand-teal-900 text-brand-teal-900 hover:bg-brand-teal-50 hover:text-brand-teal-700 transition-all font-outfit"
                >
                  {t("details.request_button")}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setValue("affiliationInstitution.id", "");
                    setValue("affiliationInstitution.name", "");
                  }}
                  className="text-sm font-outfit text-brand-gray-500 hover:text-brand-teal-600 hover:bg-transparent px-0"
                >
                  {t("details.cancel_button")}
                </Button>
              </div>
            </div>
          </div>
        </FormRow>

        <FormRow
          label={t("details.biography_label")}
          description={t("details.biography_placeholder")}
          error={errors.biography}
        >
          <div className="w-full space-y-2">
            <Textarea
              {...register("biography")}
              rows={6}
              className="border-brand-gray-200 rounded-xl p-4 text-sm font-medium resize-none text-brand-gray-700"
            />
            <p className="text-[11px] text-brand-gray-400 font-bold">
              {charsLeft} {t("details.characters_left")}
            </p>
          </div>
        </FormRow>

        <FormRow label={t("details.language_label")}>
          <div className="w-full relative group">
            <select
              {...register("language")}
              className="w-full h-11 border border-brand-gray-200 rounded-xl px-4 bg-white text-sm appearance-none font-medium text-brand-gray-700 focus:ring-2 focus:ring-brand-teal-500/20 outline-none"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray-400 pointer-events-none"
            />
          </div>
        </FormRow>

        <FormRow label={t("details.orcid_label")} error={errors.orcidId}>
          <div className="space-y-4 w-full">
            <Input
              {...register("orcidId")}
              className="h-11 border-brand-gray-200 rounded-xl px-4 text-sm font-medium text-brand-gray-700 w-full"
            />
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                type="button"
                className="px-8 rounded-full text-sm h-10 border-brand-teal-900 text-brand-teal-900 hover:bg-brand-teal-50 hover:text-brand-teal-700 transition-all font-outfit"
              >
                {t("details.request_button")}
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => setValue("orcidId", "")}
                className="text-sm font-outfit text-brand-gray-500 hover:text-brand-teal-600 hover:bg-transparent px-0"
              >
                {t("details.cancel_button")}
              </Button>
            </div>
          </div>
        </FormRow>
      </div>
    </form>
  );
};

export default DetailsEditMode;

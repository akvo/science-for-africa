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

      <div className="max-w-4xl">
        <FormRow label={t("details.full_name")} error={errors.fullName}>
          <Input
            {...register("fullName")}
            className="max-w-lg h-11 border-brand-gray-200 rounded-xl px-4 text-brand-gray-700"
          />
        </FormRow>

        <FormRow label={t("details.email")}>
          <div className="relative max-w-lg group">
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
            <div className="flex-1 max-w-sm">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={handlePhotoClick}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-brand-gray-200 rounded-xl py-3 text-brand-gray-500 hover:border-brand-teal-500 hover:text-brand-teal-600 transition-all group"
              >
                <UploadCloud
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-xs font-bold font-outfit uppercase tracking-wider">
                  {t("details.click_to_upload")}
                </span>
              </button>
              <p className="text-[10px] text-brand-gray-400 mt-2 font-medium">
                {t("details.upload_hint")}
              </p>
            </div>
          </div>
        </FormRow>

        <FormRow label={t("details.role")} error={errors.roleType}>
          <div className="max-w-lg relative group">
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
            <div className="max-w-lg relative group">
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
              className="max-w-lg h-11 border-brand-gray-200 rounded-xl px-4 text-sm font-medium text-brand-gray-700"
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
          <div className="max-w-lg space-y-4">
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
            <div className="flex items-center gap-3">
              <Input
                {...register("affiliationInstitution.name")}
                placeholder={t("details.affiliation_placeholder")}
                className="h-11 border-brand-gray-200 rounded-xl px-4 text-sm font-medium text-brand-gray-700"
              />
              {(selectedInstitutionId || customInstitutionName) && (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setValue("affiliationInstitution.id", "");
                    setValue("affiliationInstitution.name", "");
                  }}
                  className="text-xs font-bold font-outfit text-brand-gray-500"
                >
                  {t("details.cancel_button")}
                </Button>
              )}
              {!selectedInstitutionId && !customInstitutionName && (
                <Button
                  variant="outline"
                  type="button"
                  className="px-6 font-bold text-xs h-11 border-brand-orange-200 text-brand-orange-600 hover:bg-brand-orange-50 hover:text-brand-orange-700 whitespace-nowrap"
                >
                  {t("details.request_button")}
                </Button>
              )}
            </div>
          </div>
        </FormRow>

        <FormRow
          label={t("details.biography_label")}
          description={t("details.biography_placeholder")}
          error={errors.biography}
        >
          <div className="max-w-lg space-y-2">
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
          <div className="max-w-lg relative group">
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
          <div className="flex items-center gap-3 max-w-lg">
            <Input
              {...register("orcidId")}
              className="h-11 border-brand-gray-200 rounded-xl px-4 text-sm font-medium text-brand-gray-700"
            />
            {!watch("orcidId") && (
              <Button
                variant="outline"
                type="button"
                className="px-6 font-bold text-xs h-11 border-brand-orange-200 text-brand-orange-600 hover:bg-brand-orange-50 hover:text-brand-orange-700 whitespace-nowrap"
              >
                {t("details.request_button")}
              </Button>
            )}
            {watch("orcidId") && (
              <Button
                variant="ghost"
                type="button"
                onClick={() => setValue("orcidId", "")}
                className="text-xs font-bold font-outfit text-brand-gray-500"
              >
                {t("details.cancel_button")}
              </Button>
            )}
          </div>
        </FormRow>
      </div>
    </form>
  );
};

export default DetailsEditMode;

import React, { useState } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Mail,
  UploadCloud,
  ChevronDown,
  User as UserIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateUserProfile } from "@/lib/strapi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchFromStrapi } from "@/lib/strapi";

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
});

const DetailsTab = () => {
  const { t } = useTranslation("profile");
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    const loadInstitutions = async () => {
      const resp = await fetchFromStrapi("/institutions?sort=name:asc");
      if (resp?.data) {
        setInstitutions(resp.data);
      }
    };
    loadInstitutions();
  }, []);

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
      displayName: user?.displayName || user?.fullName || "",
      biography: user?.biography || "",
      roleType: user?.roleType || "",
      orcidId: user?.orcidId || "",
      educationLevel: user?.educationLevel || "",
      institutionType: user?.institutionType || "",
      educationInstitutionName: user?.educationInstitutionName || "",
      affiliationInstitution: {
        id: user?.institution?.id || "",
        name: user?.institutionName || "",
      },
      language: user?.languagePreferences?.[0] || "English",
      careerStage: user?.careerStage || "",
      fullName: user?.fullName || "",
      email: user?.email || "",
    },
  });

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setPhotoPreview(URL.createObjectURL(file));
      setValue("profilePhoto", file);
    }
  };

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

  React.useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || "",
        email: user.email || "",
        displayName: user.displayName || "",
        biography: user.biography || "",
        roleType: user.roleType || "",
        orcidId: user.orcidId || "",
        educationLevel: user.educationLevel || "",
        language: user.languagePreferences || "en",
        educationInstitutionName: user.educationInstitutionName || "",
        affiliationInstitution: {
          id: user.institution?.id?.toString() || "",
          name: user.institutionName || "",
        },
      });
    }
  }, [user, reset]);

  const bioContent = watch("biography", "");
  const charsLeft = 275 - (bioContent?.length || 0);

  const onSave = async (data) => {
    setIsSaving(true);
    try {
      // 1. Handle Photo Upload if needed
      if (data.profilePhoto instanceof File) {
        const formData = new FormData();
        formData.append("files", data.profilePhoto);

        const uploadResp = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${useAuthStore.getState().token}`,
            },
            body: formData,
          },
        );
        const uploadData = await uploadResp.json();
        if (uploadData?.[0]?.id) {
          data.profilePhoto = uploadData[0].id;
        }
      }

      // 2. Update Profile
      const response = await updateUserProfile(data);

      // 3. Update Global State
      updateUser(response);

      if (response) {
        toast.success(t("details.save_success"));
        setIsEditing(false);
        setPhotoPreview(null);
      } else {
        toast.error(t("details.save_error"));
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const FormRow = ({ label, description, children, error }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-4 border-b border-brand-gray-100 last:border-0 items-start">
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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 pb-9 border-b border-brand-gray-100 last:border-0 items-baseline">
      <div className="md:col-span-4">
        <span className="text-[15px] font-bold text-brand-gray-900">
          {label}
        </span>
      </div>
      <div className="md:col-span-8 flex items-baseline gap-3">
        <span className="text-[15px] text-brand-gray-500 font-medium">
          {value || (
            <span className="italic text-brand-gray-300">
              {t("details.not_provided")}
            </span>
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
              onClick={() => setIsEditing(false)}
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
          <FormRow label={t("details.full_name")}>
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
                  className="hidden"
                  accept="image/*"
                />
                <div
                  onClick={handlePhotoClick}
                  className="relative border-2 border-dashed border-brand-gray-200 rounded-2xl p-6 transition-all cursor-pointer hover:border-brand-teal-300 hover:bg-brand-teal-50/30 group"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-2 bg-brand-gray-50 rounded-full group-hover:bg-brand-teal-50">
                      <UploadCloud
                        size={20}
                        className="text-brand-gray-400 group-hover:text-brand-teal-600"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-brand-gray-700">
                        <span className="text-brand-teal-600 cursor-pointer">
                          {t("details.click_to_upload")}
                        </span>{" "}
                        {t("details.drag_drop")}
                      </p>
                      <p className="text-xs text-brand-gray-400 font-medium">
                        {t("details.upload_hint")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FormRow>

          <FormRow label={t("details.role")}>
            <div className="relative max-w-lg">
              <select
                {...register("roleType")}
                className="w-full h-11 border border-brand-gray-200 rounded-xl px-4 flex items-center bg-white text-brand-gray-700 text-sm appearance-none font-medium focus:ring-2 focus:ring-brand-teal-500/20 outline-none"
              >
                <option value="">{t("details.role_placeholder")}</option>
                {Object.keys(t("roles", { returnObjects: true })).map((key) => (
                  <option key={key} value={key}>
                    {t(`roles.${key}`)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400"
              />
            </div>
          </FormRow>

          <FormRow label={t("details.education_title")}>
            <div className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <Label className="text-[13px] font-bold text-brand-gray-900">
                  {t("details.education_level_label")}
                </Label>
                <div className="relative">
                  <select
                    {...register("educationLevel")}
                    className="w-full h-11 border border-brand-gray-200 rounded-xl px-4 bg-white text-sm appearance-none font-medium text-brand-gray-700 focus:ring-2 focus:ring-brand-teal-500/20 outline-none"
                  >
                    <option value="">
                      {t("details.education_level_placeholder")}
                    </option>
                    {Object.keys(
                      t("education_levels", { returnObjects: true }),
                    ).map((key) => (
                      <option key={key} value={key}>
                        {t(`education_levels.${key}`)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-bold text-brand-gray-900">
                  {t("details.university_label")}
                </Label>
                <Input
                  {...register("educationInstitutionName")}
                  placeholder={t("details.university_placeholder")}
                  className="h-11 border-brand-gray-200 rounded-xl px-4 text-brand-gray-700 placeholder:text-brand-gray-300"
                />
              </div>
            </div>
          </FormRow>

          <FormRow label={t("details.affiliation_title")}>
            <div className="max-w-lg space-y-4">
              <div className="relative">
                <select
                  {...register("affiliationInstitution.id")}
                  className="w-full h-11 border border-brand-gray-200 rounded-xl px-4 bg-white text-sm appearance-none font-medium text-brand-gray-700 focus:ring-2 focus:ring-brand-teal-500/20 outline-none"
                >
                  <option value="">
                    {t("details.affiliation_placeholder")}
                  </option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400"
                />
              </div>

              {!selectedInstitutionId && (
                <div className="space-y-1.5 slide-in-from-top-1 animate-in duration-200">
                  <Label className="text-[11px] font-bold text-brand-gray-400 ml-1">
                    {t("details.custom_institution_label", {
                      defaultValue:
                        "Or type your institution name if not listed",
                    })}
                  </Label>
                  <Input
                    {...register("affiliationInstitution.name")}
                    placeholder={t("details.affiliation_placeholder")}
                    className="h-11 border-brand-gray-200 rounded-xl px-4 text-brand-gray-700 placeholder:text-brand-gray-300"
                  />
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="px-6 h-9 text-xs font-bold font-outfit"
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
                  className="text-xs font-bold font-outfit text-brand-gray-500"
                >
                  {t("details.cancel_button")}
                </Button>
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

          <FormRow label="Language preferences">
            <div className="relative max-w-lg">
              <select
                {...register("language")}
                className="w-full h-11 border border-brand-gray-200 rounded-xl px-4 bg-white text-sm appearance-none font-medium text-brand-gray-700 focus:ring-2 focus:ring-brand-teal-500/20 outline-none"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400"
              />
            </div>
          </FormRow>

          <FormRow label={t("details.orcid_label")}>
            <div className="max-w-lg space-y-4">
              <Input
                {...register("orcidId")}
                className="h-11 border-brand-gray-200 rounded-xl px-4 text-brand-gray-700"
              />
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="px-6 h-9 text-xs font-bold"
                >
                  {t("details.request_button")}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  className="text-xs font-bold"
                >
                  {t("details.cancel_button")}
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
      <div className="flex items-center justify-between pb-9 border-b border-brand-gray-100">
        <div>
          <h2 className="text-lg font-bold text-brand-gray-900">
            {t("details.title")}
          </h2>
          <p className="text-xs text-brand-gray-500 font-medium">
            {t("details.description")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="px-6 font-bold shadow-sm"
        >
          {t("details.edit_button")}
        </Button>
      </div>

      <div className="max-w-4xl">
        <ViewRow
          label={t("details.full_name")}
          value={user?.fullName || "Stuart Harber"}
        />
        <ViewRow
          label={t("details.email")}
          value={user?.email || "Stuart.Harber72@yahoo.com"}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 pb-9 border-b border-brand-gray-100 items-center">
          <div className="md:col-span-4 transition-all">
            <span className="text-[15px] font-bold text-brand-gray-900">
              {t("details.photo_label")}
            </span>
            <p className="text-xs text-brand-gray-500 font-medium leading-tight">
              {t("details.photo_description")}
            </p>
          </div>
          <div className="md:col-span-8">
            <Avatar className="size-14 rounded-full border border-brand-gray-100 shadow-sm relative overflow-hidden">
              {user?.profilePhoto?.url ? (
                <Image
                  src={user.profilePhoto.url}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-brand-teal-50 text-brand-teal-600">
                  <UserIcon size={20} />
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </div>

        <ViewRow
          label={t("details.role")}
          value={user?.roleType ? t(`roles.${user.roleType}`) : null}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 border-b border-brand-gray-100 items-baseline">
          <div className="md:col-span-4">
            <span className="text-[15px] font-bold text-brand-gray-900">
              {t("details.education_title")}
            </span>
          </div>
          <div className="md:col-span-8 space-y-4">
            <p className="text-[15px] text-brand-gray-500 font-medium">
              {user?.educationLevel
                ? t(`education_levels.${user.educationLevel}`)
                : t("details.not_provided")}
            </p>
            <p className="text-[15px] text-brand-gray-500 font-medium">
              {user?.educationInstitutionName || t("details.not_provided")}
            </p>
          </div>
        </div>

        <ViewRow
          label={t("details.affiliation_title")}
          value={
            user?.institution?.name ||
            user?.institutionName ||
            t("details.not_provided")
          }
          badge={
            <Badge
              variant="outline"
              className="border-brand-orange-200 text-brand-orange-600 bg-brand-orange-50 font-bold tracking-tight text-[10px] px-2 py-0"
            >
              Pending
            </Badge>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 pb-9 border-b border-brand-gray-100 items-start">
          <div className="md:col-span-4 transition-all">
            <span className="text-[15px] font-bold text-brand-gray-900 block">
              {t("details.biography_label")}
            </span>
            <p className="text-xs text-brand-gray-500 font-medium leading-tight">
              {t("details.biography_placeholder")}
            </p>
          </div>
          <div className="md:col-span-8">
            <p className="text-[15px] text-brand-gray-500 font-medium leading-relaxed max-w-2xl">
              {user?.biography || t("details.not_provided")}
            </p>
          </div>
        </div>

        <ViewRow
          label="Language preferences"
          value={user?.languagePreferences?.[0] || "English"}
        />
        <ViewRow
          label={t("details.orcid_label")}
          value={user?.orcidId || t("details.not_provided")}
        />
      </div>
    </div>
  );
};

export default DetailsTab;

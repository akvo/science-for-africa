import React from "react";
import Image from "next/image";
import { Mail, UploadCloud, User as UserIcon, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormRow } from "./SharedComponents";
import {
  ROLE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
} from "@/lib/onboarding-constants";
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
  email: z.string().optional().nullable(),
});

const DetailsEditMode = ({ user, t, onCancel, onSave, isSaving }) => {
  const fileInputRef = React.useRef(null);
  const [photoPreview, setPhotoPreview] = React.useState(null);
  const [institutions, setInstitutions] = React.useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = React.useState(false);
  const [showRequestInstitution, setShowRequestInstitution] =
    React.useState(false);

  React.useEffect(() => {
    if (user?.institutionName) {
      setShowRequestInstitution(true);
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
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
      setShowRequestInstitution(false);
    }
  }, [selectedInstitutionId, setValue]);

  React.useEffect(() => {
    if (customInstitutionName && customInstitutionName !== "") {
      setValue("affiliationInstitution.id", "");
    }
  }, [customInstitutionName, setValue]);

  React.useEffect(() => {
    async function getInstitutions() {
      setLoadingInstitutions(true);
      try {
        const response = await fetchFromStrapi("/institutions?sort=name:asc");
        if (response?.data) {
          setInstitutions(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch institutions:", err);
      } finally {
        setLoadingInstitutions(false);
      }
    }
    getInstitutions();
  }, []);

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
            <Controller
              name="roleType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full h-11 border-brand-gray-200 rounded-xl px-4 text-sm font-medium text-brand-gray-700">
                    <SelectValue>
                      {field.value
                        ? t(`roles.${field.value}`, {
                            defaultValue: field.value,
                          })
                        : t("details.role_placeholder")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role} value={role}>
                        {t(`roles.${role}`, { defaultValue: role })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-brand-gray-900">
                {t("details.education_level_label")}
              </Label>
              <div className="relative group">
                <Controller
                  name="educationLevel"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full h-11 border-brand-gray-200 rounded-xl px-4 text-sm font-medium text-brand-gray-700">
                        <SelectValue>
                          {field.value
                            ? t(`education_levels.${field.value}`, {
                                defaultValue: field.value,
                              })
                            : "Select"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVEL_OPTIONS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {t(`education_levels.${level}`, {
                              defaultValue: level,
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="w-full space-y-2">
              <Label className="text-sm font-medium text-brand-gray-900">
                {t("details.university_label")}
              </Label>
              <Input
                {...register("educationInstitutionName")}
                placeholder={t("details.university_placeholder")}
                className="w-full h-11 border-brand-gray-200 rounded-xl px-4 text-sm font-medium text-brand-gray-700 placeholder:text-brand-gray-400"
              />
            </div>
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
              <Controller
                name="affiliationInstitution.id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-11 border-brand-gray-200 rounded-xl px-4 text-sm font-medium text-brand-gray-700">
                      <SelectValue>
                        {field.value
                          ? institutions.find(
                              (i) => i.id.toString() === field.value.toString(),
                            )?.name || field.value
                          : t("details.affiliation_placeholder")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {loadingInstitutions ? (
                        <div className="p-2 text-sm text-brand-gray-400 flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin" />
                          Loading...
                        </div>
                      ) : (
                        institutions.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id.toString()}>
                            {inst.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {showRequestInstitution ? (
              <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
                <Input
                  {...register("affiliationInstitution.name")}
                  placeholder="Type your primary institution"
                  className="h-11 border-brand-gray-200 rounded-xl px-4 text-sm font-medium text-brand-gray-700 w-full"
                />
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setShowRequestInstitution(false);
                    setValue("affiliationInstitution.name", "");
                  }}
                  className="text-sm font-bold text-brand-teal-600 hover:bg-brand-teal-50 px-0 ml-auto flex"
                >
                  Cancel Request
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowRequestInstitution(true)}
                  className="px-8 rounded-full text-sm h-10 border-brand-teal-800 text-brand-teal-800 hover:bg-brand-teal-50 transition-all font-outfit"
                >
                  {t("details.request_button")}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setValue("affiliationInstitution.id", "");
                  }}
                  className="text-sm font-medium text-brand-gray-500 hover:text-brand-teal-600 hover:bg-transparent px-0"
                >
                  {t("details.cancel_button")}
                </Button>
              </div>
            )}
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
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-11 border-brand-gray-200 rounded-xl px-4 text-sm font-medium text-brand-gray-700">
                    <SelectValue>
                      {field.value
                        ? t(`languages.${field.value}`, {
                            defaultValue: field.value,
                          })
                        : ""}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t("languages.en")}</SelectItem>
                    <SelectItem value="fr">{t("languages.fr")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
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

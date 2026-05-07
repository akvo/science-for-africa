import React from "react";
import Image from "next/image";
import { User as UserIcon, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ViewRow } from "./SharedComponents";
import VerificationBadge from "@/components/shared/VerificationBadge";
import { getStrapiMedia, validateOrcid } from "@/lib/strapi";
import { useTranslation } from "next-i18next";

const DetailsViewMode = ({ user, t, onEdit, onUserUpdate }) => {
  const { t: tCommon } = useTranslation("common");
  const [validating, setValidating] = React.useState(false);
  const [orcidError, setOrcidError] = React.useState(null);
  const [orcidInput, setOrcidInput] = React.useState("");

  const handleValidate = async (orcidId) => {
    if (!orcidId?.trim()) return;
    setValidating(true);
    setOrcidError(null);
    const res = await validateOrcid(orcidId.trim());
    setValidating(false);
    if (res?.data?.verified) {
      onUserUpdate?.();
    } else {
      setOrcidError(res?.error || tCommon("verification.orcid_verify_failed"));
    }
  };
  return (
    <div className="animate-in fade-in duration-500">
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
          onClick={onEdit}
          className="px-6 font-bold shadow-sm"
        >
          {t("details.edit_button")}
        </Button>
      </div>

      <div className="max-w-4xl">
        <ViewRow
          label={t("details.full_name")}
          value={user?.fullName}
          t={t}
          badge={<VerificationBadge verified={user?.verified} type="user" />}
        />
        <ViewRow label={t("details.email")} value={user?.email} t={t} />

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
                  src={getStrapiMedia(user.profilePhoto.url)}
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
          t={t}
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
              {user?.highestEducationInstitution?.name ||
                user?.educationInstitutionName ||
                t("details.not_provided")}
            </p>
          </div>
        </div>

        <ViewRow
          label={t("details.affiliation_title")}
          value={
            user?.institutionMemberships?.[0]?.institution?.name ||
            user?.institution?.name ||
            user?.institutionName ||
            t("details.not_provided")
          }
          t={t}
          badge={
            (user?.institutionMemberships?.[0]?.institution ||
              user?.institution ||
              user?.institutionName) && (
              <VerificationBadge
                verified={
                  user?.institutionMemberships?.[0]?.institution?.verified ||
                  user?.institution?.verified
                }
                type="institution"
              />
            )
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
          label={t("details.language_label")}
          value={t(`languages.${user?.languagePreferences || "en"}`)}
          t={t}
        />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4 pb-9 border-b border-brand-gray-100 items-start">
          <div className="md:col-span-4 pt-2">
            <span className="text-[15px] font-bold text-brand-gray-900">
              {t("details.orcid_label")}
            </span>
          </div>
          <div className="md:col-span-8 space-y-2">
            {user?.verified && user?.orcidId ? (
              <div className="flex items-center gap-2 h-11">
                <CheckCircle2 className="size-4 text-green-600 shrink-0" />
                <span className="text-[15px] font-medium text-brand-gray-700">
                  {user.orcidId}
                </span>
                <span className="text-xs text-green-600 font-medium">
                  {tCommon("verification.verified")}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="0000-0000-0000-0000"
                    value={user?.orcidId || orcidInput}
                    onChange={(e) => setOrcidInput(e.target.value)}
                    disabled={!!user?.orcidId}
                    className="h-11 border-brand-gray-200 rounded-xl px-4 text-sm font-medium text-brand-gray-700 max-w-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={validating || !(user?.orcidId || orcidInput.trim())}
                    onClick={() => handleValidate(user?.orcidId || orcidInput)}
                    className="rounded-full text-xs h-10 px-6 border-brand-teal-800 text-brand-teal-800 hover:bg-brand-teal-50 shrink-0"
                  >
                    {validating ? (
                      <>
                        <Loader2 className="size-3 animate-spin mr-1" />
                        {tCommon("verification.verifying")}
                      </>
                    ) : (
                      tCommon("verification.verify_orcid")
                    )}
                  </Button>
                </div>
                {orcidError && (
                  <p className="text-xs text-red-600">{orcidError}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsViewMode;

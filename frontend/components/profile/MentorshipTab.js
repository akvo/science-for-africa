import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchMentees, getStrapiMedia } from "@/lib/strapi";
import { getInitials } from "@/lib/utils";
import { Loader2, ArrowRight, User, GraduationCap } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";

const MenteeRow = ({ mentorship }) => {
  const { t } = useTranslation(["profile", "common"]);
  const { collaborationCall, mentees } = mentorship;

  if (!mentees || mentees.length === 0) return null;

  return (
    <>
      {mentees.map((mentee, index) => (
        <tr
          key={`${mentorship.collaborationCall.id}-${mentee.id}`}
          className="border-b border-brand-gray-100 hover:bg-brand-gray-50/50 transition-colors group"
        >
          {/* Collaboration Space Column - Only show for the first mentee in the group */}
          <td className="py-6 px-6 align-top">
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-normal text-brand-gray-900 leading-snug whitespace-normal wrap-break-words">
                {collaborationCall.title}
              </h3>
              <Link
                href={`/community/calls/${collaborationCall.documentId || collaborationCall.id}`}
                className="flex items-center gap-2 text-sm font-normal text-brand-teal-600 hover:text-brand-teal-700 transition-colors"
              >
                {t("common:view", { defaultValue: "View" })}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </td>

          {/* Users Mentoring Column */}
          <td className="py-6 px-6 align-top">
            <div className="flex items-start gap-3">
              <Link
                href={`/profile/${mentee.documentId || mentee.id}`}
                className="shrink-0 hover:opacity-80 transition-opacity"
              >
                <Avatar className="size-10 border border-brand-gray-100 bg-brand-teal-50">
                  <AvatarImage
                    src={getStrapiMedia(mentee.profilePhoto?.url)}
                    alt={mentee.fullName || mentee.username}
                  />
                  <AvatarFallback className="text-sm text-brand-teal-700 font-bold bg-brand-teal-50">
                    {getInitials(mentee.fullName || mentee.username)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/profile/${mentee.documentId || mentee.id}`}
                    className="text-sm font-normal text-brand-gray-900 whitespace-normal wrap-break-words hover:text-brand-teal-600 transition-colors"
                  >
                    {mentee.fullName || mentee.username}
                  </Link>
                </div>
                <span className="text-sm text-brand-gray-500 whitespace-normal wrap-break-words mt-1">
                  {mentee.position ||
                    t("mentorship.researcher", { defaultValue: "Researcher" })}
                </span>
              </div>
            </div>
          </td>

          {/* Education Column */}
          <td className="py-6 px-6 align-top">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-brand-gray-900 font-normal whitespace-normal wrap-break-words">
                {mentee.educationLevel ||
                  t("common:not_specified", { defaultValue: "N/A" })}
              </div>
              {mentee.highestEducationInstitution?.name && (
                <div className="text-xs text-brand-gray-400 whitespace-normal wrap-break-words">
                  {mentee.highestEducationInstitution.name}
                </div>
              )}
            </div>
          </td>

          {/* Actions Column */}
          <td className="py-6 px-6 align-top text-right">
            <div className="flex items-center justify-end h-10">
              <Link href={`/profile/${mentee.documentId || mentee.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-brand-teal-900 text-brand-teal-900 hover:bg-brand-teal-900 hover:text-white px-6 font-normal h-9"
                >
                  {t("common:view", { defaultValue: "View" })}
                </Button>
              </Link>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

const MentorshipTab = () => {
  const { t } = useTranslation(["profile", "common"]);
  const [mentorships, setMentorships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMentees = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMentees();
        if (data) {
          setMentorships(data);
        }
      } catch (error) {
        console.error("Failed to load mentees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMentees();
  }, []);

  if (isLoading) {
    return <LoadingState message={t("common:loading")} />;
  }

  if (!mentorships || mentorships.length === 0) {
    return (
      <EmptyState
        icon={User}
        title={t("mentorship.empty_title", {
          defaultValue: "You don't have any mentees yet",
        })}
        description={t("mentorship.empty_desc", {
          defaultValue:
            "When you are assigned as a mentor to a collaboration, your mentees will appear here.",
        })}
      />
    );
  }

  return (
    <div className="flex flex-col pb-10">
      <div className="overflow-x-auto border border-brand-gray-100 rounded-lg shadow-sm">
        <table className="w-full border-collapse text-left bg-white">
          <thead className="bg-brand-gray-50 border-b border-brand-gray-100">
            <tr>
              <th className="py-4 px-6 text-[13px] font-bold text-brand-gray-500 tracking-wider w-[40%]">
                {t("mentorship.header_space", {
                  defaultValue: "Collaboration space",
                })}
              </th>
              <th className="py-4 px-6 text-[13px] font-bold text-brand-gray-500 tracking-wider w-[25%]">
                {t("mentorship.header_mentees", {
                  defaultValue: "Users mentoring",
                })}
              </th>
              <th className="py-4 px-6 text-[13px] font-bold text-brand-gray-500 tracking-wider w-[25%]">
                {t("mentorship.header_education", {
                  defaultValue: "Education",
                })}
              </th>
              <th className="py-4 px-6 text-[13px] font-bold text-brand-gray-500 tracking-wider text-right w-[10%]">
                {t("mentorship.header_actions", { defaultValue: "Actions" })}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-100">
            {mentorships.map((mentorship) => (
              <MenteeRow
                key={mentorship.collaborationCall.id}
                mentorship={mentorship}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MentorshipTab;

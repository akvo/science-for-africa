import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Ban, Flag, MoreHorizontal, Share2, UserPlus, UserMinus } from "lucide-react";
import VerificationBadge from "@/components/shared/VerificationBadge";
import { cn, formatNumber } from "@/lib/utils";

const SidebarCommunity = ({ name, subscribers, t }) => (
  <div className="py-3 last:pb-0">
    <h5 className="text-sm font-bold text-brand-gray-900">{name}</h5>
    <p className="text-xs text-brand-gray-500">
      {subscribers} {t("profile:sidebar.subscribers")}
    </p>
  </div>
);

const ProfileCard = ({
  user,
  isOwnProfile,
  isAuthenticated,
  onFollowToggle,
  isFollowing,
  isLoadingFollow,
  handleShare,
  className = "",
}) => {
  const { t } = useTranslation(["profile", "common"]);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "OR";

  return (
    <div
      className={cn(
        "bg-brand-gray-50 rounded-2xl border border-brand-gray-100 shadow-sm overflow-hidden",
        className,
      )}
    >
      {/* Identity Header */}
      <div className="py-6 px-4 border-b border-brand-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="size-12 border border-brand-gray-100 relative overflow-hidden bg-brand-teal-50">
              {user?.profilePhoto?.url ? (
                <Image
                  src={user.profilePhoto.url}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="text-brand-teal-700 font-bold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-[15px] font-bold text-brand-gray-900 leading-tight flex items-center gap-2">
                {user?.fullName || user?.username}
              </h2>
              <p className="text-xs text-brand-gray-500 mt-0.5">
                {user?.roleType?.name ||
                  (typeof user?.roleType === "string"
                    ? t(`profile:roles.${user.roleType}`, {
                        defaultValue: t("profile:details.not_provided"),
                      })
                    : t("profile:details.not_provided"))}
              </p>
              <div className="mt-2">
                <VerificationBadge verified={user?.verified} />
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-full bg-brand-gray-100/50 text-brand-gray-400 hover:bg-brand-gray-200/50"
              >
                <MoreHorizontal size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent align="end" className="w-auto min-w-60">
                <DropdownMenuItem
                  onClick={handleShare}
                  className="flex items-center justify-between cursor-pointer whitespace-nowrap"
                >
                  {t("profile:share.share_profile", { defaultValue: "Share" })}
                  <Share2 size={16} />
                </DropdownMenuItem>
                {!isOwnProfile && (
                  <>
                    <DropdownMenuItem
                      className="flex items-center justify-between cursor-pointer whitespace-nowrap"
                    >
                      {t("profile:actions.block", { defaultValue: "Block" })}
                      <Ban size={16} />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center justify-between cursor-pointer whitespace-nowrap"
                    >
                      {t("profile:actions.report", { defaultValue: "Report" })}
                      <Flag size={16} />
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </div>

        {!isOwnProfile && isAuthenticated && (
          <div className="mt-6">
            <Button
              onClick={onFollowToggle}
              disabled={isLoadingFollow}
              variant={isFollowing ? "outline" : "default"}
              className={cn(
                "w-full rounded-full font-bold h-9",
                isFollowing
                  ? "border-brand-gray-200 text-brand-gray-700 hover:bg-brand-gray-50"
                  : "bg-brand-teal-900 text-white hover:bg-brand-teal-800",
              )}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="mr-2 h-4 w-4" />
                  {t("profile:actions.unfollow")}
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t("profile:actions.follow")}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Biography Section */}
      <div className="p-6 border-b border-brand-gray-200">
        <p className="text-sm text-brand-gray-600 leading-relaxed wrap-break-word whitespace-pre-wrap">
          {user?.biography ||
            (isOwnProfile
              ? t("profile:details.no_bio")
              : t("profile:details.no_bio_public"))}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 border-b border-brand-gray-200">
        <div className="p-6 border-r border-brand-gray-200">
          <p className="text-[11px] text-brand-gray-400 font-bold uppercase tracking-wider mb-2">
            {t("profile:sidebar.subscribers")}
          </p>
          <p className="text-base font-bold text-brand-gray-900">
            {formatNumber(user?.subscriberCount || 0)}
          </p>
        </div>
        <div className="p-6">
          <p className="text-[11px] text-brand-gray-400 font-bold uppercase tracking-wider mb-2">
            {t("profile:sidebar.posts")}
          </p>
          <p className="text-base font-bold text-brand-gray-900">
            {formatNumber(user?.postsCount || 0)}
          </p>
        </div>
      </div>

      {/* Education Section */}
      <div className="p-6 border-b border-brand-gray-200 space-y-4">
        <h4 className="text-[11px] text-brand-gray-400 font-bold uppercase tracking-wider">
          {t("profile:sidebar.education")}
        </h4>
        <div className="space-y-1">
          <p className="text-[15px] font-bold text-brand-gray-900 leading-snug">
            {user?.educationLevel
              ? t(`profile:education_levels.${user.educationLevel}`, {
                  defaultValue: t("profile:details.not_provided"),
                })
              : t("profile:details.not_provided")}
          </p>
          <p className="text-sm text-brand-gray-500">
            {user?.highestEducationInstitution?.name ||
              t("profile:details.not_provided")}
          </p>
        </div>
      </div>

      {/* Institutional Affiliation Section */}
      <div className="p-6 border-b border-brand-gray-200 space-y-4">
        <h4 className="text-[11px] text-brand-gray-400 font-bold uppercase tracking-wider">
          {t("profile:details.affiliation_title")}
        </h4>
        <p className="text-[15px] font-bold text-brand-gray-900 leading-snug">
          {user?.institutionMemberships?.[0]?.institution?.name ||
            user?.institution?.name ||
            user?.institutionName ||
            t("profile:details.no_affiliation", {
              defaultValue: "No institutional affiliation",
            })}
        </p>
      </div>

      {/* Expertise Tags Section */}
      <div className="p-6 border-b border-brand-gray-200">
        <div className="flex flex-wrap gap-2">
          {user?.interests?.length > 0 ? (
            user.interests.map((item) => {
              const tag = typeof item === "string" ? item : item.name;
              return (
                <Badge
                  key={tag}
                  variant="outline"
                  className="h-auto rounded-xl px-3 py-1.5 text-[12px] font-medium text-brand-gray-600 border-brand-gray-300 bg-white leading-relaxed"
                >
                  #{tag.replace("#", "")}
                </Badge>
              );
            })
          ) : (
            <p className="text-[13px] text-brand-gray-400 font-medium italic">
              {t("profile:details.not_provided")}
            </p>
          )}
        </div>
      </div>

      {/* Communities Section */}
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] text-brand-gray-400 font-bold uppercase tracking-wider">
            {t("profile:sidebar.communities")}
          </h4>
          <Link
            href={
              isOwnProfile
                ? "/profile/communities"
                : `/profile/${user?.id}/communities`
            }
            className="text-[11px] font-bold text-brand-gray-500 hover:text-brand-teal-600"
          >
            {t("profile:sidebar.see_all")}
          </Link>
        </div>
        <div className="divide-y divide-brand-gray-100">
          {user?.memberships?.length > 0 ? (
            user.memberships
              .slice(0, 3)
              .map((membership) => (
                <SidebarCommunity
                  key={membership.id}
                  name={membership.community?.name || "Unknown"}
                  subscribers={formatNumber(
                    membership.community?.subscribers || 0,
                  )}
                  t={t}
                />
              ))
          ) : (
            <div className="py-4 px-1">
              <p className="text-[13px] text-brand-gray-400 font-medium italic">
                {t("profile:sidebar.no_communities")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;

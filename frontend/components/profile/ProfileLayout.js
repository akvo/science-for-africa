import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useAuthStore } from "@/lib/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  Briefcase,
  GraduationCap,
  MapPin,
  MoreVertical,
} from "lucide-react";
import { getMe } from "@/lib/strapi";

const TABS = [
  { id: "details", label: "tabs.details", href: "/profile" },
  {
    id: "communities",
    label: "tabs.communities",
    href: "/profile/communities",
  },
  { id: "content", label: "tabs.content", href: "/profile/content" },
  { id: "saved", label: "tabs.saved", href: "/profile/saved" },
  { id: "events", label: "tabs.events", href: "/profile/events" },
  {
    id: "collaboration",
    label: "tabs.collaboration",
    href: "/profile/collaboration",
  },
  {
    id: "courses",
    label: "tabs.courses",
    href: "/profile/courses",
  },
  { id: "mentorship", label: "tabs.mentorship", href: "/profile/mentorship" },
];

const SidebarCommunity = ({ name, subscribers, t }) => (
  <div className="py-3 last:pb-0">
    <h5 className="text-sm font-bold text-brand-gray-900">{name}</h5>
    <p className="text-xs text-brand-gray-500">
      {subscribers} {t("profile:sidebar.subscribers")}
    </p>
  </div>
);

const ProfileLayout = ({ children, activeTab = "details" }) => {
  const { t } = useTranslation(["profile", "common"]);
  const { user, updateUser, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Sync user data on mount to ensure we have the latest (especially after onboarding)
  useEffect(() => {
    if (isAuthenticated) {
      getMe().then((freshUser) => {
        if (freshUser) {
          updateUser(freshUser);
        }
      });
    }
  }, [isAuthenticated, updateUser]);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "OR";

  return (
    <div className="min-h-screen bg-brand-gray-25 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Area */}
          <aside className="lg:col-span-3">
            <div className="bg-brand-gray-50 rounded-2xl border border-brand-gray-100 overflow-hidden">
              {/* Identity Header */}
              <div className="py-6 px-4 border-b border-brand-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
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
                      <h2 className="text-[15px] font-bold text-brand-gray-900 leading-tight">
                        {user?.fullName || user?.username}
                      </h2>
                      <p className="text-xs text-brand-gray-500 mt-0.5">
                        {user?.roleType
                          ? t(`profile:roles.${user.roleType}`)
                          : t("profile:roles.Researcher")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-full bg-brand-gray-100/50 text-brand-gray-400 hover:bg-brand-gray-200/50"
                  >
                    <MoreHorizontal size={20} />
                  </Button>
                </div>
              </div>

              {/* Biography Section */}
              <div className="p-6 border-b border-brand-gray-200">
                <p className="text-sm text-brand-gray-600 leading-relaxed">
                  {user?.biography ||
                    t("details.no_bio", {
                      defaultValue:
                        "Lorem ipsum dolor sit amet consectetur. Nunc et posuere cras bibendum cras. Diam felis sagittis suspendisse scelerisque quam eu.",
                    })}
                </p>
              </div>

              {/* Stats Grid - Integrated style */}
              <div className="grid grid-cols-2 border-b border-brand-gray-200">
                <div className="p-6 border-r border-brand-gray-200">
                  <p className="text-[11px] text-brand-gray-400 font-bold uppercase tracking-wider mb-2">
                    {t("profile:sidebar.subscribers")}
                  </p>
                  <p className="text-base font-bold text-brand-gray-900 uppercase">
                    {user?.subscribersCount || "63716"}
                  </p>
                </div>
                <div className="p-6">
                  <p className="text-[11px] text-brand-gray-400 font-bold uppercase tracking-wider mb-2">
                    {t("profile:sidebar.posts")}
                  </p>
                  <p className="text-base font-bold text-brand-gray-900">
                    {user?.postsCount || "323"}
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
                      ? t(`profile:education_levels.${user.educationLevel}`)
                      : t("profile:education_levels.Master's Degree")}
                  </p>
                  <p className="text-sm text-brand-gray-500">
                    {user?.educationInstitutionName ||
                      user?.institution?.name ||
                      "University of Sydney"}
                  </p>
                </div>
              </div>

              {/* Expertise Tags Section */}
              <div className="p-6 border-b border-brand-gray-200">
                <div className="flex flex-wrap gap-2">
                  {(
                    user?.expertise || [
                      "STI Policy & Governance",
                      "Research Funding & Financi",
                      "Water Security",
                      "One Health",
                      "Science Diplomacy",
                      "Digital Health",
                      "Sustainable Energy",
                    ]
                  ).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="rounded-full px-3.5 py-1.5 text-[12px] font-medium text-brand-gray-600 border-brand-gray-300 bg-white"
                    >
                      #{tag.replace("#", "")}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Communities Section */}
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] text-brand-gray-400 font-bold uppercase tracking-wider">
                    {t("profile:sidebar.communities")}
                  </h4>
                  <Link
                    href="/profile/communities"
                    className="text-[11px] font-bold text-brand-gray-500 hover:text-brand-teal-600"
                  >
                    {t("profile:sidebar.see_all")}
                  </Link>
                </div>
                <div className="divide-y divide-brand-gray-100">
                  <SidebarCommunity
                    name="Health and Wellness"
                    subscribers="150k"
                    t={t}
                  />
                  <SidebarCommunity
                    name="Travel and Adventure"
                    subscribers="92k"
                    t={t}
                  />
                  <SidebarCommunity
                    name="Food and Cooking"
                    subscribers="330k"
                    t={t}
                  />
                  <SidebarCommunity
                    name="Finance and Investing"
                    subscribers="175k"
                    t={t}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <main className="lg:col-span-9 space-y-6">
            <h1 className="text-display-md text-brand-gray-900 font-bold">
              {t("profile:tabs.profile")}
            </h1>

            {/* Tabs List */}
            <div className="flex items-center gap-6 border-b border-brand-gray-200 overflow-x-auto scrollbar-hide py-1">
              {TABS.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    "relative pb-3 text-sm font-bold transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "text-brand-teal-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-brand-teal-600"
                      : "text-brand-gray-500 hover:text-brand-gray-700",
                  )}
                >
                  {t(`profile:${tab.label}`)}
                </Link>
              ))}
            </div>

            {/* Render Tab Content */}
            <div className="pt-4">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;

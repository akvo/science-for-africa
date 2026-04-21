import React from "react";
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

const TABS = [
  { id: "details", label: "Details", href: "/profile" },
  { id: "communities", label: "My Communities", href: "/profile/communities" },
  { id: "content", label: "Content", href: "/profile/content" },
  { id: "saved", label: "Saved", href: "/profile/saved" },
  { id: "events", label: "My events", href: "/profile/events" },
  {
    id: "collaboration",
    label: "Collaboration",
    href: "/profile/collaboration",
  },
  {
    id: "courses",
    label: "Courses and certifications",
    href: "/profile/courses",
  },
  { id: "mentorship", label: "Mentorship", href: "/profile/mentorship" },
];

const SidebarCommunity = ({ name, subscribers }) => (
  <div className="py-3 last:pb-0">
    <h5 className="text-sm font-bold text-brand-gray-900">{name}</h5>
    <p className="text-xs text-brand-gray-500">{subscribers} Subscribers</p>
  </div>
);

const ProfileLayout = ({ children, activeTab = "details" }) => {
  const { t } = useTranslation("profile");
  const { user } = useAuthStore();
  const router = useRouter();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "OR";

  return (
    <div className="min-h-screen bg-brand-gray-25 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Area */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-brand-gray-50 rounded-xl p-5 border border-brand-gray-100 space-y-6">
              {/* Identity Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12 border border-brand-gray-100 relative overflow-hidden">
                    {user?.profilePhoto?.url ? (
                      <Image
                        src={user.profilePhoto.url}
                        alt="Avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-brand-teal-50 text-brand-teal-700 font-bold">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h2 className="text-[15px] font-bold text-brand-gray-900 leading-tight">
                      {user?.fullName || user?.username}
                    </h2>
                    <p className="text-xs text-brand-gray-500">
                      {user?.roleType}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-brand-gray-400"
                >
                  <MoreHorizontal size={20} />
                </Button>
              </div>

              {/* Biography */}
              <p className="text-xs text-brand-gray-600 leading-relaxed italic">
                {user?.biography ||
                  t("details.no_bio", {
                    defaultValue: "No biography provided yet.",
                  })}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 border border-brand-gray-100 rounded-lg overflow-hidden bg-white">
                <div className="p-3 border-r border-brand-gray-100">
                  <p className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider mb-1">
                    Subscribers
                  </p>
                  <p className="text-sm font-bold text-brand-gray-900">
                    {user?.subscribersCount || "63716"}
                  </p>
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider mb-1">
                    Posts
                  </p>
                  <p className="text-sm font-bold text-brand-gray-900">
                    {user?.postsCount || "323"}
                  </p>
                </div>
              </div>

              {/* Education Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider">
                  Education
                </h4>
                <div>
                  <p className="text-sm font-bold text-brand-gray-900">
                    {user?.educationLevel || "Education not specified"}
                  </p>
                  <p className="text-xs text-brand-gray-500">
                    {user?.institution?.name ||
                      user?.institutionName ||
                      "Not provided"}
                  </p>
                </div>
              </div>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {(
                  user?.expertise || [
                    "STI Policy & Governance",
                    "Research Funding & Financi",
                    "Water Security",
                    "#One Health",
                    "Science Diplomacy",
                    "Digital Health",
                    "Sustainable Energy",
                  ]
                ).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded-full px-3 py-0.5 text-[10px] font-bold text-brand-gray-600 border-brand-gray-300 bg-white"
                  >
                    #{tag.replace("#", "")}
                  </Badge>
                ))}
              </div>

              {/* Communities Section */}
              <div className="pt-4 border-t border-brand-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] text-brand-gray-400 font-bold uppercase tracking-wider">
                    Communities
                  </h4>
                  <Link
                    href="/profile/communities"
                    className="text-[10px] font-bold text-brand-gray-500 hover:text-brand-teal-600"
                  >
                    See all
                  </Link>
                </div>
                <div className="divide-y divide-brand-gray-100">
                  <SidebarCommunity
                    name="Health and Wellness"
                    subscribers="150k"
                  />
                  <SidebarCommunity
                    name="Travel and Adventure"
                    subscribers="92k"
                  />
                  <SidebarCommunity
                    name="Food and Cooking"
                    subscribers="330k"
                  />
                  <SidebarCommunity
                    name="Finance and Investing"
                    subscribers="175k"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <main className="lg:col-span-9 space-y-6">
            <h1 className="text-display-md text-brand-gray-900 font-bold">
              Profile
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
                  {tab.label}
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

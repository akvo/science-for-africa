import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { getMe } from "@/lib/strapi";
import ProfileCard from "./ProfileCard";
import CommunityLeftNav from "@/components/community/CommunityLeftNav";

const TABS = [
  { id: "details", label: "tabs.details", href: "/profile" },
  {
    id: "communities",
    label: "tabs.communities",
    href: "/profile/communities",
  },
  { id: "resources", label: "tabs.resources", href: "/profile/resources" },
  {
    id: "collaboration",
    label: "tabs.collaboration",
    href: "/profile/collaboration",
  },
  { id: "mentorship", label: "tabs.mentorship", href: "/profile/mentorship" },
];

const ProfileLayout = ({
  children,
  activeTab = "details",
  profileUser,
  onFollowToggle,
  isFollowing,
  isLoadingFollow,
  variant = "private", // "private" or "public"
}) => {
  const { t } = useTranslation(["profile", "common"]);
  const { user: authUser, updateUser, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const user = profileUser || authUser;
  const isOwnProfile =
    !profileUser || (authUser && authUser.id === profileUser.id);

  // Sync user data on mount ONLY for own profile
  useEffect(() => {
    if (isAuthenticated && isOwnProfile) {
      getMe().then((freshUser) => {
        if (freshUser) {
          updateUser(freshUser);
        }
      });
    }
  }, [isAuthenticated, updateUser, isOwnProfile]);

  const handleShare = () => {
    const url = window.location.origin + `/profile/${user?.id || ""}`;
    if (navigator.share) {
      navigator
        .share({
          title: user?.fullName || "Profile",
          url: url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert(t("profile:share.copied_to_clipboard"));
    }
  };

  const isPublic = variant === "public";

  return (
    <div className="min-h-screen bg-brand-gray-25 pb-20">
      <div
        className={cn(
          isPublic
            ? "flex flex-col lg:flex-row"
            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6",
        )}
      >
        {!isPublic ? (
          /* Private Layout (Original) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column */}
            <aside className="lg:col-span-3">
              <ProfileCard
                user={user}
                isOwnProfile={isOwnProfile}
                isAuthenticated={isAuthenticated}
                onFollowToggle={onFollowToggle}
                isFollowing={isFollowing}
                isLoadingFollow={isLoadingFollow}
                handleShare={handleShare}
              />
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-9">
              <div className="space-y-6">
                <h1 className="text-display-md text-brand-gray-900 font-bold">
                  {t("profile:tabs.profile")}
                </h1>

                <div className="flex items-center gap-6 border-b border-brand-gray-200">
                  {TABS.filter((tab) => {
                    if (tab.id === "mentorship") {
                      return user?.userType === "individual";
                    }
                    return true;
                  }).map((tab) => (
                    <Link
                      key={tab.id}
                      href={tab.href}
                      className={cn(
                        "relative pb-3 text-sm font-bold transition-all whitespace-nowrap",
                        activeTab === tab.id
                          ? "text-brand-teal-600 after:absolute after:-bottom-px after:left-0 after:h-0.5 after:w-full after:bg-brand-teal-600"
                          : "text-brand-gray-500 hover:text-brand-gray-700",
                      )}
                    >
                      {t(`profile:${tab.label}`)}
                    </Link>
                  ))}
                </div>

                <div className="pt-4">{children}</div>
              </div>
            </main>
          </div>
        ) : (
          /* Public Layout (Community-style) */
          <>
            <aside className="w-full lg:w-65 lg:flex-none lg:border-r lg:border-brand-gray-100 lg:pr-4 lg:pt-4 lg:sticky lg:top-28.5 lg:self-start lg:h-[calc(100vh-114px)] lg:overflow-y-auto">
              <CommunityLeftNav activeKey="" />
            </aside>

            <div className="flex flex-1 flex-col min-w-0 pb-4">
              <div className="flex flex-col gap-6 min-w-0">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
                  {/* Center Column */}
                  <div className="flex flex-col gap-5 min-w-0">
                    <div className="flex items-center justify-between gap-4 py-1 lg:px-6 border-b border-brand-gray-100 pb-4 pt-4 border-r">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.back()}
                          className="size-10 rounded-full bg-brand-gray-50 text-brand-gray-500 hover:bg-brand-gray-100"
                        >
                          <ArrowLeft size={20} />
                        </Button>
                        <h1 className="text-lg font-bold text-brand-gray-900">
                          {user?.fullName || user?.username}
                        </h1>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-full border-brand-gray-200 text-brand-gray-700 h-10 px-6 font-bold"
                      >
                        Sort by
                        <ChevronDown size={16} className="ml-2" />
                      </Button>
                    </div>

                    <div className="lg:pl-6">{children}</div>
                  </div>

                  {/* Right Column */}
                  <aside className="w-full pr-4 pt-4 lg:sticky lg:top-28.5 lg:self-start">
                    <ProfileCard
                      user={user}
                      isOwnProfile={isOwnProfile}
                      isAuthenticated={isAuthenticated}
                      onFollowToggle={onFollowToggle}
                      isFollowing={isFollowing}
                      isLoadingFollow={isLoadingFollow}
                      handleShare={handleShare}
                    />
                  </aside>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileLayout;

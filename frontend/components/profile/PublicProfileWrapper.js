import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import ProfileLayout from "@/components/profile/ProfileLayout";
import LoadingState from "@/components/shared/LoadingState";
import { fetchPublicProfile, followUser, unfollowUser } from "@/lib/strapi";

const PublicProfileWrapper = ({ children, activeTab = "posts" }) => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation(["profile", "common", "community"]);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPublicProfile(id).then((data) => {
        if (data) {
          setProfile(data);
          setIsFollowing(data.following);
          setSubscriberCount(data.subscriberCount || 0);
        }
        setLoading(false);
      });
    }
  }, [id]);

  const handleFollowToggle = async () => {
    if (!id) return;
    setIsLoadingFollow(true);

    const previousFollowing = isFollowing;
    const previousCount = subscriberCount;

    setIsFollowing(!isFollowing);
    setSubscriberCount(isFollowing ? subscriberCount - 1 : subscriberCount + 1);

    const result = isFollowing ? await unfollowUser(id) : await followUser(id);

    if (result && result.success) {
      setSubscriberCount(result.subscriberCount);
      setIsFollowing(result.following);
    } else {
      setIsFollowing(previousFollowing);
      setSubscriberCount(previousCount);
      console.error("Follow/Unfollow failed");
    }

    setIsLoadingFollow(false);
  };

  if (loading) return <LoadingState />;
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray-25">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-gray-900">
            {t("profile:errors.profile_not_found", {
              defaultValue: "Profile not found",
            })}
          </h1>
          <p className="text-brand-gray-500 mt-2">
            {t("profile:errors.profile_not_found_desc", {
              defaultValue:
                "The profile you are looking for does not exist or has been removed.",
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProfileLayout
      profileUser={{ ...profile, subscriberCount }}
      activeTab={activeTab}
      isFollowing={isFollowing}
      onFollowToggle={handleFollowToggle}
      isLoadingFollow={isLoadingFollow}
      variant="public"
    >
      {typeof children === "function" ? children(profile) : children}
    </ProfileLayout>
  );
};

export default PublicProfileWrapper;

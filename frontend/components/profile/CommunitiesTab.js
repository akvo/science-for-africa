import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchMyCommunityMemberships, leaveCommunity } from "@/lib/strapi";
import { useAuthStore } from "@/lib/auth-store";
import { Loader2, Users } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";

const CommunityCard = ({ membership, onLeave }) => {
  const { t } = useTranslation(["profile", "common"]);
  const community = membership.community;
  const [isLeaving, setIsLeaving] = useState(false);

  if (!community) return null;

  const handleLeave = async () => {
    if (
      !window.confirm(
        t("communities.leave_confirm", {
          name: community.name,
          defaultValue: `Are you sure you want to leave ${community.name}?`,
        }),
      )
    ) {
      return;
    }

    setIsLeaving(true);
    try {
      const result = await leaveCommunity(community.documentId || community.id);
      if (result.success) {
        toast.success(
          t("communities.leave_success", {
            name: community.name,
            defaultValue: `You have left ${community.name}`,
          }),
        );
        onLeave(membership.id);
      } else {
        toast.error(
          t("communities.leave_error", {
            defaultValue: "Failed to leave community",
          }),
        );
      }
    } catch (error) {
      toast.error(
        t("communities.leave_error", { defaultValue: "An error occurred" }),
      );
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="bg-white p-6 flex flex-col justify-between h-full hover:shadow-sm transition-shadow">
      <div className="space-y-4">
        {/* Header: Avatar + Title/Subscribers + Button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="size-10 border border-brand-gray-100 bg-brand-teal-50">
              {community.image?.url ? (
                <AvatarImage
                  src={community.image.url}
                  alt={community.name}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="text-brand-teal-700 font-bold bg-brand-teal-50">
                  {community.name?.substring(0, 2).toUpperCase() || "C"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-[17px] font-bold text-brand-gray-900 leading-tight truncate">
                {community.name}
              </h3>
              <p className="text-sm text-brand-gray-500 mt-0.5">
                {community.subscribersCount || 0}{" "}
                {t("profile:sidebar.subscribers")}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLeave}
            disabled={isLeaving}
            className="rounded-full bg-brand-gray-50 border-brand-gray-100 text-brand-gray-700 hover:bg-brand-gray-100 hover:text-brand-gray-900 font-bold text-xs px-4"
          >
            {isLeaving ? (
              <Loader2 className="size-3 animate-spin mr-1" />
            ) : null}
            {t("communities.joined", { defaultValue: "Joined" })}
          </Button>
        </div>

        {/* Description */}
        <p className="text-sm text-brand-gray-500 line-clamp-2 leading-relaxed">
          {community.description ||
            t("communities.no_description", {
              defaultValue: "No description available.",
            })}
        </p>
      </div>
    </div>
  );
};

const CommunitiesTab = () => {
  const { t } = useTranslation(["profile", "common"]);
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadMemberships = async () => {
      setIsLoading(true);
      try {
        const result = await fetchMyCommunityMemberships();
        if (result?.data) {
          setMemberships(result.data);
        }
      } catch (error) {
        console.error("Failed to load memberships:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadMemberships();
    }
  }, [user]);

  const removeMembershipFromList = (id) => {
    setMemberships((prev) => prev.filter((m) => m.id !== id));
  };

  if (isLoading) {
    return (
      <LoadingState
        message={t("common:loading", {
          defaultValue: "Loading communities...",
        })}
      />
    );
  }

  if (memberships.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t("communities.empty_title", {
          defaultValue: "You don't have any communities yet",
        })}
        description={t("communities.empty_description", {
          defaultValue:
            "Join communities to connect with other researchers and participate in discussions.",
        })}
        actionHref="/community"
        actionLabel={t("communities.explore", {
          defaultValue: "Explore communities",
        })}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-brand-gray-100 border border-brand-gray-100 rounded-xl overflow-hidden shadow-sm">
      {memberships.map((membership) => (
        <CommunityCard
          key={membership.id}
          membership={membership}
          onLeave={removeMembershipFromList}
        />
      ))}
    </div>
  );
};

export default CommunitiesTab;

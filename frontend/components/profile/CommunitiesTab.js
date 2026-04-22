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
import ConfirmationModal from "@/components/shared/ConfirmationModal";

const CommunityCard = ({ membership, onLeave }) => {
  const { t } = useTranslation(["profile", "common"]);
  const community = membership.community;
  const [isLeaving, setIsLeaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!community) {
    return null;
  }

  const handleLeave = async () => {
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
      setShowConfirmModal(false);
    }
  };

  return (
    <>
      <ConfirmationModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        title={t("communities.leave_title", {
          defaultValue: "Leave Community",
        })}
        description={t("communities.leave_confirm", {
          name: community.name,
          defaultValue: `Are you sure you want to leave ${community.name}?`,
        })}
        onConfirm={handleLeave}
        confirmLabel={t("communities.leave_btn", { defaultValue: "Leave" })}
        isLoading={isLeaving}
        variant="danger"
      />
      <div className="bg-white p-4 flex flex-col h-full hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-12 border border-brand-gray-100 bg-brand-teal-50">
              {community.avatarUrl ? (
                <AvatarImage
                  src={community.avatarUrl}
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
              <h3 className="text-[15px] font-bold text-brand-gray-900 leading-tight">
                {community.name}
              </h3>
              <p className="text-sm text-brand-gray-500 mt-0.5">
                {community.subscribers || 0} {t("profile:sidebar.subscribers")}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmModal(true)}
            disabled={isLeaving}
            className="rounded-full bg-[#E5E7EB] border-transparent text-[#1F2937] hover:bg-gray-300 font-semibold text-sm px-4 h-9"
          >
            {isLeaving ? (
              <Loader2 className="size-3 animate-spin mr-1" />
            ) : null}
            {t("communities.joined", { defaultValue: "Joined" })}
          </Button>
        </div>

        <p className="text-sm text-brand-gray-500 line-clamp-2 leading-relaxed">
          {community.description ||
            t("communities.no_description", {
              defaultValue: "No description available.",
            })}
        </p>
      </div>
    </>
  );
};

const CommunitiesTab = () => {
  const { t } = useTranslation(["profile", "common"]);
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { user } = useAuthStore();
  const PAGE_SIZE = 6;

  const loadMemberships = async (pageNum, isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const result = await fetchMyCommunityMemberships(pageNum, PAGE_SIZE);
      if (result?.data) {
        if (isInitial) {
          setMemberships(result.data);
        } else {
          setMemberships((prev) => [...prev, ...result.data]);
        }

        // Check if there are more pages based on Strapi meta
        const pagination = result.meta?.pagination;
        if (pagination) {
          setHasMore(pagination.page < pagination.pageCount);
        }
      }
    } catch (error) {
      console.error("Failed to load memberships:", error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMemberships(1, true);
    }
  }, [user]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMemberships(nextPage);
  };

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
    <div className="flex flex-col space-y-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-brand-gray-100 border border-brand-gray-100 overflow-hidden shadow-sm">
        {memberships.map((membership) => (
          <CommunityCard
            key={membership.id}
            membership={membership}
            onLeave={removeMembershipFromList}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isFetchingMore}
            className="min-w-[140px] rounded-full border-brand-gray-200 text-brand-gray-600 hover:bg-brand-gray-50 font-bold"
          >
            {isFetchingMore ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("common:loading", { defaultValue: "Loading..." })}
              </>
            ) : (
              t("common:load_more", { defaultValue: "Load More" })
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommunitiesTab;

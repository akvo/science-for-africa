import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchMyCollaborations } from "@/lib/strapi";
import { Loader2, ArrowRight, Calendar, Handshake } from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import { format } from "date-fns";

const CollaborationCard = ({ invite }) => {
  const { t } = useTranslation(["profile", "common"]);
  const call = invite.collaborationCall;

  if (!call) return null;

  const isActive = call.status === "Active";
  const endDate = call.endDate ? new Date(call.endDate) : null;
  const formattedEndDate = endDate ? format(endDate, "dd/MM/yy") : "--/--/--";

  return (
    <div className="bg-white p-6 flex flex-col gap-8 hover:shadow-sm transition-shadow relative group">
      {/* Top Section: Status and View Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center overflow-hidden rounded-full border border-brand-gray-100 bg-brand-gray-50">
          <div className="flex items-center gap-2 px-3.5 py-2">
            <div className="relative flex items-center justify-center">
              <div
                className={`size-2 rounded-full absolute animate-ping opacity-75 ${
                  isActive ? "bg-brand-teal-500" : "bg-red-500"
                }`}
              />
              <div
                className={`size-2 rounded-full relative ${
                  isActive ? "bg-brand-teal-500" : "bg-red-500"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-brand-gray-900">
              {isActive
                ? t("collaboration.status_active", { defaultValue: "Active" })
                : t("collaboration.status_completed", {
                    defaultValue: "Completed",
                  })}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 border-l border-brand-gray-100">
            <Calendar className="size-4 text-brand-gray-400" />
            <span className="text-sm text-brand-gray-500">
              {isActive
                ? t("collaboration.valid_till", { defaultValue: "Valid till:" })
                : t("collaboration.ended", { defaultValue: "Ended:" })}{" "}
              <span className="text-brand-gray-900 font-medium">
                {formattedEndDate}
              </span>
            </span>
          </div>
        </div>

        <Link href={`/collaboration/${call.documentId || call.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-brand-gray-50 border-brand-gray-100 text-brand-gray-900 hover:bg-brand-gray-100 font-bold px-5"
          >
            {t("common:view", { defaultValue: "View" })}
          </Button>
        </Link>
      </div>

      {/* Middle Section: Content */}
      <div className="flex flex-col gap-6 grow">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-brand-gray-900 line-clamp-1 group-hover:text-brand-teal-600 transition-colors">
            {call.title}
          </h3>
          <p className="text-sm text-brand-gray-500 line-clamp-2 leading-relaxed">
            {call.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {call.topics && Array.isArray(call.topics) ? (
            call.topics.map((topic, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="rounded-full px-3 py-1 text-xs font-medium text-brand-gray-500 border-brand-gray-200 bg-white"
              >
                #{topic}
              </Badge>
            ))
          ) : (
            <>
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-xs font-medium text-brand-gray-500 border-brand-gray-200 bg-white"
              >
                #Technology
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-xs font-medium text-brand-gray-500 border-brand-gray-200 bg-white"
              >
                #Innovation
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Bottom Section: Community Affiliation */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5">
          <Avatar className="size-6 border border-brand-gray-100 bg-brand-teal-50">
            <AvatarFallback className="text-[8px] text-brand-teal-700 font-bold bg-brand-teal-50">
              {call.communityName?.substring(0, 2).toUpperCase() || "CR"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-brand-gray-500 truncate max-w-50">
            {call.communityName || "Community of researchers"}
          </span>
        </div>

        <Link
          href={`/community/${call.communityName?.toLowerCase().replace(/\s+/g, "-") || "#"}`}
          className="flex items-center gap-1 text-xs text-brand-gray-400 hover:text-brand-teal-600 transition-colors group/link"
        >
          {t("collaboration.view_community", {
            defaultValue: "View community",
          })}
          <ArrowRight className="size-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

const CollaborationTab = () => {
  const { t } = useTranslation(["profile", "common"]);
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 6;

  const loadCollaborations = async (pageNum, isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const result = await fetchMyCollaborations(pageNum, PAGE_SIZE);
      if (result?.data) {
        if (isInitial) {
          setInvites(result.data);
        } else {
          setInvites((prev) => [...prev, ...result.data]);
        }

        // Handle pagination metadata
        const pagination = result.meta?.pagination;
        if (pagination) {
          setHasMore(pagination.page < pagination.pageCount);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Failed to load collaborations:", error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    loadCollaborations(1, true);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadCollaborations(nextPage);
  };

  if (isLoading) {
    return <LoadingState message={t("common:loading")} />;
  }

  if (!invites || invites.length === 0) {
    return (
      <EmptyState
        icon={Handshake}
        title={t("collaboration.empty_title", {
          defaultValue: "You don't have any collaborations yet",
        })}
        description={t("collaboration.empty_desc", {
          defaultValue:
            "Start joining communities and responding to calls to begin collaborating.",
        })}
        actionLabel={t("collaboration.explore_calls", {
          defaultValue: "Explore collaboration calls",
        })}
        actionHref="/community"
      />
    );
  }

  return (
    <div className="flex flex-col space-y-8 pb-10">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-brand-gray-100 border border-brand-gray-100 overflow-hidden shadow-sm">
        {invites.map((invite) => (
          <CollaborationCard key={invite.id} invite={invite} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isFetchingMore}
            className="min-w-35 rounded-full border-brand-gray-200 text-brand-gray-600 hover:bg-brand-gray-50 font-bold"
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

export default CollaborationTab;

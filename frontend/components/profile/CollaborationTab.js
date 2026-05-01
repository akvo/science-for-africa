import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchMyCollaborations,
  acceptCollaborationInvite,
  declineCollaborationInvite,
} from "@/lib/strapi";
import {
  Loader2,
  ArrowRight,
  Handshake,
} from "lucide-react";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";

const CollaborationRow = ({
  invite,
  onAccept,
  onDecline,
  processingId,
}) => {
  const { t } = useTranslation(["profile", "common"]);
  const call = invite.collaborationCall;

  if (!call) return null;

  const isPending = invite.inviteStatus === "Pending";
  const isProcessing = processingId === invite.id;
  const mentor = call.createdByUser;

  return (
    <tr className="border-b border-brand-gray-100 hover:bg-brand-gray-50/50 transition-colors group">
      {/* Collaboration Space Column */}
      <td className="py-6 px-6 align-top">
        <div className="flex flex-col gap-2">
          <h3 className="text-[17px] font-bold text-brand-gray-900 leading-snug">
            {call.title}
          </h3>
          <Link
            href={`/community/calls/${call.documentId || call.id}`}
            className="flex items-center gap-2 text-sm font-medium text-brand-teal-600 hover:text-brand-teal-700 transition-colors"
          >
            {t("common:view", { defaultValue: "View" })}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </td>

      {/* Mentor Column */}
      <td className="py-6 px-6 align-top">
        <div className="flex items-start gap-3">
          <Avatar className="size-10 border border-brand-gray-100 bg-brand-teal-50 shrink-0">
            <AvatarFallback className="text-sm text-brand-teal-700 font-bold bg-brand-teal-50">
              <Handshake className="size-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-brand-gray-900 truncate">
                {mentor?.fullName || mentor?.username || t("collaboration.no_mentor", { defaultValue: "No mentor assigned" })}
              </span>
              {mentor && (
                <Badge className="bg-brand-orange-50 text-brand-orange-600 border-none rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                  {t("collaboration.mentor_badge", { defaultValue: "Mentor" })}
                </Badge>
              )}
            </div>
            {mentor && (
              <>
                <span className="text-sm text-brand-gray-500 truncate">
                  {mentor?.biography?.substring(0, 40) || "Researcher"}
                </span>
                {mentor?.institutionMemberships?.[0]?.institution?.name && (
                  <span className="text-xs text-brand-gray-400 truncate mt-0.5">
                    {mentor.institutionMemberships[0].institution.name}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </td>

      {/* Actions Column */}
      <td className="py-6 px-6 align-top text-right">
        <div className="flex items-center justify-end gap-3 h-10">
          {isPending ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full bg-brand-gray-100 text-brand-gray-900 hover:bg-brand-gray-200 px-6 font-bold h-9"
                onClick={() => onDecline(invite.id)}
                disabled={isProcessing}
              >
                {t("collaboration.decline", { defaultValue: "Decline" })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-brand-teal-500 text-brand-teal-600 hover:bg-brand-teal-50 px-6 font-bold h-9"
                onClick={() => onAccept(invite.id)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  t("collaboration.accept", { defaultValue: "Accept" })
                )}
              </Button>
            </>
          ) : (
            <>
              <button
                className="text-sm font-bold text-brand-teal-600 hover:text-brand-teal-700 transition-colors mr-2"
                onClick={() => onDecline(invite.id)}
                disabled={isProcessing}
              >
                {t("common:remove", { defaultValue: "Remove" })}
              </button>
              <Link href={`/community/calls/${call.documentId || call.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-brand-teal-500 text-brand-teal-600 hover:bg-brand-teal-50 px-6 font-bold h-9"
                >
                  {t("common:view", { defaultValue: "View" })}
                </Button>
              </Link>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

const CollaborationTab = () => {
  const { t } = useTranslation(["profile", "common"]);
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [processingId, setProcessingId] = useState(null);
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

  const handleAccept = async (id) => {
    setProcessingId(id);
    try {
      const res = await acceptCollaborationInvite(id);
      if (res?.success) {
        toast.success(
          t("collaboration.accept_success", {
            defaultValue: "Invitation accepted successfully",
          }),
        );
        setInvites((prev) =>
          prev.map((inv) =>
            inv.id === id ? { ...inv, inviteStatus: "Accepted" } : inv,
          ),
        );
      } else {
        toast.error(
          t("collaboration.accept_error", {
            defaultValue: "Failed to accept invitation",
          }),
        );
      }
    } catch (error) {
      toast.error(t("common:error_occurred"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (id) => {
    setProcessingId(id);
    try {
      const res = await declineCollaborationInvite(id);
      if (res?.success) {
        toast.success(
          t("collaboration.decline_success", {
            defaultValue: "Invitation processed",
          }),
        );
        setInvites((prev) => prev.filter((inv) => inv.id !== id));
      } else {
        toast.error(
          t("collaboration.decline_error", {
            defaultValue: "Failed to process invitation",
          }),
        );
      }
    } catch (error) {
      toast.error(t("common:error_occurred"));
    } finally {
      setProcessingId(null);
    }
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
    <div className="flex flex-col pb-10">
      <div className="overflow-x-auto border border-brand-gray-100 rounded-lg shadow-sm">
        <table className="w-full border-collapse text-left bg-white">
          <thead className="bg-brand-gray-50 border-b border-brand-gray-100">
            <tr>
              <th className="py-4 px-6 text-[13px] font-bold text-brand-gray-500 uppercase tracking-wider w-2/5">
                {t("collaboration.header_space", {
                  defaultValue: "Collaboration space",
                })}
              </th>
              <th className="py-4 px-6 text-[13px] font-bold text-brand-gray-500 uppercase tracking-wider w-1/3">
                {t("collaboration.header_mentor", { defaultValue: "Mentor" })}
              </th>
              <th className="py-4 px-6 text-[13px] font-bold text-brand-gray-500 uppercase tracking-wider text-right">
                {t("collaboration.header_actions", { defaultValue: "Actions" })}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-100">
            {invites.map((invite) => (
              <CollaborationRow
                key={invite.id}
                invite={invite}
                onAccept={handleAccept}
                onDecline={handleDecline}
                processingId={processingId}
              />
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
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

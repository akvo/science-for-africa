import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Handshake,
  ImageIcon,
  MoreHorizontal,
  Paperclip,
  X,
} from "lucide-react";
import ProfileLink from "@/components/shared/ProfileLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  fetchChatMessages,
  fetchCollaborationCall,
  fetchCommunityByName,
  postChatMessage,
  requestJoinCollaborationCall,
  uploadFile,
} from "@/lib/strapi";
import { useAuthStore } from "@/lib/auth-store";
import { htmlToPlainText, sanitizeHtml } from "@/lib/sanitize-html";
import { toast } from "sonner";

/**
 * Map a raw Strapi chat-message row into the shape the ChatThread expects.
 * `self` is computed by comparing the message's author id to the current
 * user's id so bubbles render on the correct side.
 */
function mapChatMessage(row, currentUserId) {
  const author = row?.author || {};
  const authorName =
    author.fullName ||
    [author.firstName, author.lastName].filter(Boolean).join(" ") ||
    author.username ||
    author.email?.split("@")[0] ||
    "Member";
  const att = row?.attachment;
  const attachment = att
    ? {
        name: att.name,
        size: formatFileSize(att.size),
        url: att.url,
        mime: att.mime || "",
        kind: att.mime?.startsWith("image/") ? "image" : "file",
      }
    : null;
  return {
    id: row.id,
    authorId: author.documentId || author.id,
    self: currentUserId != null && author.id === currentUserId,
    author: authorName,
    time: formatChatTime(row.createdAt),
    text: row.text,
    attachment,
  };
}

/**
 * Collaboration call detail page.
 *
 * Layout (desktop):
 * [ Community details sidebar ] [ Chat area ]
 *
 * The sidebar shows details for the community this call belongs to (fetched
 * by `call.communityName`). Chat messages are backed by the Strapi
 * `api::chat-message` content type.
 */
export default function CollaborationCallDetailPage() {
  const { t } = useTranslation(["profile", "common", "community"]);
  const router = useRouter();
  const { id } = router.query;
  const user = useAuthStore((state) => state.user);
  const [call, setCall] = useState(null);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchCollaborationCall(id)
      .then((res) => setCall(res?.data || null))
      .finally(() => setLoading(false));
  }, [id]);

  // Load chat messages whenever the call id or current user changes.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchChatMessages(id).then((res) => {
      if (cancelled) return;
      const rows = Array.isArray(res?.data) ? res.data : [];
      setMessages(rows.map((row) => mapChatMessage(row, user?.id)));
    });
    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  const handleSendMessage = async (text, file) => {
    const trimmed = (text || "").trim();
    if ((!trimmed && !file) || !id || sending) return;
    setSending(true);
    try {
      let attachmentId = null;
      if (file) {
        const uploaded = await uploadFile(file);
        if (!uploaded?.[0]?.id) {
          toast.error(t("community:chat.upload_failed", { defaultValue: "Failed to upload file" }));
          setSending(false);
          return;
        }
        attachmentId = uploaded[0].id;
      }
      const res = await postChatMessage(id, trimmed, attachmentId);
      const row = res?.data;
      if (row && row.id) {
        setMessages((prev) => [...prev, mapChatMessage(row, user?.id)]);
      } else {
        toast.error(t("community:chat.send_failed", { defaultValue: "Failed to send message" }));
      }
    } catch (err) {
      toast.error(t("community:chat.send_failed", { defaultValue: "Failed to send message" }));
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!call?.communityName) return;
    fetchCommunityByName(call.communityName).then((res) => {
      const items = res?.data || [];
      setCommunity(items[0] || null);
    });
  }, [call?.communityName]);

  const mentors = useMemo(() => {
    const invites = call?.invites || [];
    return invites
      .filter((i) => i.role === "Mentor" && i.invitedUser)
      .map((i) => ({
        id: i.invitedUser.documentId || i.invitedUser.id,
        name:
          i.invitedUser.fullName ||
          [i.invitedUser.firstName, i.invitedUser.lastName]
            .filter(Boolean)
            .join(" ") ||
          i.invitedUser.username ||
          i.invitedUser.email?.split("@")[0] ||
          "Mentor",
        role: i.invitedUser.position || i.invitedUser.institutionMemberships?.[0]?.institution?.name || t("community:call.no_affiliation", { defaultValue: "No institutional affiliation" }),
        avatarUrl: i.invitedUser.avatarUrl,
      }));
  }, [call]);

  // Collect all attachments from chat messages
  const chatAttachments = useMemo(() => {
    return messages.filter((m) => m.attachment).map((m) => m.attachment);
  }, [messages]);

  // Users who have accepted their invite (joined the call)
  const joinedUsers = useMemo(() => {
    const mapUser = (u) => ({
      id: u.documentId || u.id,
      name:
        u.fullName ||
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
        u.username ||
        "User",
      avatarUrl: u.avatarUrl,
      position: u.position || "",
      educationLevel: u.educationLevel || "",
      educationTopic: u.educationTopic || "",
    });

    const invites = call?.invites || [];
    const users = invites
      .filter((i) => i.inviteStatus === "Accepted" && i.invitedUser)
      .map((i) => mapUser(i.invitedUser));
    // Also include the creator if present
    if (call?.createdByUser) {
      const creator = call.createdByUser;
      const alreadyIncluded = users.some(
        (u) => u.id === (creator.documentId || creator.id),
      );
      if (!alreadyIncluded) {
        users.unshift(mapUser(creator));
      }
    }
    return users;
  }, [call]);

  const myInvite = useMemo(() => {
    if (!user || !call?.invites) return null;
    return call.invites.find(
      (i) =>
        i.invitedUser?.documentId === user.documentId ||
        i.invitedUser?.id === user.id,
    );
  }, [call, user]);

  // Check if current user already has an accepted invite for this call
  const hasJoined = useMemo(() => {
    if (!user || !call?.invites) return false;
    return call.invites.some(
      (i) => i.invitedUser?.id === user.id && i.inviteStatus === "Accepted",
    );
  }, [call, user]);

  // Also check if user is the creator
  const isCreator = useMemo(() => {
    if (!user || !call?.createdByUser) return false;
    return call.createdByUser.id === user.id;
  }, [call, user]);

  // Check if user has a pending request
  const hasPendingRequest = useMemo(() => {
    if (!user || !call?.invites) return false;
    return call.invites.some(
      (i) => i.invitedUser?.id === user.id && i.inviteStatus === "Pending",
    );
  }, [call, user]);

  const handleRequestJoin = async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const res = await requestJoinCollaborationCall(id);
    if (res?.data) {
      // Re-fetch call to update state
      const updated = await fetchCollaborationCall(id);
      setCall(updated?.data || null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-sm text-brand-gray-500">
        {t("community:call_detail.loading", {
          defaultValue: "Loading collaboration call...",
        })}
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-sm text-brand-gray-500">
        {t("community:call_detail.not_found", {
          defaultValue: "Collaboration call not found.",
        })}
      </div>
    );
  }

  const isPastEndDate = call.endDate && new Date(call.endDate) < new Date();
  const isActive = isPastEndDate ? false : (call.status || "").toLowerCase() === "active";
  const visibility = call.visibility || "public";

  // Determine posting permission — only accepted members or the creator can post, and only on active calls
  const canPost = isActive && (hasJoined || isCreator);

  // Determine if join/request button should be shown
  // Public: "Join" button (auto-accepted)
  // Restricted: "Request to join" button (needs approval)
  // Private: hidden (invite-only)
  const showJoinButton =
    visibility === "public" &&
    isActive &&
    !hasJoined &&
    !isCreator;

  const showRequestJoin =
    visibility === "restricted" &&
    isActive &&
    !hasJoined &&
    !isCreator &&
    !hasPendingRequest;

  return (
    <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
      <CommunityDetailsSidebar
        community={community}
        mentors={mentors}
        joinedUsers={joinedUsers}
        attachments={chatAttachments}
        t={t}
      />

      <section className="flex min-w-0 flex-col">
        <ChatHeader
          call={call}
          isActive={isActive}
          visibility={visibility}
          hasJoined={hasJoined || isCreator}
          hasPendingRequest={hasPendingRequest}
          showJoinButton={showJoinButton}
          showRequestJoin={showRequestJoin}
          onJoin={handleRequestJoin}
          onRequestJoin={handleRequestJoin}
          onBack={() => router.back()}
          t={t}
        />
        <ChatThread messages={messages} canPost={canPost} />
        {canPost ? (
          <ChatComposer onSend={handleSendMessage} disabled={sending} />
        ) : (
          <div className="border-t border-brand-gray-100 bg-brand-gray-50 px-6 py-8 text-center">
            <Handshake className="mx-auto mb-3 size-8 text-brand-gray-400" />
            <h3 className="text-sm font-semibold text-brand-gray-900">
              {t("collaboration.join_to_post_title", {
                defaultValue: "Join this collaboration to start posting",
              })}
            </h3>
            <p className="mt-1 text-xs text-brand-gray-500">
              {t("collaboration.join_to_post_desc", {
                defaultValue:
                  "You must be an accepted member of this collaboration space to participate in the chat.",
              })}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

/* ----------------------- Community details sidebar ---------------------- */

const MAX_AVATAR_COUNT = 8;

function CommunityDetailsSidebar({
  community,
  mentors = [],
  joinedUsers = [],
  attachments = [],
  t,
}) {
  const [showUsersModal, setShowUsersModal] = useState(false);
  if (!community) {
    return (
      <aside className="flex flex-col gap-5 border-b border-brand-gray-100 bg-brand-gray-50 p-5 lg:border-b-0 lg:border-r lg:min-h-[calc(100vh-114px)]">
        <p className="text-xs text-brand-gray-500">
          {t("community:call_detail.loading_community", {
            defaultValue: "Loading community...",
          })}
        </p>
      </aside>
    );
  }

  const tags = Array.isArray(community.tags) ? community.tags : [];
  const createdLabel = formatMonthYear(community.createdAt);
  const moderators = community.moderators || [];
  const subCommunities = community.subCommunities || [];

  return (
    <aside className="border-b border-brand-gray-100 p-5 lg:border-b-0 lg:border-r lg:min-h-[calc(100vh-114px)]">
      <div className="flex flex-col gap-5 rounded-xl bg-brand-gray-50 p-4">
        <div className="flex items-center gap-3">
          <Avatar size="md">
            {community.avatarUrl ? (
              <AvatarImage src={community.avatarUrl} alt={community.name} />
            ) : null}
            <AvatarFallback>
              {community.initials || initialsOf(community.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="font-heading text-base leading-tight font-bold text-brand-gray-900 break-words pb-1">
              {community.name}
            </h2>
            {community.handle ? (
              <p className="truncate text-xs text-brand-gray-500">
                ID: {community.handle}
              </p>
            ) : null}
          </div>
        </div>

        {community.description ? (
          <p className="text-sm text-brand-gray-600">{community.description}</p>
        ) : null}

        {createdLabel ? (
          <p className="text-xs text-brand-gray-500">
            {t("common:community.created", { defaultValue: "Created" })}:{" "}
            {createdLabel}
          </p>
        ) : null}

        {tags.length ? (
          <div className="flex flex-wrap gap-1.5 border-t border-brand-gray-200 pt-4">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-brand-gray-200 bg-transparent px-3 py-1 text-xs font-medium text-brand-gray-700"
              >
                #{t}
              </span>
            ))}
          </div>
        ) : null}

        {moderators.length ? (
          <Section
            title={t("common:community.moderators", {
              defaultValue: "Moderators",
            })}
          >
            <ul className="flex flex-col gap-2 text-sm text-brand-gray-700">
              {moderators.map((m) => (
                <li key={m.documentId || m.id}>
                  <ProfileLink
                    userId={m.documentId || m.id}
                    className="hover:text-brand-teal-600"
                  >
                    {m.username || m.email || "Moderator"}
                  </ProfileLink>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {joinedUsers.length ? (
          <Section
            title={t("common:navbar.profile_dropdown.communities", {
              defaultValue: "Communities",
            })}
            action={
              joinedUsers.length > MAX_AVATAR_COUNT
                ? t("common:community.see_all", { defaultValue: "See all" })
                : undefined
            }
            onAction={() => setShowUsersModal(true)}
          >
            <div className="flex -space-x-2">
              {joinedUsers.slice(0, MAX_AVATAR_COUNT).map((u) => (
                <ProfileLink key={u.id} userId={u.id}>
                  <Avatar size="sm" className="ring-2 ring-white">
                    {u.avatarUrl ? (
                      <AvatarImage src={u.avatarUrl} alt={u.name} />
                    ) : null}
                    <AvatarFallback>{initialsOf(u.name)}</AvatarFallback>
                  </Avatar>
                </ProfileLink>
              ))}
              {joinedUsers.length > MAX_AVATAR_COUNT ? (
                <div className="flex size-8 items-center justify-center rounded-full bg-brand-gray-100 text-xs font-medium text-brand-gray-600 ring-2 ring-white">
                  +{joinedUsers.length - MAX_AVATAR_COUNT}
                </div>
              ) : null}
            </div>
          </Section>
        ) : null}

        {mentors.length ? (
          <Section
            title={t("profile:tabs.mentorship", { defaultValue: "Mentorship" })}
          >
            <ul className="flex flex-col gap-3">
              {mentors.map((m) => (
                <li key={m.id} className="flex items-start gap-3">
                  <ProfileLink userId={m.id}>
                    <Avatar size="md" className="shrink-0">
                      {m.avatarUrl ? (
                        <AvatarImage src={m.avatarUrl} alt={m.name} />
                      ) : null}
                      <AvatarFallback>{initialsOf(m.name)}</AvatarFallback>
                    </Avatar>
                  </ProfileLink>
                  <div className="min-w-0 flex-1">
                    <ProfileLink userId={m.id}>
                      <span className="text-sm font-semibold text-brand-gray-900 hover:text-brand-teal-600">
                        {m.name}
                      </span>
                    </ProfileLink>
                    <div className="truncate text-xs text-brand-gray-500 mt-0.5">
                      {m.role}
                    </div>
                    <span className="mt-1.5 inline-flex items-center rounded-full bg-brand-orange-50 px-2.5 py-0.5 text-[10px] font-semibold text-brand-orange-500">
                      {t("profile:tabs.mentorship", {
                        defaultValue: "Mentor",
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {subCommunities.length ? (
          <Section
            title={t("common:community.sub_communities", {
              defaultValue: "Sub-Communities",
            })}
          >
            <ul className="flex flex-col gap-2">
              {subCommunities.map((sc) => (
                <li key={sc.documentId || sc.id} className="text-sm">
                  <div className="font-medium text-brand-gray-900">
                    {sc.name}
                  </div>
                  {sc.subscribers ? (
                    <div className="text-xs text-brand-gray-500">
                      {formatNumber(sc.subscribers)}{" "}
                      {t("profile:sidebar.subscribers", {
                        defaultValue: "Subscribers",
                      })}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {attachments.length ? (
          <Section
            title={t("profile:tabs.resources", { defaultValue: "Resources" })}
            action={
              attachments.length > 3
                ? t("common:community.see_all", { defaultValue: "See all" })
                : undefined
            }
          >
            <ul className="flex flex-col gap-3">
              {attachments.slice(0, 3).map((att, idx) => (
                <li key={idx}>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:opacity-80"
                  >
                    <span className="flex size-9 flex-none items-center justify-center rounded-full bg-primary-50 text-primary-500">
                      {att.kind === "image" ? (
                        <ImageIcon className="size-4" />
                      ) : (
                        <FileText className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-brand-gray-900">
                        {att.name}
                      </div>
                      <div className="text-xs text-brand-gray-500">
                        {att.size}
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </div>

      <UsersListModal
        open={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        users={joinedUsers}
      />
    </aside>
  );
}

function Section({ title, action, onAction, children }) {
  return (
    <div className="flex flex-col gap-3 border-t border-brand-gray-100 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-normal text-[#484E51]">{title}</h3>
        {action ? (
          <button
            type="button"
            onClick={onAction}
            className="text-xs font-medium text-primary-500 hover:underline"
          >
            {action}
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/* ------------------------------ Users Modal ------------------------------ */

function UsersListModal({ open, onClose, users = [] }) {
  const { t } = useTranslation("community");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>
            {t("common:navbar.profile_dropdown.communities", {
              defaultValue: "Users",
            })}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[60vh]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-gray-100 bg-brand-gray-50 text-xs text-brand-gray-500">
                <th className="px-6 py-3 font-medium">
                  {t("profile:details.full_name", {
                    defaultValue: "User name",
                  })}
                </th>
                <th className="px-6 py-3 font-medium">
                  {t("profile:details.education_title", {
                    defaultValue: "Education",
                  })}
                </th>
                <th className="px-6 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gray-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <ProfileLink userId={u.id}>
                        <Avatar size="sm">
                          {u.avatarUrl ? (
                            <AvatarImage src={u.avatarUrl} alt={u.name} />
                          ) : null}
                          <AvatarFallback>{initialsOf(u.name)}</AvatarFallback>
                        </Avatar>
                      </ProfileLink>
                      <div className="min-w-0">
                        <ProfileLink userId={u.id}>
                          <div className="font-medium text-brand-gray-900 truncate hover:text-brand-teal-600">
                            {u.name}
                          </div>
                        </ProfileLink>
                        {u.position ? (
                          <div className="text-xs text-brand-gray-500 truncate">
                            {u.position}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    {u.educationLevel ? (
                      <div className="font-medium text-brand-gray-900">
                        {u.educationLevel}
                        {u.educationTopic ? ` in ${u.educationTopic}` : ""}
                      </div>
                    ) : (
                      <span className="text-brand-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center rounded-full text-brand-gray-400 hover:bg-brand-gray-50 hover:text-brand-gray-600"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------- Chat ---------------------------------- */

const VISIBILITY_LABELS = (t) => ({
  public: t("community:visibility.public", { defaultValue: "Public" }),
  restricted: t("community:call_card.limited_access", {
    defaultValue: "Limited access",
  }),
  private: t("community:visibility.private", { defaultValue: "Private" }),
});

function ChatHeader({
  call,
  isActive,
  visibility,
  onBack,
  onJoin,
  onRequestJoin,
  hasJoined,
  hasPendingRequest,
  showJoinButton,
  showRequestJoin,
  t,
}) {
  const datePrefix = isActive
    ? t("community:call_card.valid_till", { defaultValue: "Valid till" })
    : t("community:call_card.ended", { defaultValue: "Ended" });
  return (
    <div className="flex items-center justify-between gap-4 border-b border-brand-gray-100 px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("common:common.back", { defaultValue: "Back" })}
          className="inline-flex size-[34px] flex-none items-center justify-center rounded-full border border-[#E8ECEF] bg-[#E8ECEF] text-brand-gray-700 hover:bg-[#dde1e4]"
        >
          <ArrowLeft className="size-[14px]" />
        </button>
        <h2 className="truncate text-base font-semibold text-brand-gray-900">
          {call.title}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="inline-flex h-[34px] w-fit items-center divide-x divide-brand-gray-200 rounded-full bg-[#E8ECEF] text-sm font-medium text-brand-gray-700">
          <span className="inline-flex h-full items-center gap-2 px-4">
            {isActive && (
              <span className="size-2 rounded-full bg-green-500" />
            )}
            {isActive
              ? t("community:call_card.active", { defaultValue: "Active" })
              : t("community:call_card.completed", {
                  defaultValue: "Completed",
                })}
          </span>
          <span className="inline-flex h-full items-center gap-2 px-4">
            <Calendar className="size-4" />
            {datePrefix}: {formatShortDate(call.endDate)}
          </span>
          {visibility && visibility !== "public" && (
            <span className="inline-flex h-full items-center gap-2 px-4">
              {VISIBILITY_LABELS(t)[visibility] || visibility}
            </span>
          )}
        </div>
        {showJoinButton ? (
          <Button
            size="sm"
            className="rounded-full"
            onClick={onJoin}
          >
            {t("common:community.join", { defaultValue: "Join" })}
          </Button>
        ) : null}
        {showRequestJoin ? (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50"
            onClick={onRequestJoin}
          >
            {t("community:call_detail.request_to_join", {
              defaultValue: "Request to join",
            })}
          </Button>
        ) : null}
        {hasPendingRequest && !hasJoined ? (
          <span className="inline-flex h-[34px] items-center rounded-full bg-amber-50 px-4 text-sm font-medium text-amber-700">
            {t("community:call_detail.requested", {
              defaultValue: "Requested",
            })}
          </span>
        ) : null}
        {hasJoined ? (
          <span className="inline-flex h-[34px] items-center rounded-full bg-primary-50 px-4 text-sm font-medium text-primary-700">
            {t("community:call_detail.joined", { defaultValue: "Joined" })}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ChatThread({ messages = [], canPost = false }) {
  const { t } = useTranslation("community");

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-10 text-sm text-brand-gray-500">
        {canPost
          ? t("community:chat.no_messages_can_post", {
              defaultValue: "No messages yet — start the conversation below.",
            })
          : t("community:chat.no_messages", {
              defaultValue: "No messages yet.",
            })}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <ul className="flex flex-col gap-5">
        {messages.map((m, idx) => {
          const key = m.id || idx;
          if (m.type === "separator") {
            return (
              <li key={key} className="flex items-center justify-center">
                <span className="rounded-full bg-brand-gray-100 px-3 py-0.5 text-[11px] font-medium text-brand-gray-500">
                  {m.label}
                </span>
              </li>
            );
          }
          if (m.self) {
            return (
              <li key={key} className="flex justify-end">
                <div className="flex max-w-[70%] flex-col items-end gap-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-gray-900">
                      {t("community:chat.you", { defaultValue: "You" })}
                    </span>
                    <span className="text-[11px] text-brand-gray-400">
                      {m.time}
                    </span>
                  </div>
                  {m.attachment ? (
                    <ChatAttachment attachment={m.attachment} />
                  ) : null}
                  {m.text && m.text.replace(/<[^>]*>/g, "").trim() ? (
                    <div
                      className="rounded-2xl rounded-tr-sm bg-primary-500 px-4 py-2.5 text-sm text-white break-words [&_a]:underline [&_a]:text-white [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:m-0 [&_blockquote]:border-l-2 [&_blockquote]:border-white/40 [&_blockquote]:pl-3 [&_pre]:bg-white/10 [&_pre]:rounded-md [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-xs"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(m.text) }}
                    />
                  ) : null}
                </div>
              </li>
            );
          }
          return (
            <li key={key} className="flex items-start gap-3">
              <ProfileLink userId={m.authorId || m.author?.id || m.author}>
                <Avatar size="sm">
                  <AvatarImage src={m.avatarUrl} alt={m.author} />
                  <AvatarFallback>{initialsOf(m.author)}</AvatarFallback>
                </Avatar>
              </ProfileLink>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <ProfileLink userId={m.authorId || m.author?.id || m.author}>
                    <span className="text-sm font-semibold text-brand-gray-900 hover:text-brand-teal-600">
                      {m.author}
                    </span>
                  </ProfileLink>
                  <span className="text-[11px] text-brand-gray-400">
                    {m.time}
                  </span>
                </div>
                {m.attachment ? (
                  <ChatAttachment attachment={m.attachment} />
                ) : null}
                {m.text && m.text.replace(/<[^>]*>/g, "").trim() ? (
                  <div
                    className="w-fit rounded-2xl rounded-tl-sm bg-brand-gray-50 px-4 py-2.5 text-sm text-brand-gray-800 wrap-break-word [&_a]:underline [&_a]:text-primary-500 [&_ul]:ml-5 [&_ul]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:m-0 [&_blockquote]:border-l-2 [&_blockquote]:border-brand-gray-200 [&_blockquote]:pl-3 [&_pre]:bg-white [&_pre]:rounded-md [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-xs"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(m.text) }}
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ChatAttachment({ attachment }) {
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 rounded-xl border border-brand-gray-100 bg-white px-4 py-3 hover:bg-brand-gray-50 transition-colors"
    >
      <span className="flex size-9 flex-none items-center justify-center rounded-full bg-primary-50 text-primary-500">
        {attachment.kind === "image" ? (
          <ImageIcon className="size-4" />
        ) : (
          <FileText className="size-4" />
        )}
      </span>
      <div>
        <div className="text-sm font-medium text-brand-gray-900">
          {attachment.name}
        </div>
        <div className="text-xs text-brand-gray-500">{attachment.size}</div>
      </div>
    </a>
  );
}

function ChatComposer({ onSend, disabled = false }) {
  const { t } = useTranslation("community");
  const [value, setValue] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const plainText = htmlToPlainText(value).trim();
  const canSend = (plainText.length > 0 || file) && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSend?.(value, file);
    setValue("");
    setFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
    e.target.value = "";
  };

  return (
    <div className="border-t border-brand-gray-100 px-6 py-4">
      <RichTextEditor
        value={value}
        onChange={setValue}
        onKeyDown={handleKeyDown}
        placeholder={t("community:chat.write_placeholder", {
          defaultValue: "Write a message...",
        })}
        minHeight={96}
        toolbarExtras={
          <>
            <button
              type="button"
              aria-label={t("community:chat.attach_file", {
                defaultValue: "Attach file",
              })}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex size-7 items-center justify-center rounded-md text-brand-gray-500 hover:bg-brand-gray-50"
            >
              <Paperclip className="size-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        }
      />

      {file ? (
        <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-gray-50 px-3 py-2 text-sm text-brand-gray-700">
          <FileText className="size-4 text-brand-gray-400" />
          <span className="truncate max-w-[200px]">{file.name}</span>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="ml-1 text-brand-gray-400 hover:text-brand-gray-600"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <Button
          size="sm"
          className="rounded-full"
          onClick={submit}
          disabled={!canSend}
        >
          {t("community:chat.send", { defaultValue: "Send" })}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => {
            setValue("");
            setFile(null);
          }}
          disabled={!value.length && !file}
        >
          {t("community:chat.cancel", { defaultValue: "Cancel" })}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------- helpers -------------------------------- */

function initialsOf(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatMonthYear(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function formatShortDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function formatNumber(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatFileSize(kb) {
  if (!kb) return "";
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatChatTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  let hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${WEEKDAYS[d.getDay()]} ${hours}:${mins}${ampm}`;
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "profile",
        "community",
      ])),
    },
  };
}

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, File, XIcon, Loader2, Reply } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { getFullFileUrl } from "@/lib/utils";
import {
  fetchResource,
  fetchResourceComments,
  postResourceComment,
} from "@/lib/strapi";
import ProfileLink from "@/components/shared/ProfileLink";

const TYPE_LABEL_KEYS = {
  report: "resources.report",
  publication: "resources.publication",
  "practice-note": "resources.practice_note",
  "case-study": "resources.case_study",
};

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getAuthorName(author) {
  if (!author) return "";
  return (
    author.fullName ||
    `${author.firstName || ""} ${author.lastName || ""}`.trim() ||
    author.username ||
    author.email ||
    ""
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(dateStr);
}

function Comment({ comment, onReply, t, depth = 0 }) {
  const author = comment.author;
  const name = getAuthorName(author);
  const replies = comment.replies || [];

  return (
    <div
      className={depth > 0 ? "ml-8 border-l border-brand-gray-100 pl-4" : ""}
    >
      <div className="flex gap-3 py-4">
        <ProfileLink userId={author?.documentId || author?.id}>
          <Avatar size="sm" className="shrink-0 mt-0.5">
            <AvatarFallback className="bg-primary-100 text-primary-700 text-xs font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </ProfileLink>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-brand-gray-900">
              {name}
            </span>
            {author?.roleType && (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary-50 text-primary-700">
                {author.roleType.name || author.roleType}
              </span>
            )}
            <span className="text-xs text-brand-gray-400">
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-brand-gray-700">
            {comment.text}
          </p>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => onReply?.(comment)}
              className="flex items-center gap-1 text-xs text-brand-gray-500 hover:text-brand-gray-700"
            >
              <Reply className="size-3.5" />
              {t("resource_dialog.reply")}
            </button>
          </div>
        </div>
      </div>
      {replies.map((reply) => (
        <Comment
          key={reply.documentId || reply.id}
          comment={reply}
          onReply={onReply}
          t={t}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function ViewResourceDialog({
  open,
  onOpenChange,
  resource: resourceProp,
}) {
  const { t } = useTranslation("common");
  const { t: tCommunity } = useTranslation("community");
  const [fullResource, setFullResource] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const user = useAuthStore((s) => s.user);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const resourceId = resourceProp?.documentId;

  useEffect(() => {
    if (!open || !resourceId) {
      setFullResource(null);
      setReplyingTo(null);
      setCommentText("");
      return;
    }
    fetchResource(resourceId).then((res) => {
      if (res?.data) setFullResource(res.data);
    });
    setLoadingComments(true);
    fetchResourceComments(resourceId).then((res) => {
      setComments(Array.isArray(res?.data) ? res.data : []);
      setLoadingComments(false);
    });
  }, [open, resourceId]);

  const resource = fullResource || resourceProp;

  if (!resource) return null;

  const fileUrl = getFullFileUrl(resource.file?.url);
  const fileSize = formatFileSize(
    resource.file?.size ? resource.file.size * 1024 : 0,
  );
  const uploader = resource.uploadedBy;
  const uploaderName = getAuthorName(uploader);
  const topics = resource.topics || [];

  const handleDownload = async () => {
    if (!fileUrl) return;
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = resource.file?.name || resource.name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(fileUrl, "_blank");
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !resourceId) return;
    setPosting(true);
    try {
      const parentId = replyingTo?.documentId || replyingTo?.id || null;
      await postResourceComment(resourceId, commentText.trim(), parentId);
      setCommentText("");
      setReplyingTo(null);
      const res = await fetchResourceComments(resourceId);
      setComments(Array.isArray(res?.data) ? res.data : []);
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setPosting(false);
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setCommentText("");
    inputRef.current?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        showCloseButton={false}
        className="!flex h-[min(80vh,700px)] !flex-col overflow-hidden !p-0 !gap-0"
      >
        {/* Header — fixed */}
        <div className="shrink-0 flex items-start gap-4 px-6 pt-5 pb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary-100 bg-primary-50 mt-0.5">
            <File className="size-5 text-primary-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-brand-gray-500 mb-1">
              <span className="font-medium text-brand-gray-700">
                {t(TYPE_LABEL_KEYS[resource.resourceType]) ||
                  resource.resourceType}
              </span>
              {fileSize && (
                <>
                  <span className="size-1 rounded-full bg-brand-gray-300" />
                  <span>{fileSize}</span>
                </>
              )}
              <span className="size-1 rounded-full bg-brand-gray-300" />
              <span>
                {t("resources.uploaded")} {formatShortDate(resource.createdAt)}
              </span>
            </div>
            <h2 className="text-lg font-bold text-brand-gray-900 leading-tight">
              {resource.name}
            </h2>
          </div>
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 -mt-1 -mr-1"
              />
            }
          >
            <XIcon />
          </DialogClose>
        </div>

        {/* Topic tags — fixed */}
        {topics.length > 0 && (
          <div className="shrink-0 flex flex-wrap gap-1.5 px-6 pb-4">
            {topics.map((topic) => (
              <Badge
                key={topic}
                variant="outline"
                className="rounded-full bg-primary-50 border-primary-200 text-primary-700 text-xs font-medium px-2.5 py-1"
              >
                #{topic}
              </Badge>
            ))}
          </div>
        )}

        {/* Author row — fixed */}
        {uploaderName && (
          <div className="shrink-0 flex items-center justify-between gap-3 border-t border-brand-gray-100 px-6 py-3">
            <div className="flex items-center gap-3">
              <ProfileLink userId={uploader?.documentId || uploader?.id}>
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-xs font-semibold">
                    {getInitials(uploaderName)}
                  </AvatarFallback>
                </Avatar>
              </ProfileLink>
              <div>
                <div className="flex items-center gap-2">
                  <ProfileLink userId={uploader?.documentId || uploader?.id}>
                    <span className="text-sm font-semibold text-brand-gray-900 hover:text-brand-teal-600 cursor-pointer">
                      {uploaderName}
                    </span>
                  </ProfileLink>
                  {uploader?.roleType && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary-50 text-primary-700">
                      {uploader.roleType.name || uploader.roleType}
                    </span>
                  )}
                </div>
                {uploader?.title && (
                  <p className="text-xs text-brand-gray-500">
                    {uploader.title}
                  </p>
                )}
              </div>
            </div>
            <ProfileLink
              userId={uploader?.documentId || uploader?.id}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
            >
              {tCommunity("resource_dialog.view_profile")}
            </ProfileLink>
          </div>
        )}

        {/* Description */}
        {resource.description && (
          <div className="shrink-0 border-t border-brand-gray-100 px-6 py-4">
            <h3 className="text-sm font-semibold text-brand-gray-900 mb-2">
              {tCommunity("resource_dialog.description")}
            </h3>
            <p className="text-sm leading-relaxed text-brand-gray-700 whitespace-pre-line">
              {resource.description}
            </p>
          </div>
        )}

        {/* Scrollable comments area */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto border-t border-brand-gray-100"
        >
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold text-brand-gray-900">
                {t("resources.discussion")}
              </h3>
              <span className="text-sm text-brand-gray-500">
                {comments.length}{" "}
                {comments.length !== 1
                  ? tCommunity("resource_dialog.comments")
                  : tCommunity("resource_dialog.comment")}
              </span>
            </div>

            {loadingComments ? (
              <div className="py-6 text-center text-sm text-brand-gray-500">
                Loading...
              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-brand-gray-200 p-8 text-center text-sm text-brand-gray-500">
                {tCommunity("resource_dialog.no_comments")}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-brand-gray-100">
                {comments.map((c) => (
                  <Comment
                    key={c.documentId || c.id}
                    comment={c}
                    onReply={handleReply}
                    t={tCommunity}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment input — fixed at bottom */}
        {user && (
          <div className="shrink-0 border-t border-brand-gray-100 px-6 py-3">
            {replyingTo && (
              <div className="mb-2 flex items-center gap-2 text-xs text-brand-gray-500">
                <Reply className="size-3" />
                <span>
                  {tCommunity("resource_dialog.replying_to")}{" "}
                  <strong className="text-brand-gray-700">
                    {getAuthorName(replyingTo.author)}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="ml-auto text-brand-gray-400 hover:text-brand-gray-600"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            )}
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                className="flex-1 h-10 rounded-full border border-brand-gray-200 bg-white px-4 text-sm text-brand-gray-900 placeholder:text-brand-gray-400 outline-none focus:border-primary-500 transition-colors"
                placeholder={
                  replyingTo
                    ? tCommunity("resource_dialog.write_reply")
                    : tCommunity("resource_dialog.leave_comment")
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && commentText.trim())
                    handlePostComment();
                }}
              />
              {commentText.trim() && (
                <Button
                  size="sm"
                  className="rounded-full shrink-0"
                  disabled={posting}
                  onClick={handlePostComment}
                >
                  {posting && <Loader2 className="size-3 animate-spin mr-1" />}
                  {tCommunity("resource_dialog.post")}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end border-t border-brand-gray-100 px-6 py-4">
          {fileUrl && (
            <Button size="md" className="gap-2" onClick={handleDownload}>
              {t("resources.download")}
              <Download className="size-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

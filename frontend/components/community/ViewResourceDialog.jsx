import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  FileText,
  Download,
  XIcon,
  Bookmark,
  Share2,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import {
  fetchResource,
  fetchResourceComments,
  postResourceComment,
} from "@/lib/strapi";

const TYPE_LABELS = {
  report: "Report",
  publication: "Publication",
  "practice-note": "Practice note",
  "case-study": "Case study",
};

function getFullFileUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const backendOrigin = (
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337/api"
  ).replace(/\/api\/?$/, "");
  return `${backendOrigin}${url}`;
}

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

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return formatDate(dateStr);
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

function Comment({ comment }) {
  const author = comment.author;
  const name = getAuthorName(author);

  return (
    <div className="flex gap-3 py-4 border-t border-brand-gray-100 first:border-t-0 first:pt-1">
      <Avatar size="sm" className="shrink-0">
        <AvatarFallback className="bg-primary-100 text-primary-700 text-xs font-semibold">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-brand-gray-900">
            {name}
          </span>
          {author?.roleType && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary-50 text-primary-700">
              {author.roleType}
            </span>
          )}
          <span className="text-xs text-brand-gray-500">
            · {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-brand-gray-700">
          {comment.text}
        </p>
      </div>
    </div>
  );
}

export default function ViewResourceDialog({ open, onOpenChange, resource: resourceProp }) {
  const [saved, setSaved] = useState(false);
  const [fullResource, setFullResource] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const user = useAuthStore((s) => s.user);

  const resourceId = resourceProp?.documentId;

  // Fetch full resource detail (with uploadedBy populated) when dialog opens
  useEffect(() => {
    if (!open || !resourceId) {
      setFullResource(null);
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

  // Use full resource if loaded, otherwise fall back to list data
  const resource = fullResource || resourceProp;

  if (!resource) return null;

  const fileUrl = getFullFileUrl(resource.file?.url);
  const fileName = resource.file?.name || "";
  const fileSize = formatFileSize(
    resource.file?.size ? resource.file.size * 1024 : 0,
  );
  const uploader = resource.uploadedBy;
  const uploaderName = getAuthorName(uploader);

  const handleDownload = async () => {
    if (!fileUrl) return;
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName || resource.name;
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
      await postResourceComment(resourceId, commentText.trim());
      setCommentText("");
      // Reload comments
      const res = await fetchResourceComments(resourceId);
      setComments(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        showCloseButton={false}
        className="flex max-h-[90vh] flex-col overflow-hidden p-0 gap-0"
      >
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-brand-gray-100 px-6 py-5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-[10px] border border-primary-100 bg-primary-50">
            <FileText className="size-6 text-primary-700" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-brand-gray-500 mb-1">
              <span>
                {TYPE_LABELS[resource.resourceType] || resource.resourceType}
              </span>
              <span className="size-1 rounded-full bg-brand-gray-400" />
              <span>Public</span>
            </div>
            <h2 className="text-lg font-bold text-brand-gray-900 leading-tight">
              {resource.name}
            </h2>
            {(fileName || fileSize) && (
              <div className="mt-1 flex items-center gap-2 text-sm text-brand-gray-500">
                {fileName && <span>{fileName}</span>}
                {fileName && fileSize && (
                  <span className="size-1 rounded-full bg-brand-gray-400" />
                )}
                {fileSize && <span>{fileSize}</span>}
              </div>
            )}
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
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {/* Uploader + Download row */}
        <div className="flex items-center justify-between gap-3 border-b border-brand-gray-100 bg-brand-gray-50 px-6 py-3">
          <div className="flex items-center gap-3">
            {uploaderName ? (
              <>
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-xs font-semibold">
                    {getInitials(uploaderName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-brand-gray-900">
                    {uploaderName}
                  </p>
                  <p className="text-xs text-brand-gray-500">
                    Uploaded {formatDate(resource.createdAt)}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-brand-gray-500">
                Uploaded {formatDate(resource.createdAt)}
              </p>
            )}
          </div>
          {fileUrl && (
            <Button size="sm" className="gap-2" onClick={handleDownload}>
              <Download className="size-4" />
              Download
              {resource.file?.ext
                ? ` · ${resource.file.ext.replace(".", "").toUpperCase()}`
                : ""}
            </Button>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Description */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-gray-600">
              Description
            </h3>
            <p className="text-sm leading-relaxed text-brand-gray-700">
              {resource.description || "No description provided."}
            </p>
          </section>

          {/* Discussion */}
          <section className="mt-6 border-t border-brand-gray-100 pt-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-gray-600">
              Discussion{" "}
              <span className="ml-2 rounded-full bg-brand-gray-100 px-2 py-0.5 text-xs font-medium text-brand-gray-500 normal-case tracking-normal">
                {comments.length} comment{comments.length !== 1 ? "s" : ""}
              </span>
            </h3>

            {/* Comment composer */}
            {user && (
              <div className="mb-4 rounded-xl border border-brand-gray-200 bg-white p-3 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/10 transition-all">
                <div className="flex gap-3">
                  <Avatar size="sm" className="shrink-0">
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-xs font-semibold">
                      {getInitials(
                        user.fullName ||
                          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                          user.username ||
                          "",
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <textarea
                      className="w-full resize-none border-none bg-transparent text-sm text-brand-gray-900 placeholder:text-brand-gray-400 outline-none min-h-[44px] leading-relaxed"
                      placeholder="Share how you used this, what worked, or what to watch out for..."
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="flex items-center justify-end gap-2 border-t border-brand-gray-100 pt-2 mt-1">
                      {commentText.trim() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCommentText("")}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        size="sm"
                        disabled={!commentText.trim() || posting}
                        onClick={handlePostComment}
                      >
                        {posting && (
                          <Loader2 className="size-3 animate-spin mr-1" />
                        )}
                        Post comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comment list */}
            {loadingComments ? (
              <div className="py-6 text-center text-sm text-brand-gray-500">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-gray-200 p-8 text-center text-sm text-brand-gray-500">
                No comments yet. Be the first to share how you&apos;re using
                this resource.
              </div>
            ) : (
              <div className="flex flex-col">
                {comments.map((c) => (
                  <Comment
                    key={c.documentId || c.id}
                    comment={c}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-brand-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon-sm"
              className={
                saved
                  ? "border-amber-300 bg-amber-50 text-amber-500"
                  : ""
              }
              onClick={() => setSaved(!saved)}
              title="Save to your library"
            >
              <Bookmark
                className="size-4"
                fill={saved ? "currentColor" : "none"}
              />
            </Button>
            <Button variant="outline" size="icon-sm" title="Share">
              <Share2 className="size-4" />
            </Button>
            <span className="text-xs text-brand-gray-500">Save · Share</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-brand-gray-600"
            >
              Report
            </Button>
            <DialogClose
              render={<Button variant="outline" size="sm" />}
            >
              Close
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

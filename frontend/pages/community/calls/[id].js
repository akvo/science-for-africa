import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  AlignLeft,
  Paperclip,
  Calendar,
  Check,
  FileText,
  ImageIcon,
  ChevronDown,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchChatMessages,
  fetchCollaborationCall,
  fetchCommunityByName,
  postChatMessage,
} from "@/lib/strapi";
import { useAuthStore } from "@/lib/auth-store";

const TEXT_STYLES = [
  { value: "normal", label: "Normal text" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "quote", label: "Quote" },
  { value: "code", label: "Code" },
];

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
  return {
    id: row.id,
    self: currentUserId != null && author.id === currentUserId,
    author: authorName,
    time: formatChatTime(row.createdAt),
    text: row.text,
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

  const handleSendMessage = async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed || !id || sending) return;
    setSending(true);
    try {
      const res = await postChatMessage(id, trimmed);
      const row = res?.data;
      if (row) {
        setMessages((prev) => [...prev, mapChatMessage(row, user?.id)]);
      }
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
        role: i.invitedUser.position || "Institutional researcher",
        avatarUrl: i.invitedUser.avatarUrl,
      }));
  }, [call]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-sm text-brand-gray-500">
        Loading collaboration call...
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-sm text-brand-gray-500">
        Collaboration call not found.
      </div>
    );
  }

  const isActive = (call.status || "").toLowerCase() === "active";

  return (
    <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
      <CommunityDetailsSidebar community={community} mentors={mentors} />

      <section className="flex min-w-0 flex-col">
        <ChatHeader
          call={call}
          isActive={isActive}
          onBack={() => router.back()}
        />
        <ChatThread messages={messages} />
        <ChatComposer onSend={handleSendMessage} disabled={sending} />
      </section>
    </div>
  );
}

/* ----------------------- Community details sidebar ---------------------- */

function CommunityDetailsSidebar({ community, mentors = [] }) {
  if (!community) {
    return (
      <aside className="flex flex-col gap-5 border-b border-brand-gray-100 bg-white p-5 lg:border-b-0 lg:border-r lg:min-h-[calc(100vh-114px)]">
        <p className="text-xs text-brand-gray-500">Loading community...</p>
      </aside>
    );
  }

  const tags = Array.isArray(community.tags) ? community.tags : [];
  const createdLabel = formatMonthYear(community.createdAt);
  const moderators = community.moderators || [];
  const subCommunities = community.subCommunities || [];

  return (
    <aside className="flex flex-col gap-5 border-b border-brand-gray-100 bg-white p-5 lg:border-b-0 lg:border-r lg:min-h-[calc(100vh-114px)]">
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
          <h2 className="truncate font-heading text-base font-bold text-brand-gray-900">
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
        <p className="text-xs text-brand-gray-500">Created: {createdLabel}</p>
      ) : null}

      <div className="flex items-center gap-6">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-brand-gray-500">
            Subscribers
          </div>
          <div className="text-sm font-semibold text-brand-gray-900">
            {formatNumber(community.subscribers || 0)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-brand-gray-500">
            Posts
          </div>
          <div className="text-sm font-semibold text-brand-gray-900">
            {formatNumber(community.posts || 0)}
          </div>
        </div>
      </div>

      {tags.length ? (
        <div className="flex flex-wrap gap-1.5 border-t border-brand-gray-100 pt-4">
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
        <Section title="Moderators">
          <ul className="flex flex-col gap-2 text-sm text-brand-gray-700">
            {moderators.map((m) => (
              <li key={m.documentId || m.id}>
                {m.username || m.email || "Moderator"}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {mentors.length ? (
        <Section title="Mentors">
          <ul className="flex flex-col gap-3">
            {mentors.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <Avatar size="sm">
                  {m.avatarUrl ? (
                    <AvatarImage src={m.avatarUrl} alt={m.name} />
                  ) : null}
                  <AvatarFallback>{initialsOf(m.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-brand-gray-900">
                      {m.name}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-brand-orange-50 px-2 py-0.5 text-[10px] font-medium text-brand-orange-500">
                      Mentor
                    </span>
                  </div>
                  <div className="truncate text-xs text-brand-gray-500">
                    {m.role}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {subCommunities.length ? (
        <Section title="Sub-Communities">
          <ul className="flex flex-col gap-2">
            {subCommunities.map((sc) => (
              <li key={sc.documentId || sc.id} className="text-sm">
                <div className="font-medium text-brand-gray-900">{sc.name}</div>
                {sc.subscribers ? (
                  <div className="text-xs text-brand-gray-500">
                    {formatNumber(sc.subscribers)} Subscribers
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </aside>
  );
}

function Section({ title, action, children }) {
  return (
    <div className="flex flex-col gap-3 border-t border-brand-gray-100 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-brand-gray-900">{title}</h3>
        {action ? (
          <button
            type="button"
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

/* -------------------------------- Chat ---------------------------------- */

function ChatHeader({ call, isActive, onBack }) {
  const datePrefix = isActive ? "Valid till" : "Ended";
  return (
    <div className="flex items-center justify-between gap-4 border-b border-brand-gray-100 px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
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
            <span
              className={`size-2 rounded-full ${
                isActive ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            {isActive ? "Active" : "Completed"}
          </span>
          <span className="inline-flex h-full items-center gap-2 px-4">
            <Calendar className="size-4" />
            {datePrefix}: {formatShortDate(call.endDate)}
          </span>
        </div>
        <Button size="sm" variant="outline" className="rounded-full">
          Request to join
        </Button>
      </div>
    </div>
  );
}

function ChatThread({ messages = [] }) {
  if (!messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-10 text-sm text-brand-gray-500">
        No messages yet — start the conversation below.
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
              <li
                key={key}
                className="flex items-center justify-center"
              >
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
                  <div className="rounded-2xl rounded-tr-sm bg-primary-500 px-4 py-2.5 text-sm text-white whitespace-pre-wrap break-words">
                    {m.text}
                  </div>
                  <span className="text-[11px] text-brand-gray-400">
                    {m.time}
                  </span>
                </div>
              </li>
            );
          }
          return (
            <li key={key} className="flex items-start gap-3">
              <Avatar size="sm">
                <AvatarImage src={m.avatarUrl} alt={m.author} />
                <AvatarFallback>{initialsOf(m.author)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-brand-gray-900">
                    {m.author}
                  </span>
                  <span className="text-[11px] text-brand-gray-400">
                    {m.time}
                  </span>
                </div>
                {m.attachment ? (
                  <div className="inline-flex items-center gap-3 rounded-xl bg-brand-gray-50 px-3 py-2">
                    <span className="flex size-9 flex-none items-center justify-center rounded-md bg-white text-brand-gray-500">
                      {m.attachment.kind === "image" ? (
                        <ImageIcon className="size-4" />
                      ) : (
                        <FileText className="size-4" />
                      )}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-brand-gray-900">
                        {m.attachment.name}
                      </div>
                      <div className="text-xs text-brand-gray-500">
                        {m.attachment.size}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-fit rounded-2xl rounded-tl-sm bg-brand-gray-50 px-4 py-2.5 text-sm text-brand-gray-800 whitespace-pre-wrap break-words">
                    {m.text}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ChatComposer({ onSend, disabled = false }) {
  const [value, setValue] = useState("");
  const [textStyle, setTextStyle] = useState("normal");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed);
    setValue("");
  };

  const handleKeyDown = (e) => {
    // Cmd/Ctrl + Enter sends; plain Enter inserts a newline.
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-brand-gray-100 px-6 py-4">
      <div className="rounded-xl border border-brand-gray-100 bg-white">
        <div className="flex flex-wrap items-center gap-1 border-b border-brand-gray-100 px-3 py-2">
          <TextStyleDropdown value={textStyle} onChange={setTextStyle} />
          <ToolbarButton icon={Bold} label="Bold" />
          <ToolbarButton icon={Italic} label="Italic" />
          <ToolbarButton icon={LinkIcon} label="Link" />
          <ToolbarButton icon={List} label="List" />
          <ToolbarButton icon={AlignLeft} label="Align" />
          <ToolbarButton icon={Paperclip} label="Attach" />
        </div>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          className="min-h-[96px] border-0 focus:ring-0"
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button
          size="sm"
          className="rounded-full"
          onClick={submit}
          disabled={!canSend}
        >
          Send
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => setValue("")}
          disabled={!value.length}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function TextStyleDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const active = TEXT_STYLES.find((s) => s.value === value) || TEXT_STYLES[0];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-brand-gray-600 hover:bg-brand-gray-50"
      >
        {active.label}
        <ChevronDown
          className={`size-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-brand-gray-100 bg-white py-1 shadow-lg">
          {TEXT_STYLES.map((s) => {
            const isActive = s.value === value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  onChange(s.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-brand-gray-50 ${
                  isActive
                    ? "text-primary-500 font-medium"
                    : "text-brand-gray-700"
                }`}
              >
                <span>{s.label}</span>
                {isActive ? <Check className="size-4" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ToolbarButton({ icon: Icon, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex size-7 items-center justify-center rounded-md text-brand-gray-500 hover:bg-brand-gray-50"
    >
      <Icon className="size-4" />
    </button>
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

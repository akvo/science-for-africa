import { useEffect, useMemo, useState } from "react";
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
import { fetchCollaborationCall, fetchCommunityByName } from "@/lib/strapi";

/**
 * Collaboration call detail page.
 *
 * Layout (desktop):
 * [ Community details sidebar ] [ Chat area ]
 *
 * The sidebar shows details for the community this call belongs to (fetched
 * by `call.communityName`). The chat thread and attachments are static
 * placeholders — there is no messaging backend yet. Swap in a real chat
 * feed once available.
 */
export default function CollaborationCallDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [call, setCall] = useState(null);
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchCollaborationCall(id)
      .then((res) => setCall(res?.data || null))
      .finally(() => setLoading(false));
  }, [id]);

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
        <ChatThread />
        <ChatComposer />
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
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
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

function ChatThread() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <ul className="flex flex-col gap-5">
        {PLACEHOLDER_MESSAGES.map((m, idx) => {
          if (m.type === "separator") {
            return (
              <li
                key={`sep-${idx}`}
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
              <li key={idx} className="flex justify-end">
                <div className="flex max-w-[70%] flex-col items-end gap-1">
                  <div className="rounded-2xl rounded-tr-sm bg-primary-500 px-4 py-2.5 text-sm text-white">
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
            <li key={idx} className="flex items-start gap-3">
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
                  <div className="w-fit rounded-2xl rounded-tl-sm bg-brand-gray-50 px-4 py-2.5 text-sm text-brand-gray-800">
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

function ChatComposer() {
  const [value, setValue] = useState("");

  return (
    <div className="border-t border-brand-gray-100 px-6 py-4">
      <div className="rounded-xl border border-brand-gray-100 bg-white">
        <div className="flex flex-wrap items-center gap-1 border-b border-brand-gray-100 px-3 py-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-brand-gray-600 hover:bg-brand-gray-50"
          >
            Normal text
            <ChevronDown className="size-3" />
          </button>
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
          placeholder="Enter a description..."
          className="min-h-[96px] border-0 focus:ring-0"
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" className="rounded-full">
          Send
        </Button>
        <Button size="sm" variant="outline" className="rounded-full">
          Cancel
        </Button>
      </div>
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

/* --------------------------- placeholder data --------------------------- */
/* Messaging is not yet backed by Strapi. Replace once available. */

const PLACEHOLDER_MESSAGES = [
  {
    author: "Phoenix Baker",
    time: "Friday 2:20pm",
    text: "Hey Olivia, can you please review the latest design when you can?",
  },
  {
    author: "Phoenix Baker",
    time: "Friday 2:20pm",
    attachment: {
      name: "Latest design screenshot.jpg",
      size: "1.2 MB",
      kind: "image",
    },
  },
  {
    author: "Phoenix Baker",
    time: "Friday 2:20pm",
    text: "Hey Olivia, can you please review the latest design when you can?",
  },
  {
    self: true,
    time: "Friday 2:20pm",
    text: "Sure thing, I'll have a look today.",
  },
  {
    author: "Phoenix Baker",
    time: "Friday 2:20pm",
    text: "Hey Olivia, can you please review the latest design when you can?",
  },
  { type: "separator", label: "Today" },
  {
    self: true,
    time: "Friday 2:20pm",
    attachment: {
      name: "Tech design requirements.pdf",
      size: "200 KB",
      kind: "file",
    },
  },
  {
    author: "Phoenix Baker",
    time: "Friday 2:20pm",
    text: "Hey Olivia, can you please review the latest design when you can?",
  },
];

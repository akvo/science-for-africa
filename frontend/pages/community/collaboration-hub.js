import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Calendar, Lock, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CommunityLeftNav from "@/components/community/CommunityLeftNav";
import { SocialButton } from "@/components/auth/social-auth";
import { fetchCollaborationCalls, fetchCommunities } from "@/lib/strapi";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const useHasHydrated = () => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    if (useAuthStore.persist.hasHydrated()) {
      setTimeout(() => setHydrated(true), 0);
    }
    return unsub;
  }, []);
  return hydrated;
};

const FILTERS = [
  { key: "all", labelKey: "hub.all" },
  { key: "active", labelKey: "hub.active" },
  { key: "completed", labelKey: "hub.completed" },
];

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function formatCount(n) {
  if (n == null) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(n);
}

function initialsOf(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/* ─────────────── Collaboration Call Card (hub variant) ─────────────── */

function CollaborationHubCard({ call, onView, t }) {
  const isActive = new Date(call.endDate) >= new Date();
  const datePrefix = isActive
    ? t("call_card.valid_till")
    : t("call_card.ended");

  return (
    <article className="flex items-start justify-between gap-4 border-b border-brand-gray-100 py-5 lg:px-6">
      <div className="min-w-0 flex-1">
        {/* Status pill */}
        <div className="mb-3 inline-flex h-8.5 w-fit items-center divide-x divide-brand-gray-200 rounded-full bg-[#E8ECEF] text-sm font-medium text-brand-gray-700">
          <span className="inline-flex h-full items-center gap-2 px-4">
            <span
              className={`size-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`}
            />
            {isActive ? t("call_card.active") : t("call_card.completed")}
          </span>
          <span className="inline-flex h-full items-center gap-2 px-4">
            <Calendar className="size-4" />
            {datePrefix}: {formatDate(call.endDate)}
          </span>
          {call.visibility && call.visibility !== "public" && (
            <span className="inline-flex h-full items-center gap-2 px-4">
              {call.visibility === "private" ? (
                <Lock className="size-3.5" />
              ) : (
                <Link2 className="size-3.5" />
              )}
              {call.visibility === "private"
                ? t("call_card.private")
                : t("call_card.limited_access")}
            </span>
          )}
        </div>

        {/* Title & description */}
        <h3 className="text-base font-semibold text-brand-gray-900">
          {call.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-brand-gray-600">
          {call.description}
        </p>

        {/* Topic tags */}
        {call.topics?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {call.topics.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                size="sm"
                className="h-auto px-3 py-1 text-xs font-medium"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        ) : null}

        {/* Community name */}
        {call.communityName && (
          <div className="mt-3 flex items-center gap-2 text-xs text-brand-gray-500">
            <span>{call.communityName}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to community if slug is available
              }}
              className="font-medium text-primary-500 hover:underline"
            >
              {t("call_card.view_community")}
            </button>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="border-transparent bg-[#E8ECEF] hover:bg-[#dde2e6] shrink-0"
        onClick={() => onView?.(call)}
      >
        {t("call_card.view")}
      </Button>
    </article>
  );
}

/* ─────────────────── Right Sidebar ─────────────────── */

function RightSidebar({ communities, isAuthenticated }) {
  const router = useRouter();
  const { t: tCommunity } = useTranslation("community");

  return (
    <aside className="hidden xl:flex xl:w-72 xl:flex-none xl:flex-col xl:gap-6 xl:border-l xl:border-brand-gray-100 xl:pl-6 xl:pt-4">
      {/* Sign-up CTA (only for unauthenticated) */}
      {!isAuthenticated && (
        <div
          className="rounded-2xl border border-[#D9DCDE] p-5"
          style={{
            background:
              "linear-gradient(217deg, rgba(0, 88, 80, 0.20) 9.62%, rgba(0, 88, 80, 0.00) 57.43%)",
          }}
        >
          <h3 className="text-sm font-semibold text-brand-gray-900">
            {tCommunity("hub.new_to_platform")}
          </h3>
          <p className="mt-1 text-xs text-brand-gray-500">
            {tCommunity("hub.new_to_platform_description")}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-full border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50"
              onClick={() => router.push("/signup")}
            >
              {tCommunity("hub.continue_with_email")}
            </Button>
            <SocialButton
              provider="google"
              className="w-full !h-auto !py-1.5 !text-sm !rounded-full"
            />
          </div>
          <p className="mt-3 text-[10px] text-brand-gray-400 leading-tight">
            {tCommunity("hub.terms_agreement")}
          </p>
        </div>
      )}

      {/* Popular communities */}
      {communities.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-brand-gray-900 mb-3">
            {tCommunity("hub.popular_communities")}
          </h3>
          <ul className="flex flex-col gap-3">
            {communities.slice(0, 4).map((c) => (
              <li key={c.documentId || c.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/community/${c.slug}`)}
                  className="flex items-center gap-3 w-full text-left cursor-pointer hover:opacity-80"
                >
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary-50 text-primary-500 text-xs font-semibold">
                      {c.initials || initialsOf(c.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-brand-gray-900 truncate">
                      {c.name}
                    </div>
                    <div className="text-xs text-brand-gray-500">
                      {formatCount(c.subscribers)}{" "}
                      {tCommunity("hub.subscribers")}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => router.push("/community")}
            className="mt-3 text-xs font-medium text-primary-500 hover:underline"
          >
            {tCommunity("hub.explore_all")}
          </button>
        </div>
      )}
    </aside>
  );
}

/* ─────────────────── Main Page ─────────────────── */

export default function CollaborationHubPage() {
  const { t: tCommunity } = useTranslation("community");
  const router = useRouter();
  const hydrated = useHasHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [calls, setCalls] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!hydrated) return;
    setTimeout(() => setLoading(true), 0);
    Promise.all([fetchCollaborationCalls(), fetchCommunities()]).then(
      ([callsRes, commRes]) => {
        setCalls(Array.isArray(callsRes?.data) ? callsRes.data : []);
        setCommunities(Array.isArray(commRes?.data) ? commRes.data : []);
        setLoading(false);
      },
    );
  }, [hydrated]);

  // Collect unique topics for filter chips
  const allTopics = useMemo(
    () => Array.from(new Set(calls.flatMap((c) => c.topics || []))),
    [calls],
  );

  // Filter by status
  const filtered = useMemo(() => {
    const now = new Date();
    if (filter === "active") {
      return calls.filter((c) => new Date(c.endDate) >= now);
    }
    if (filter === "completed") {
      return calls.filter((c) => new Date(c.endDate) < now);
    }
    return calls;
  }, [calls, filter]);

  const handleView = (call) => {
    router.push(`/community/calls/${call.documentId || call.id}`);
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Left sidebar */}
      <aside className="w-full lg:w-65 lg:flex-none lg:border-r lg:border-brand-gray-100 lg:pr-4 lg:pt-4 lg:sticky lg:top-28.5 lg:self-start lg:h-[calc(100vh-114px)] lg:overflow-y-auto">
        <CommunityLeftNav activeKey="collaboration-hub" />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 min-w-0 py-4">
        <div className="flex flex-1 flex-col min-w-0">
          {/* Header with filter chips */}
          <div className="flex items-center gap-4 mb-4 lg:pl-6 flex-wrap">
            <h1 className="text-lg font-semibold text-brand-gray-900">
              {tCommunity("hub.title")}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              {FILTERS.map((f) => {
                const isActive = filter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      "inline-flex h-8.5 items-center rounded-full px-3.5 text-sm font-medium transition-colors border",
                      isActive
                        ? "border-[#D0D5DD] bg-primary-50 text-brand-gray-900"
                        : "border-brand-gray-200 bg-white text-brand-gray-700 hover:bg-brand-gray-50",
                    )}
                  >
                    {tCommunity(f.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="py-10 text-center text-sm text-brand-gray-500">
              {tCommunity("hub.loading")}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mx-6 rounded-xl border border-dashed border-brand-gray-200 p-10 text-center text-sm text-brand-gray-500">
              {tCommunity("hub.no_calls")}
            </div>
          ) : (
            <div className="flex flex-col">
              {filtered.map((call) => (
                <CollaborationHubCard
                  key={call.documentId || call.id}
                  call={call}
                  onView={handleView}
                  t={tCommunity}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <RightSidebar
          communities={communities}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "community"])),
    },
  };
}

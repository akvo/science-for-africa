import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CommunityLeftNav from "@/components/community/CommunityLeftNav";
import { fetchCommunities, joinCommunity, leaveCommunity } from "@/lib/strapi";
import { useAuthStore } from "@/lib/auth-store";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const ALL_TAG = "All";

function formatCount(n) {
  if (n == null) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(n);
}

function CommunityCard({ community, onJoin, t }) {
  const router = useRouter();
  const joined = community.isMember;

  return (
    <div
      className="flex h-[154px] cursor-pointer flex-col justify-between border border-brand-gray-200 bg-white p-6 -mb-px -mr-px transition-shadow hover:shadow-sm hover:z-10 hover:relative"
      onClick={() => router.push(`/community/${community.slug}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar size="md" className="flex-none">
            {community.avatarUrl ? (
              <AvatarImage src={community.avatarUrl} alt={community.name} />
            ) : null}
            <AvatarFallback className="bg-primary-50 text-primary-500 text-xs font-semibold">
              {community.initials || community.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-brand-gray-900">
              {community.name}
            </h3>
            <p className="text-xs text-brand-gray-500">
              {formatCount(community.subscribers)} {t("community.subscribers")}
            </p>
          </div>
        </div>
        <Button
          variant={joined ? "primary" : "tertiary"}
          size="sm"
          className={joined ? "flex-none" : "flex-none bg-[#E8ECEF] text-black hover:bg-[#dde1e4]"}
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.(community);
          }}
        >
          {joined ? t("community.joined") : t("community.join")}
        </Button>
      </div>

      {community.description ? (
        <p className="line-clamp-2 text-sm text-brand-gray-600">
          {community.description}
        </p>
      ) : null}
    </div>
  );
}

export default function CommunitiesPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState(ALL_TAG);
  const tagsScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetchCommunities().then((res) => {
      const items = res?.data || [];
      setCommunities(items);
      setLoading(false);
    });
  }, []);

  const handleJoin = async (community) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const action = community.isMember ? leaveCommunity : joinCommunity;
    const res = await action(community.documentId);
    if (res?.data) {
      setCommunities((prev) =>
        prev.map((c) =>
          c.documentId === community.documentId
            ? { ...c, isMember: res.data.isMember, subscribers: res.data.subscribers }
            : c,
        ),
      );
    }
  };

  const updateScrollButtons = () => {
    const el = tagsScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = tagsScrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [communities]);

  const scrollTags = (direction) => {
    const el = tagsScrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * Math.max(el.clientWidth * 0.8, 200),
      behavior: "smooth",
    });
  };

  // Collect unique tags from all communities
  const allTags = [
    ALL_TAG,
    ...Array.from(
      new Set(communities.flatMap((c) => c.tags || [])),
    ),
  ];

  // Filter communities by selected tag
  const filtered =
    activeTag === ALL_TAG
      ? communities
      : communities.filter((c) => c.tags?.includes(activeTag));

  return (
    <div className="flex flex-col lg:flex-row">
      <aside className="w-full lg:w-[260px] lg:flex-none lg:border-r lg:border-brand-gray-100 lg:pr-4 lg:pt-4 lg:sticky lg:top-28.5 lg:self-start lg:h-[calc(100vh-114px)] lg:overflow-y-auto">
        <CommunityLeftNav activeKey="communities" />
      </aside>

      <div className="flex flex-1 flex-col min-w-0 py-4">
        <div className="flex items-center justify-between gap-4 mb-6 lg:pl-6">
          <div>
            <h1 className="font-heading text-4xl font-bold text-brand-teal-800">
              {t("community.explore")}
            </h1>
            <p className="mt-1 text-sm text-brand-gray-500">
              {t("community.explore_description")}
            </p>
          </div>
          <Button
            variant="outline"
            size="md"
            className="flex-none gap-2"
            onClick={() => router.push("/community/create")}
          >
            <Plus className="size-4" />
            {t("community.create_community")}
          </Button>
        </div>

        {/* Tag filter chips */}
        <div className="relative border-t border-brand-gray-200 py-4 lg:pl-6">
          <div
            ref={tagsScrollRef}
            className="flex gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-10"
          >
            {allTags.map((tag) => {
              const isActive = activeTag === tag;
              return (
                <Badge
                  key={tag}
                  variant="outline"
                  className={
                    "cursor-pointer whitespace-nowrap flex-none rounded-full border-[#D0D5DD] h-auto py-2 px-[14px] text-[14px] leading-[18px] font-normal text-[#344054] " +
                    (isActive ? "bg-primary-50" : "bg-transparent")
                  }
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
          {canScrollLeft ? (
            <button
              type="button"
              aria-label="Scroll tags left"
              onClick={() => scrollTags(-1)}
              className="absolute left-0 lg:left-6 top-1/2 -translate-y-1/2 flex size-[40px] items-center justify-center rounded-full border border-brand-gray-200 bg-white text-brand-gray-700 shadow-sm hover:bg-brand-gray-50"
            >
              <ArrowLeft className="size-[18px]" />
            </button>
          ) : null}
          {canScrollRight ? (
            <button
              type="button"
              aria-label="Scroll tags right"
              onClick={() => scrollTags(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 flex size-[40px] items-center justify-center rounded-full border border-brand-gray-200 bg-white text-brand-gray-700 shadow-sm hover:bg-brand-gray-50"
            >
              <ArrowRight className="size-[18px]" />
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-brand-gray-500">
            {t("community.loading_communities")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-gray-200 p-10 text-center text-sm text-brand-gray-500">
            {t("community.no_communities")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 -mt-px [&>*:nth-child(3n+1)]:border-l-0">
            {filtered.map((community) => (
              <CommunityCard
                key={community.documentId || community.id}
                community={community}
                onJoin={handleJoin}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

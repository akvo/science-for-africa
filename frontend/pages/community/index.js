import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CommunityLeftNav from "@/components/community/CommunityLeftNav";
import { fetchCommunities } from "@/lib/strapi";

const ALL_TAG = "All";

function formatCount(n) {
  if (n == null) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(n);
}

function CommunityCard({ community, onJoin }) {
  const router = useRouter();

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
            <AvatarFallback className="text-xs font-semibold">
              {community.initials || community.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-brand-gray-900">
              {community.name}
            </h3>
            <p className="text-xs text-brand-gray-500">
              {formatCount(community.subscribers)} Subscribers
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex-none"
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.(community);
          }}
        >
          Join
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
  const router = useRouter();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState(ALL_TAG);

  useEffect(() => {
    fetchCommunities().then((res) => {
      const items = res?.data || [];
      setCommunities(items);
      setLoading(false);
    });
  }, []);

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
      <aside className="w-full lg:w-52 lg:flex-none lg:border-r lg:border-brand-gray-100 lg:pr-4 lg:pt-4 lg:sticky lg:top-28.5 lg:self-start lg:h-[calc(100vh-114px)] lg:overflow-y-auto">
        <CommunityLeftNav activeKey="communities" />
      </aside>

      <div className="flex flex-1 flex-col min-w-0 py-4">
        <div className="flex items-center justify-between gap-4 mb-6 lg:pl-6">
          <div>
            <h1 className="font-heading text-4xl font-bold text-brand-teal-800">
              Explore communities
            </h1>
            <p className="mt-1 text-sm text-brand-gray-500">
              Lorem ipsum dolor sit amet consectetur. In et pellentesque ut
              fermentum bibendum mi imperdiet.
            </p>
          </div>
          <Button
            variant="outline"
            size="md"
            className="flex-none gap-2"
            onClick={() => router.push("/community/create")}
          >
            <Plus className="size-4" />
            Create community
          </Button>
        </div>

        {/* Tag filter chips */}
        <div className="flex flex-wrap gap-2 border-t border-brand-gray-200 py-4 lg:pl-6">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={activeTag === tag ? "primary" : "outline"}
              className="cursor-pointer"
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-brand-gray-500">
            Loading communities...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-gray-200 p-10 text-center text-sm text-brand-gray-500">
            No communities found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 -mt-px [&>*:nth-child(3n+1)]:border-l-0">
            {filtered.map((community) => (
              <CommunityCard
                key={community.documentId || community.id}
                community={community}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

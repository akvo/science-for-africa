import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Meta from "@/components/seo/Meta";
import { ArrowLeft, ChevronDown, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CommunityLeftNav from "@/components/community/CommunityLeftNav";
import CommunityHeader from "@/components/community/CommunityHeader";
import CommunityAboutCard from "@/components/community/CommunityAboutCard";
import CollaborationCallsList from "@/components/community/CollaborationCallsList";
import ResourcesList from "@/components/community/ResourcesList";
import CreateCollaborationDialog from "@/components/collaboration/CreateCollaborationDialog";
import { useCollaborationStore } from "@/lib/collaboration-store";
import { useAuthStore } from "@/lib/auth-store";
import { fetchCommunity, fetchCollaborationCalls, joinCommunity, leaveCommunity } from "@/lib/strapi";
import { COMMUNITY_TABS } from "@/lib/community-mock-data";

function mapCallFromApi(c) {
  return {
    id: c.documentId || c.id,
    title: c.title,
    description: c.description,
    status: (c.status || "Active").toLowerCase(),
    endsAt: c.endDate,
    tags: Array.isArray(c.topics) ? c.topics : [],
  };
}

/**
 * Community detail page (forum).
 *
 * NOTE: This is scaffolding. Mock data is imported from
 * `lib/community-mock-data.js`. Once the Strapi forum endpoints
 * exist, swap the mocks for real fetches (getServerSideProps or
 * a client-side hook) without changing the component tree.
 */
export default function CommunityDetailPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const openCollaborationDialog = useCollaborationStore((s) => s.open);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calls, setCalls] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const { slug } = router.query;

  const openCollaboration = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    openCollaborationDialog(community?.name);
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const action = isMember ? leaveCommunity : joinCommunity;
    const res = await action(community.documentId);
    if (res?.data) {
      setIsMember(res.data.isMember);
      setCommunity((prev) => ({
        ...prev,
        stats: { ...prev.stats, subscribers: res.data.subscribers },
      }));
    }
  };

  useEffect(() => {
    if (!slug) return;
    fetchCommunity(slug).then((res) => {
      const items = res?.data || [];
      if (items.length > 0) {
        const c = items[0];
        // Normalise shape for existing components
        const normalized = {
          ...c,
          about: c.description,
          stats: { subscribers: c.subscribers || 0, posts: c.posts || 0 },
          subCommunities: (c.subCommunities || []).map((sc) => ({
            id: sc.documentId || sc.id,
            name: sc.name,
            subscribers: sc.subscribers || 0,
          })),
          moderators: (c.moderators || []).map((m) => ({
            id: m.documentId || m.id,
            name: m.username || m.email,
          })),
        };
        setCommunity(normalized);
        if (c.isMember !== undefined) {
          setIsMember(c.isMember);
        }
      }
      setLoading(false);
    });
  }, [slug]);

  // Load collaboration calls for this community whenever the community name
  // becomes available. Backend filters by `communityName` string match.
  useEffect(() => {
    if (!community?.name) return;
    fetchCollaborationCalls(community.name).then((res) => {
      const items = Array.isArray(res?.data) ? res.data : [];
      setCalls(items.map(mapCallFromApi));
    });
  }, [community?.name]);

  const activeTab = router.query.tab || "collaboration-calls";

  const handleTabChange = (value) => {
    router.replace(
      { pathname: router.pathname, query: { ...router.query, tab: value } },
      undefined,
      { shallow: true },
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row">
        <aside className="w-full lg:w-65 lg:flex-none lg:border-r lg:border-brand-gray-100 lg:pr-4">
          <CommunityLeftNav activeKey="communities" />
        </aside>
        <div className="flex flex-1 items-center justify-center py-20 text-sm text-brand-gray-500">
          {t("community.loading")}
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex flex-col lg:flex-row">
        <aside className="w-full lg:w-65 lg:flex-none lg:border-r lg:border-brand-gray-100 lg:pr-4">
          <CommunityLeftNav activeKey="communities" />
        </aside>
        <div className="flex flex-1 items-center justify-center py-20 text-sm text-brand-gray-500">
          {t("community.not_found")}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <Meta title={community?.name} />
      <aside className="w-full lg:w-65 lg:flex-none lg:border-r lg:border-brand-gray-100 lg:pr-4 lg:sticky lg:top-28.5 lg:self-start lg:h-[calc(100vh-114px)] lg:overflow-y-auto">
        <CommunityLeftNav activeKey="communities" />
      </aside>

      <div className="flex flex-1 flex-col gap-6 min-w-0">
        <CommunityHeader
          community={community}
          onCreatePost={openCollaboration}
          isJoined={isMember}
          onJoin={handleJoin}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="flex flex-col gap-5 min-w-0 lg:border-r lg:border-brand-gray-100">
            <div className="flex items-center justify-between gap-4 py-1 lg:px-6">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Back"
                className="inline-flex size-10 items-center justify-center rounded-full border border-brand-gray-100 bg-brand-gray-50 text-brand-gray-700 hover:bg-brand-gray-100"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="md" className="gap-2">
                  <ChevronDown className="size-4" />
                  {t("community.sort_by")}
                </Button>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList
                variant="line"
                className="!h-auto w-full justify-start gap-8 border-y border-brand-gray-100 bg-transparent px-0 py-0 lg:pl-6 lg:-mr-px lg:w-[calc(100%+1px)]"
              >
                {COMMUNITY_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="-mb-px flex-none gap-2 px-1 pt-2 pb-3 after:-bottom-px after:inset-x-0 after:h-0.5 hover:text-primary-500 data-active:text-primary-500 group-data-[variant=line]/tabs-list:data-active:text-primary-500 after:bg-primary-500"
                    >
                      {Icon ? <Icon className="size-4" /> : null}
                      {t(tab.i18nKey)}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="feed" className="pt-2">
                <EmptyTab label={t("community.tab_feed")} comingSoon={t("community.coming_soon")} />
              </TabsContent>
              <TabsContent value="discussions" className="pt-2">
                <EmptyTab label={t("community.tab_discussions")} comingSoon={t("community.coming_soon")} />
              </TabsContent>
              <TabsContent value="collaboration-calls" className="pt-2">
                <CollaborationCallsList
                  calls={calls}
                  onView={(call) => router.push(`/community/calls/${call.id}`)}
                  onCreate={openCollaboration}
                />
              </TabsContent>
              <TabsContent value="resources" className="pt-2">
                <ResourcesList communityDocumentId={community?.documentId} />
              </TabsContent>
            </Tabs>
          </div>

          <aside className="w-full">
            <CommunityAboutCard community={community} />
          </aside>
        </div>
      </div>

      <CreateCollaborationDialog />
    </div>
  );
}

function EmptyTab({ label, comingSoon }) {
  return (
    <div className="rounded-xl border border-dashed border-brand-gray-200 p-10 text-center text-sm text-brand-gray-500">
      {label} {comingSoon}
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

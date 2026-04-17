import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Meta from "@/components/seo/Meta";
import { ArrowLeft, ChevronDown, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import CommunityLeftNav from "@/components/community/CommunityLeftNav";
import CommunityHeader from "@/components/community/CommunityHeader";
import CommunityAboutCard from "@/components/community/CommunityAboutCard";
import CollaborationCallsList from "@/components/community/CollaborationCallsList";
import CreateCollaborationDialog from "@/components/collaboration/CreateCollaborationDialog";
import { useCollaborationStore } from "@/lib/collaboration-store";
import { useAuthStore } from "@/lib/auth-store";
import {
  COMMUNITY_TABS,
  MOCK_COLLABORATION_CALLS,
  MOCK_COMMUNITY,
} from "@/lib/community-mock-data";

/**
 * Community detail page (forum).
 *
 * NOTE: This is scaffolding. Mock data is imported from
 * `lib/community-mock-data.js`. Once the Strapi forum endpoints
 * exist, swap the mocks for real fetches (getServerSideProps or
 * a client-side hook) without changing the component tree.
 */
export default function CommunityDetailPage() {
  const router = useRouter();
  const openCollaborationDialog = useCollaborationStore((s) => s.open);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const openCollaboration = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    openCollaborationDialog();
  };
  // Keep the default stable between SSR and first client render to avoid
  // hydration mismatches. `router.query` is empty during SSR and populated
  // only after hydration.
  const initialTab = "collaboration-calls";

  // TODO: fetch by slug from Strapi
  const community = MOCK_COMMUNITY;
  const calls = MOCK_COLLABORATION_CALLS;

  const handleTabChange = (value) => {
    router.replace(
      { pathname: router.pathname, query: { ...router.query, tab: value } },
      undefined,
      { shallow: true },
    );
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <Meta title={community?.name} />
      <aside className="w-full lg:w-52 lg:flex-none lg:border-r lg:border-brand-gray-100 lg:pr-4 lg:sticky lg:top-28.5 lg:self-start lg:h-[calc(100vh-114px)] lg:overflow-y-auto">
        <CommunityLeftNav activeKey="communities" />
      </aside>

      <div className="flex flex-1 flex-col gap-6 min-w-0">
        <CommunityHeader
          community={community}
          onCreatePost={openCollaboration}
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
                <Button
                  size="md"
                  className="gap-2 rounded-full"
                  onClick={openCollaboration}
                >
                  <Plus className="size-4" />
                  Create post
                </Button>
                <Button variant="outline" size="md" className="gap-2">
                  <ChevronDown className="size-4" />
                  Sort by
                </Button>
              </div>
            </div>

            <Tabs
              defaultValue={initialTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList
                variant="line"
                className="h-auto! w-full justify-start gap-8 border-y border-brand-gray-100 bg-transparent px-0 py-1 lg:pl-6"
              >
                {COMMUNITY_TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <TabsTrigger
                      key={t.value}
                      value={t.value}
                      className="-mb-px flex-none gap-2 px-1 pt-2 pb-3 after:-bottom-px after:inset-x-0 after:h-0.5"
                    >
                      {Icon ? <Icon className="size-4" /> : null}
                      {t.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="feed" className="pt-2">
                <EmptyTab label="Feed" />
              </TabsContent>
              <TabsContent value="discussions" className="pt-2">
                <EmptyTab label="Discussions" />
              </TabsContent>
              <TabsContent value="collaboration-calls" className="pt-2">
                <CollaborationCallsList
                  calls={calls}
                  onView={(call) => router.push(`/community/calls/${call.id}`)}
                />
              </TabsContent>
              <TabsContent value="resources" className="pt-2">
                <EmptyTab label="Resources" />
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

function EmptyTab({ label }) {
  return (
    <div className="rounded-xl border border-dashed border-brand-gray-200 p-10 text-center text-sm text-brand-gray-500">
      {label} content coming soon.
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

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ProfileLayout from "@/components/profile/ProfileLayout";
import CommunitiesTab from "@/components/profile/CommunitiesTab";
import Meta from "@/components/seo/Meta";
import { useTranslation } from "next-i18next";

export default function CommunitiesPage() {
  const { t } = useTranslation("profile");

  return (
    <>
      <Meta
        title={t("tabs.communities") || "My Communities"}
        description={t("communities.description")}
      />
      <ProfileLayout activeTab="communities">
        <CommunitiesTab />
      </ProfileLayout>
    </>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["profile", "common"])),
    },
  };
}

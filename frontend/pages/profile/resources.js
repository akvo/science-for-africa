import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ProfileLayout from "@/components/profile/ProfileLayout";
import ResourcesTab from "@/components/profile/ResourcesTab";
import Meta from "@/components/seo/Meta";
import { useTranslation } from "next-i18next";

export default function ResourcesPage() {
  const { t } = useTranslation("profile");

  return (
    <>
      <Meta
        title={t("tabs.resources") || "Resources"}
        description={t("resources.description")}
      />
      <ProfileLayout activeTab="resources">
        <ResourcesTab />
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

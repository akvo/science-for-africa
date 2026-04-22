import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ProfileLayout from "@/components/profile/ProfileLayout";
import CollaborationTab from "@/components/profile/CollaborationTab";
import Meta from "@/components/seo/Meta";
import { useTranslation } from "next-i18next";

export default function CollaborationPage() {
  const { t } = useTranslation("profile");

  return (
    <>
      <Meta
        title={t("collaboration.title") || "My Collaborations"}
        description={t("collaboration.description")}
      />
      <ProfileLayout activeTab="collaboration">
        <CollaborationTab />
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

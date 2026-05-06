import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ProfileLayout from "@/components/profile/ProfileLayout";
import MentorshipTab from "@/components/profile/MentorshipTab";
import Meta from "@/components/seo/Meta";
import { useTranslation } from "next-i18next";

export default function MentorshipPage() {
  const { t } = useTranslation("profile");

  return (
    <>
      <Meta
        title={t("mentorship.title") || "Mentorship"}
        description={t("mentorship.description")}
      />
      <ProfileLayout activeTab="mentorship">
        <MentorshipTab />
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

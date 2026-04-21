import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ProfileLayout from "@/components/profile/ProfileLayout";
import DetailsTab from "@/components/profile/DetailsTab";
import Meta from "@/components/seo/Meta";
import { useTranslation } from "next-i18next";

export default function ProfilePage() {
  const { t } = useTranslation("common");

  return (
    <>
      <Meta
        title={t("profile.profile_title") || "My Profile"}
        description={t("profile.profile_description")}
      />
      <ProfileLayout activeTab="details">
        <DetailsTab />
      </ProfileLayout>
    </>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import PublicProfileWrapper from "@/components/profile/PublicProfileWrapper";
import EmptyState from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";

const PublicProfilePage = () => {
  const { t } = useTranslation(["profile", "common"]);

  return (
    <PublicProfileWrapper activeTab="posts">
      <div className="space-y-6">
        <EmptyState
          title={t("profile:posts.empty_title", {
            defaultValue: "No posts yet",
          })}
          description={t("profile:posts.empty_description_public", {
            defaultValue: "Public posts will appear here",
          })}
          icon={FileText}
        />
      </div>
    </PublicProfileWrapper>
  );
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["profile", "common"])),
  },
});

export default PublicProfilePage;

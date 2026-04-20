import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { MoveLeft } from "lucide-react";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

const Custom404 = () => {
  const { t } = useTranslation("common");

  return (
    <MainLayout title={t("common.error_404.title")}>
      <div className="flex flex-col items-center justify-center py-24 min-h-[70vh] text-center">
        <p className="text-display-md font-bold text-brand-teal-600 mb-2">
          404
        </p>

        <h1 className="text-display-sm text-brand-teal-900 mb-4 uppercase">
          {t("common.error_404.title")}
        </h1>

        <p className="text-lg text-brand-gray-500 max-w-md mx-auto mb-10">
          {t("common.error_404.description")}
        </p>

        <Button
          variant="primary"
          size="xl"
          asChild
          className="rounded-full px-12 group"
        >
          <Link href="/" className="flex items-center gap-2">
            <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t("common.error_404.back_home")}
          </Link>
        </Button>

        <div className="mt-24 text-sm text-brand-gray-400">
          <p>© 2026 Science for Africa. All rights reserved.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Custom404;

import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { Rocket } from "lucide-react";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

const ComingSoon = () => {
  const { t } = useTranslation("common");

  return (
    <MainLayout title={t("common.coming_soon.title")}>
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] text-center">
        <div className="mb-8 p-4 bg-brand-teal-50 rounded-full animate-bounce">
          <Rocket className="w-12 h-12 text-brand-teal-600" />
        </div>

        <h1 className="text-display-md text-brand-teal-900 mb-4 uppercase tracking-tight">
          {t("common.coming_soon.title")}
        </h1>

        <p className="text-xl text-brand-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
          {t("common.coming_soon.description")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button
            variant="primary"
            size="xl"
            asChild
            className="rounded-full px-10"
          >
            <Link href="/">{t("common.coming_soon.back_home")}</Link>
          </Button>

          <Button
            variant="outline"
            size="xl"
            asChild
            className="rounded-full px-10"
          >
            <Link href="/contact">{t("navbar.contact")}</Link>
          </Button>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-left">
          <div className="p-6 bg-brand-gray-50 rounded-2xl border border-brand-gray-100 opacity-60">
            <div className="h-2 w-12 bg-brand-teal-500 rounded-full mb-4" />
            <h3 className="font-bold text-brand-gray-900 mb-2">
              Network Expansion
            </h3>
            <p className="text-sm text-brand-gray-500">
              Connecting more research hubs across the continent.
            </p>
          </div>
          <div className="p-6 bg-brand-gray-50 rounded-2xl border border-brand-gray-100 opacity-60">
            <div className="h-2 w-12 bg-brand-teal-900 rounded-full mb-4" />
            <h3 className="font-bold text-brand-gray-900 mb-2">
              Collaborative Tools
            </h3>
            <p className="text-sm text-brand-gray-500">
              Real-time peer review and collaboration workspace.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ComingSoon;

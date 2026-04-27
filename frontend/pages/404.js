import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Meta from "@/components/seo/Meta";

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
    <>
      <Meta title={t("common.error_404.title")} />
      <div className="py-24 px-4">
        {/* Breadcrumb Header Alignment */}
        <div className="flex items-center gap-2 mb-12">
          <span className="text-sm font-bold text-brand-teal-900">SFA</span>
          <span className="text-brand-gray-300">/</span>
          <span className="text-sm font-medium text-brand-gray-500">
            Error 404
          </span>
        </div>

        <div className="max-w-4xl">
          <p className="text-display-md font-bold text-brand-teal-600 mb-2">
            404
          </p>

          <h1 className="text-display-sm font-bold text-brand-teal-900 mb-4 uppercase tracking-tight">
            {t("common.error_404.title")}
          </h1>

          <p className="text-xl text-brand-gray-500 mb-12 leading-relaxed max-w-md font-medium">
            {t("common.error_404.description")}
          </p>

          <Button
            variant="primary"
            size="xl"
            asChild
            className="rounded-full px-12 group h-14 bg-brand-teal-900 hover:bg-brand-teal-800"
          >
            <Link href="/" className="flex items-center gap-2">
              <MoveLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              {t("common.error_404.back_home")}
            </Link>
          </Button>
        </div>

        <div className="mt-32 pt-8 border-t border-brand-gray-100 text-sm text-brand-gray-400">
          <p>© 2026 Science for Africa. All rights reserved.</p>
        </div>
      </div>
    </>
  );
};

export default Custom404;

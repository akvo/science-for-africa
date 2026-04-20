import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import Meta from "@/components/seo/Meta";

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
    <>
      <Meta title={t("common.coming_soon.title")} />
      <div className="py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Breadcrumb Header Alignment */}
        <div className="flex items-center gap-2 mb-12">
          <span className="text-sm font-bold text-brand-teal-900">SFA</span>
          <span className="text-brand-gray-300">/</span>
          <span className="text-sm font-medium text-brand-gray-500">
            {t("common.coming_soon.title")}
          </span>
        </div>

        <div className="max-w-4xl">
          <div className="mb-10 w-64 h-64 bg-brand-teal-50 rounded-full flex items-center justify-center">
            <Rocket className="w-32 h-32 text-brand-teal-600" />
          </div>

          <h1 className="text-display-md font-bold text-brand-teal-900 mb-4 uppercase tracking-tight">
            {t("common.coming_soon.title")}
          </h1>

          <p className="text-xl text-brand-gray-500 mb-12 leading-relaxed max-w-2xl font-medium">
            {t("common.coming_soon.description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button
              variant="primary"
              size="xl"
              asChild
              className="rounded-full px-12 h-14 bg-brand-teal-900 hover:bg-brand-teal-800 w-full sm:w-auto"
            >
              <Link href="/">{t("common.coming_soon.back_home")}</Link>
            </Button>

            <Button
              variant="outline"
              size="xl"
              asChild
              className="rounded-full px-12 h-14 border-brand-gray-200 text-brand-gray-600 hover:bg-brand-gray-50 w-full sm:w-auto"
            >
              <Link href="/contact">{t("navbar.contact")}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-brand-gray-100 grid grid-cols-1 md:grid-cols-2 gap-12 opacity-60">
          <div>
            <div className="h-1 w-12 bg-brand-teal-500 rounded-full mb-4" />
            <h3 className="font-bold text-brand-gray-900 mb-2">
              Platform Integration
            </h3>
            <p className="text-brand-gray-500 max-w-sm">
              We are currently optimizing this feature for your research
              workflow.
            </p>
          </div>
          <div>
            <div className="h-1 w-12 bg-brand-orange-500 rounded-full mb-4" />
            <h3 className="font-bold text-brand-gray-900 mb-2">
              Secure Environment
            </h3>
            <p className="text-brand-gray-500 max-w-sm">
              Ensuring the highest standards of data security and accessibility.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComingSoon;

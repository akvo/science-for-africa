import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Meta from "@/components/seo/Meta";
import BlockRenderer from "@/components/shared/BlockRenderer";
import { fetchLandingPage } from "@/lib/strapi";

export async function getStaticProps({ locale }) {
  const landingData = await fetchLandingPage(locale);

  return {
    props: {
      landingPage: landingData?.data || null,
      ...(await serverSideTranslations(locale, ["common"])),
    },
    revalidate: 60, // Revalidate every minute
  };
}

export default function Home({ landingPage }) {
  const { t } = useTranslation("common");

  return (
    <>
      <Meta
        title={t("seo.home_title")}
        description={t("seo.home_description")}
      />

      {landingPage?.blocks ? (
        <BlockRenderer blocks={landingPage.blocks} />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-teal-900 font-medium">
            Loading Science for Africa...
          </p>
        </div>
      )}
    </>
  );
}

Home.noContainer = true;
Home.showFooter = true;

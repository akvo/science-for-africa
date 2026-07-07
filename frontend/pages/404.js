import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Meta from "@/components/seo/Meta";
import ComingSoonContent from "@/components/shared/ComingSoonContent";

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
      <Meta title={t("common.coming_soon.title")} />
      <ComingSoonContent />
    </>
  );
};

export default Custom404;

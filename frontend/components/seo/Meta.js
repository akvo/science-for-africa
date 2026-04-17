import Head from "next/head";
import { useTranslation } from "next-i18next";

/**
 * Meta Component
 *
 * Handles browser page titles and SEO metadata.
 * Pattern: [Title] | Science for Africa
 */
const Meta = ({ title, description, canonical }) => {
  const { t } = useTranslation("common");
  const siteName = "Science for Africa";

  // If title is provided, append site name. Otherwise use site name only.
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta
        name="description"
        content={
          description ||
          t("seo.description", "Advancing Science for Africa's Future.")
        }
      />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <meta property="og:title" content={fullTitle} />
      <meta
        property="og:description"
        content={
          description ||
          t("seo.description", "Advancing Science for Africa's Future.")
        }
      />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
};

export default Meta;

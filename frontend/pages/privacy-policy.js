import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Meta from "@/components/seo/Meta";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "privacy-policy"])),
    },
  };
}

// DRY Components for Legal Pages
const LegalSection = ({ title, children, id, className = "" }) => (
  <section id={id} className={`space-y-6 ${className}`}>
    {title && (
      <h2 className="text-display-xs font-bold text-brand-teal-900">{title}</h2>
    )}
    <div className="text-md text-brand-gray-700 leading-relaxed space-y-4">
      {children}
    </div>
  </section>
);

const SubSection = ({ title, children, className = "" }) => (
  <div className={`space-y-4 ${className}`}>
    {title && (
      <h3 className="text-lg font-bold text-brand-teal-900">{title}</h3>
    )}
    <div className="text-md text-brand-gray-700 leading-relaxed">
      {children}
    </div>
  </div>
);

const BulletList = ({ items, variant = "dot" }) => (
  <ul className="space-y-3 ml-1">
    {items.map((item, i) => (
      <li key={i} className="flex gap-3">
        <span className="text-brand-gray-400 shrink-0 mt-1">
          {variant === "check" ? "✓" : "•"}
        </span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export default function PrivacyPolicy() {
  const { t } = useTranslation("privacy-policy");

  return (
    <>
      <Meta title={t("seo.title")} description={t("seo.description")} />

      {/* Hero Section */}
      <div className="bg-gray-100 border-b border-brand-gray-100 w-full">
        <div className="max-w-4xl mx-auto py-20 px-4">
          <header className="text-center">
            <p className="text-sm font-bold text-brand-gray-900 mb-4">
              {t("title")}
            </p>
            <h1 className="text-display-lg font-bold text-brand-teal-900 mb-8 leading-tight">
              {t("subtitle")}
            </h1>
            <p className="text-base text-brand-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t("intro")}
            </p>
          </header>
        </div>
      </div>

      {/* Content Body */}
      <div className="max-w-4xl mx-auto py-16 md:py-24 px-4">
        <div className="space-y-20">
          {/* Aligned With */}
          <div className="space-y-6">
            <p className="text-md font-bold text-brand-teal-900">
              {t("aligned_with.title")}
            </p>
            <BulletList
              items={t("aligned_with.points", { returnObjects: true })}
            />
          </div>

          {/* Privacy Policy Main Content */}
          <div className="space-y-16">
            <LegalSection title={t("scope.title")} id="scope">
              <p>{t("scope.content")}</p>
              <p className="font-bold">{t("scope.acknowledgment")}</p>
            </LegalSection>

            <LegalSection title={t("principles.title")} id="principles">
              <p className="italic text-brand-gray-500">
                {t("principles.intro")}
              </p>
              <BulletList
                items={t("principles.points", { returnObjects: true })}
              />
              <p className="text-sm pt-4 border-t border-brand-gray-100">
                {t("principles.footer")}
              </p>
            </LegalSection>

            <LegalSection title={t("collection.title")} id="collection">
              <p className="italic text-brand-gray-500">
                {t("collection.intro")}
              </p>
              <div className="space-y-8">
                {t("collection.sections", { returnObjects: true }).map(
                  (section, i) => (
                    <SubSection key={i} title={section.title}>
                      <BulletList items={section.points} />
                    </SubSection>
                  ),
                )}
              </div>
              <p className="text-md font-bold text-brand-teal-900 border-t border-brand-gray-100 pt-6">
                {t("collection.footer")}
              </p>
            </LegalSection>

            <LegalSection title={t("lawful_basis.title")} id="lawful-basis">
              <p>{t("lawful_basis.intro")}</p>
              <BulletList
                items={t("lawful_basis.points", { returnObjects: true })}
                variant="check"
              />
              <p className="text-sm italic">{t("lawful_basis.footer")}</p>
            </LegalSection>

            <LegalSection title={t("usage.title")} id="usage">
              <p>{t("usage.intro")}</p>
              <BulletList items={t("usage.points", { returnObjects: true })} />
              <p className="font-bold text-brand-orange-700 pt-4">
                {t("usage.footer")}
              </p>
            </LegalSection>

            <LegalSection title={t("sharing.title")} id="sharing">
              <p className="font-bold text-brand-gray-900">
                {t("sharing.intro")}
              </p>
              <p>{t("sharing.sharing_with_intro")}</p>
              <BulletList
                items={t("sharing.points", { returnObjects: true })}
              />
              <p className="text-md font-medium text-brand-teal-900 border-t border-brand-gray-100 pt-6">
                {t("sharing.transfer_footer")}
              </p>
            </LegalSection>

            <LegalSection title={t("retention.title")} id="retention">
              <p>{t("retention.intro")}</p>
              <BulletList
                items={t("retention.points", { returnObjects: true })}
              />
              <p className="italic">{t("retention.footer")}</p>
            </LegalSection>

            <LegalSection title={t("security.title")} id="security">
              <p>{t("security.intro")}</p>
              <BulletList
                items={t("security.points", { returnObjects: true })}
              />
            </LegalSection>

            <LegalSection title={t("rights.title")} id="rights">
              <p>{t("rights.intro")}</p>
              <BulletList items={t("rights.points", { returnObjects: true })} />
              <p className="font-medium pt-4">{t("rights.footer")}</p>
            </LegalSection>

            <LegalSection title={t("contact.title")} id="contact">
              <p className="text-lg opacity-90">{t("contact.intro")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-gray-500 mb-2">
                    {t("contact.email_label")}
                  </p>
                  <p className="text-base font-bold text-brand-teal-900">
                    {t("contact.email_value")}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-gray-500 mb-2">
                    {t("contact.organisation_label")}
                  </p>
                  <p className="text-base font-bold text-brand-teal-900">
                    {t("contact.organisation_value")}
                  </p>
                </div>
              </div>
            </LegalSection>
          </div>

          {/* Divider */}
          <hr className="border-brand-gray-200" />

          {/* Terms of Use Section */}
          <div className="space-y-16">
            <header className="space-y-4">
              <h1 className="text-display-md font-bold text-brand-teal-900">
                {t("terms.title")}
              </h1>
              <p className="text-lg italic text-brand-gray-600">
                {t("terms.intro")}
              </p>
              <p className="font-bold text-brand-gray-900">
                {t("terms.acceptance")}
              </p>
            </header>

            <LegalSection title={t("terms.purpose.title")}>
              <p className="italic text-brand-gray-500">
                {t("terms.purpose.intro")}
              </p>
              <BulletList
                items={t("terms.purpose.points", { returnObjects: true })}
              />
              <p className="text-sm font-bold text-brand-teal-700 pt-4">
                {t("terms.purpose.footer")}
              </p>
            </LegalSection>

            <LegalSection title={t("terms.registration.title")}>
              <BulletList
                items={t("terms.registration.points", { returnObjects: true })}
              />
            </LegalSection>

            <LegalSection title={t("terms.professional_use.title")}>
              <p className="italic text-brand-gray-500">
                {t("terms.professional_use.intro")}
              </p>
              <BulletList
                items={t("terms.professional_use.points", {
                  returnObjects: true,
                })}
              />
            </LegalSection>

            <LegalSection title={t("terms.prohibited.title")}>
              <p className="italic text-brand-gray-500">
                {t("terms.prohibited.intro")}
              </p>
              <BulletList
                items={t("terms.prohibited.points", { returnObjects: true })}
              />
            </LegalSection>

            <LegalSection title={t("terms.ugc.title")}>
              <BulletList
                items={t("terms.ugc.points", { returnObjects: true })}
              />
            </LegalSection>

            <LegalSection title={t("terms.governance.title")}>
              <p className="italic text-brand-gray-500">
                {t("terms.governance.intro")}
              </p>
              <BulletList
                items={t("terms.governance.points", { returnObjects: true })}
                variant="check"
              />
              <p className="text-sm font-bold text-brand-teal-900 pt-4">
                {t("terms.governance.footer")}
              </p>
            </LegalSection>

            <LegalSection title={t("terms.liability.title")}>
              <p className="font-bold">{t("terms.liability.content")}</p>
              <p className="italic">{t("terms.liability.footer")}</p>
            </LegalSection>

            <LegalSection title={t("terms.law.title")}>
              <p>{t("terms.law.content")}</p>
            </LegalSection>
          </div>

          {/* Divider */}
          <hr className="border-brand-gray-200" />

          {/* Community Guidelines Section */}
          <div className="space-y-16">
            <header className="space-y-4">
              <h1 className="text-display-md font-bold text-brand-teal-900">
                {t("community_guidelines.title")}
              </h1>
              <p className="text-lg font-bold text-brand-gray-600">
                {t("community_guidelines.subtitle")}
              </p>
              <p>{t("community_guidelines.intro")}</p>
            </header>

            <LegalSection title={t("community_guidelines.conduct.title")}>
              <p className="italic text-brand-gray-500">
                {t("community_guidelines.conduct.intro")}
              </p>
              <BulletList
                items={t("community_guidelines.conduct.points", {
                  returnObjects: true,
                })}
              />
            </LegalSection>

            <LegalSection title={t("community_guidelines.sharing.title")}>
              <p className="italic text-brand-gray-500">
                {t("community_guidelines.sharing.intro")}
              </p>
              <BulletList
                items={t("community_guidelines.sharing.points", {
                  returnObjects: true,
                })}
                variant="check"
              />
            </LegalSection>

            <LegalSection title={t("community_guidelines.inclusion.title")}>
              <p className="italic text-brand-gray-500">
                {t("community_guidelines.inclusion.intro")}
              </p>
              <BulletList
                items={t("community_guidelines.inclusion.points", {
                  returnObjects: true,
                })}
              />
            </LegalSection>

            <LegalSection title={t("community_guidelines.moderation.title")}>
              <BulletList
                items={t("community_guidelines.moderation.points", {
                  returnObjects: true,
                })}
              />
            </LegalSection>

            <LegalSection title={t("community_guidelines.reporting.title")}>
              <p className="italic text-brand-gray-500">
                {t("community_guidelines.reporting.intro")}
              </p>
              <BulletList
                items={t("community_guidelines.reporting.points", {
                  returnObjects: true,
                })}
              />
            </LegalSection>
          </div>
        </div>
      </div>
    </>
  );
}

PrivacyPolicy.noContainer = true;

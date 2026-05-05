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

export default function PrivacyPolicy() {
  const { t } = useTranslation("privacy-policy");

  return (
    <>
      <Meta title={t("seo.title")} description={t("seo.description")} />

      {/* Hero Section with Light Background */}
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

      <div className="max-w-4xl mx-auto py-16 md:py-24 px-4">
        {/* Content Body */}
        <div className="space-y-20 text-brand-gray-900">
          {/* Aligned With Section */}
          <section className="prose prose-brand max-w-none">
            <div className="p-8 bg-white rounded-3xl border border-brand-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-brand-teal-900 mb-6">
                {t("aligned_with.title")}
              </h3>
              <ul className="space-y-4">
                {t("aligned_with.points", { returnObjects: true }).map(
                  (point, i) => (
                    <li
                      key={i}
                      className="flex gap-4 text-md text-brand-gray-700"
                    >
                      <span className="text-brand-orange-500 font-bold shrink-0">
                        •
                      </span>
                      {point}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </section>

          {/* Privacy Policy Sections */}
          <div className="space-y-12">
            {/* Scope */}
            <section className="space-y-4">
              <h2 className="text-display-xs text-brand-teal-900">
                {t("scope.title")}
              </h2>
              <div className="h-1 w-20 bg-brand-orange-500 rounded-full mb-6" />
              <p className="text-md leading-relaxed">{t("scope.content")}</p>
              <p className="text-md font-bold text-brand-gray-700 mt-4">
                {t("scope.acknowledgment")}
              </p>
            </section>

            {/* Principles */}
            <section className="space-y-4">
              <h2 className="text-display-xs text-brand-teal-900">
                {t("principles.title")}
              </h2>
              <div className="h-1 w-20 bg-brand-orange-500 rounded-full mb-6" />
              <p className="text-md leading-relaxed italic text-brand-gray-600 mb-4">
                {t("principles.intro")}
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {t("principles.points", { returnObjects: true }).map(
                  (point, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 p-4 bg-white border border-brand-gray-100 rounded-xl shadow-sm"
                    >
                      <div className="size-2 rounded-full bg-brand-teal-500 shrink-0" />
                      <span className="text-sm font-medium text-brand-gray-800">
                        {point}
                      </span>
                    </li>
                  ),
                )}
              </ul>
              <p className="text-sm text-brand-gray-500 mt-6 pt-4 border-t border-brand-gray-100">
                {t("principles.footer")}
              </p>
            </section>

            {/* Collection */}
            <section className="space-y-6">
              <h2 className="text-display-xs text-brand-teal-900">
                {t("collection.title")}
              </h2>
              <div className="h-1 w-20 bg-brand-orange-500 rounded-full mb-6" />
              <p className="text-md italic text-brand-gray-600">
                {t("collection.intro")}
              </p>
              <div className="grid grid-cols-1 gap-6">
                {t("collection.sections", { returnObjects: true }).map(
                  (section, i) => (
                    <div
                      key={i}
                      className="p-6 bg-brand-gray-50 rounded-2xl border border-brand-gray-100"
                    >
                      <h3 className="text-lg font-bold text-brand-teal-900 mb-4">
                        {section.title}
                      </h3>
                      <ul className="space-y-3">
                        {section.points.map((point, j) => (
                          <li
                            key={j}
                            className="flex gap-3 text-md text-brand-gray-700"
                          >
                            <span className="text-brand-orange-500 font-bold">
                              •
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
                )}
              </div>
              <p className="text-sm font-medium text-brand-teal-700 bg-brand-teal-50 p-4 rounded-lg border border-brand-teal-100">
                {t("collection.footer")}
              </p>
            </section>

            {/* Lawful Basis */}
            <section className="space-y-4">
              <h2 className="text-display-xs text-brand-teal-900">
                {t("lawful_basis.title")}
              </h2>
              <div className="h-1 w-20 bg-brand-orange-500 rounded-full mb-6" />
              <p className="text-md mb-4">{t("lawful_basis.intro")}</p>
              <ul className="space-y-3">
                {t("lawful_basis.points", { returnObjects: true }).map(
                  (point, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-md text-brand-gray-700"
                    >
                      <span className="text-brand-teal-500 font-bold">✓</span>
                      {point}
                    </li>
                  ),
                )}
              </ul>
              <p className="text-sm text-brand-gray-500 mt-4 italic">
                {t("lawful_basis.footer")}
              </p>
            </section>

            {/* Usage */}
            <section className="space-y-4">
              <h2 className="text-display-xs text-brand-teal-900">
                {t("usage.title")}
              </h2>
              <div className="h-1 w-20 bg-brand-orange-500 rounded-full mb-6" />
              <p className="text-md mb-4">{t("usage.intro")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {t("usage.points", { returnObjects: true }).map((point, i) => (
                  <div
                    key={i}
                    className="p-3 border-l-2 border-brand-teal-500 bg-brand-gray-50 text-sm font-medium"
                  >
                    {point}
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-brand-orange-700 mt-6">
                {t("usage.footer")}
              </p>
            </section>

            {/* Sharing */}
            <section className="space-y-4">
              <h2 className="text-display-xs text-brand-teal-900">
                {t("sharing.title")}
              </h2>
              <div className="h-1 w-20 bg-brand-orange-500 rounded-full mb-6" />
              <p className="text-md font-bold text-brand-gray-900">
                {t("sharing.intro")}
              </p>
              <p className="text-md">{t("sharing.sharing_with_intro")}</p>
              <ul className="space-y-3">
                {t("sharing.points", { returnObjects: true }).map(
                  (point, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-md text-brand-gray-700 ml-4"
                    >
                      <span className="text-brand-orange-500">•</span>
                      {point}
                    </li>
                  ),
                )}
              </ul>
              <div className="mt-6 p-4 bg-brand-teal-50 text-sm text-brand-teal-900 rounded-lg border border-brand-teal-100 leading-relaxed">
                {t("sharing.transfer_footer")}
              </div>
            </section>

            {/* Retention */}
            <section className="space-y-4">
              <h2 className="text-display-xs text-brand-teal-900">
                {t("retention.title")}
              </h2>
              <div className="h-1 w-20 bg-brand-orange-500 rounded-full mb-6" />
              <p className="text-md">{t("retention.intro")}</p>
              <ul className="space-y-2 ml-4">
                {t("retention.points", { returnObjects: true }).map(
                  (point, i) => (
                    <li key={i} className="text-md text-brand-gray-700">
                      • {point}
                    </li>
                  ),
                )}
              </ul>
              <p className="text-md text-brand-gray-600 mt-4 italic">
                {t("retention.footer")}
              </p>
            </section>

            {/* Security */}
            <section className="space-y-4">
              <h2 className="text-display-xs text-brand-teal-900">
                {t("security.title")}
              </h2>
              <div className="h-1 w-20 bg-brand-orange-500 rounded-full mb-6" />
              <p className="text-md mb-4">{t("security.intro")}</p>
              <div className="space-y-2">
                {t("security.points", { returnObjects: true }).map(
                  (point, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-white border border-brand-gray-100 rounded-lg"
                    >
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <span className="text-sm font-medium">{point}</span>
                    </div>
                  ),
                )}
              </div>
            </section>

            {/* Rights */}
            <section className="space-y-4">
              <h2 className="text-display-xs text-brand-teal-900">
                {t("rights.title")}
              </h2>
              <div className="h-1 w-20 bg-brand-orange-500 rounded-full mb-6" />
              <p className="text-md mb-4">{t("rights.intro")}</p>
              <div className="flex flex-wrap gap-2">
                {t("rights.points", { returnObjects: true }).map((point, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-brand-gray-100 text-brand-gray-700 text-sm font-medium rounded-full"
                  >
                    {point}
                  </span>
                ))}
              </div>
              <p className="text-md text-brand-gray-600 mt-6 font-medium">
                {t("rights.footer")}
              </p>
            </section>

            {/* Contact */}
            <section className="p-8 bg-brand-teal-900 text-white rounded-3xl space-y-6">
              <h2 className="text-display-xs text-white">
                {t("contact.title")}
              </h2>
              <div className="h-1 w-20 bg-brand-orange-500 rounded-full" />
              <div className="space-y-4">
                <p className="text-lg opacity-90">{t("contact.intro")}</p>
                <div className="flex flex-col sm:flex-row gap-8 pt-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-60 mb-1">
                      {t("contact.email_label")}
                    </p>
                    <p className="text-lg font-bold">
                      {t("contact.email_value")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-60 mb-1">
                      {t("contact.organisation_label")}
                    </p>
                    <p className="text-lg font-bold">
                      {t("contact.organisation_value")}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Terms of Use Divider */}
            <div className="py-12">
              <div className="h-px w-full bg-brand-gray-200" />
            </div>

            {/* Terms of Use Section */}
            <section className="space-y-8 pt-8">
              <header>
                <h1 className="text-display-md text-brand-teal-900 mb-2">
                  {t("terms.title")}
                </h1>
                <p className="text-lg text-brand-gray-600 italic">
                  {t("terms.intro")}
                </p>
                <p className="text-md font-bold text-brand-gray-900 mt-4">
                  {t("terms.acceptance")}
                </p>
              </header>

              <div className="space-y-12">
                <section className="space-y-4">
                  <h3 className="text-xl text-brand-teal-900 font-bold">
                    {t("terms.purpose.title")}
                  </h3>
                  <p className="text-md italic text-brand-gray-600">
                    {t("terms.purpose.intro")}
                  </p>
                  <ul className="space-y-3">
                    {t("terms.purpose.points", { returnObjects: true }).map(
                      (point, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-md text-brand-gray-700"
                        >
                          <span className="text-brand-orange-500 font-bold">
                            •
                          </span>
                          {point}
                        </li>
                      ),
                    )}
                  </ul>
                  <p className="text-sm font-bold text-brand-teal-700 mt-4">
                    {t("terms.purpose.footer")}
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl text-brand-teal-900 font-bold">
                    {t("terms.registration.title")}
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {t("terms.registration.points", {
                      returnObjects: true,
                    }).map((point, i) => (
                      <div
                        key={i}
                        className="p-4 bg-brand-gray-50 border border-brand-gray-100 rounded-xl text-sm font-medium"
                      >
                        {point}
                      </div>
                    ))}
                  </ul>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl text-brand-teal-900 font-bold">
                    {t("terms.professional_use.title")}
                  </h3>
                  <p className="text-md italic text-brand-gray-600">
                    {t("terms.professional_use.intro")}
                  </p>
                  <ul className="space-y-3">
                    {t("terms.professional_use.points", {
                      returnObjects: true,
                    }).map((point, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-md text-brand-gray-700"
                      >
                        <span className="text-brand-orange-500 font-bold">
                          •
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl text-brand-teal-900 font-bold">
                    {t("terms.prohibited.title")}
                  </h3>
                  <p className="text-md italic text-brand-gray-600">
                    {t("terms.prohibited.intro")}
                  </p>
                  <ul className="space-y-3">
                    {t("terms.prohibited.points", { returnObjects: true }).map(
                      (point, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-md text-brand-gray-700"
                        >
                          <span className="text-brand-orange-500 font-bold">
                            •
                          </span>
                          {point}
                        </li>
                      ),
                    )}
                  </ul>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl text-brand-teal-900 font-bold">
                    {t("terms.ugc.title")}
                  </h3>
                  <ul className="space-y-3">
                    {t("terms.ugc.points", { returnObjects: true }).map(
                      (point, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-md text-brand-gray-700"
                        >
                          <span className="text-brand-orange-500 font-bold">
                            •
                          </span>
                          {point}
                        </li>
                      ),
                    )}
                  </ul>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl text-brand-teal-900 font-bold">
                    {t("terms.governance.title")}
                  </h3>
                  <p className="text-md italic text-brand-gray-600">
                    {t("terms.governance.intro")}
                  </p>
                  <ul className="space-y-3">
                    {t("terms.governance.points", { returnObjects: true }).map(
                      (point, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-md text-brand-gray-700"
                        >
                          <span className="text-brand-teal-500 font-bold">
                            ✓
                          </span>
                          {point}
                        </li>
                      ),
                    )}
                  </ul>
                  <p className="text-sm font-bold text-brand-orange-700 mt-4">
                    {t("terms.governance.footer")}
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl text-brand-teal-900 font-bold">
                    {t("terms.liability.title")}
                  </h3>
                  <p className="text-md font-bold">
                    {t("terms.liability.content")}
                  </p>
                  <p className="text-md text-brand-gray-600 italic">
                    {t("terms.liability.footer")}
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl text-brand-teal-900 font-bold">
                    {t("terms.law.title")}
                  </h3>
                  <p className="text-md leading-relaxed">
                    {t("terms.law.content")}
                  </p>
                </section>
              </div>
            </section>

            {/* Community Guidelines Divider */}
            <div className="py-12">
              <div className="h-px w-full bg-brand-gray-200" />
            </div>

            {/* Community Guidelines Section */}
            <section className="space-y-8 pt-8">
              <header>
                <h1 className="text-display-md text-brand-teal-900 mb-2">
                  {t("community_guidelines.title")}
                </h1>
                <p className="text-lg font-bold text-brand-gray-600">
                  {t("community_guidelines.subtitle")}
                </p>
                <p className="text-md text-brand-gray-900 mt-4">
                  {t("community_guidelines.intro")}
                </p>
              </header>

              <div className="space-y-12">
                <section className="space-y-4">
                  <h3 className="text-xl text-brand-teal-900 font-bold">
                    {t("community_guidelines.conduct.title")}
                  </h3>
                  <p className="text-md italic text-brand-gray-600">
                    {t("community_guidelines.conduct.intro")}
                  </p>
                  <ul className="space-y-3">
                    {t("community_guidelines.conduct.points", {
                      returnObjects: true,
                    }).map((point, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-md text-brand-gray-700"
                      >
                        <span className="text-brand-orange-500 font-bold">
                          •
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl text-brand-teal-900 font-bold">
                    {t("community_guidelines.sharing.title")}
                  </h3>
                  <p className="text-md italic text-brand-gray-600">
                    {t("community_guidelines.sharing.intro")}
                  </p>
                  <ul className="space-y-3">
                    {t("community_guidelines.sharing.points", {
                      returnObjects: true,
                    }).map((point, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-md text-brand-gray-700"
                      >
                        <span className="text-brand-teal-500 font-bold">✓</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl text-brand-teal-900 font-bold">
                    {t("community_guidelines.inclusion.title")}
                  </h3>
                  <p className="text-md italic text-brand-gray-600">
                    {t("community_guidelines.inclusion.intro")}
                  </p>
                  <ul className="space-y-3">
                    {t("community_guidelines.inclusion.points", {
                      returnObjects: true,
                    }).map((point, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-md text-brand-gray-700"
                      >
                        <span className="text-brand-orange-500 font-bold">
                          •
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl text-brand-teal-900 font-bold">
                    {t("community_guidelines.moderation.title")}
                  </h3>
                  <ul className="space-y-3">
                    {t("community_guidelines.moderation.points", {
                      returnObjects: true,
                    }).map((point, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-md text-brand-gray-700"
                      >
                        <span className="text-brand-teal-500 font-bold">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl text-brand-teal-900 font-bold">
                    {t("community_guidelines.reporting.title")}
                  </h3>
                  <p className="text-md italic text-brand-gray-600">
                    {t("community_guidelines.reporting.intro")}
                  </p>
                  <ul className="space-y-3">
                    {t("community_guidelines.reporting.points", {
                      returnObjects: true,
                    }).map((point, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-md text-brand-gray-700 font-medium"
                      >
                        <span className="text-brand-orange-500 font-bold">
                          •
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

PrivacyPolicy.noContainer = true;

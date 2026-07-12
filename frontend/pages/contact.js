import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Mail, Phone } from "lucide-react";
import Meta from "@/components/seo/Meta";
import { fetchContactPage } from "@/lib/strapi";

export default function ContactPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const locale = router.locale || "en";
    fetchContactPage(locale).then((res) => {
      setPageData(res?.data || null);
      setLoading(false);
    });
  }, [router.locale]);

  const title = pageData?.title || "Contact Us";
  const description = pageData?.description || "Coming soon";
  const email = pageData?.email;
  const phone = pageData?.phone;

  return (
    <>
      <Meta title={title} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-2 mb-12">
          <span className="text-sm font-bold text-brand-teal-900">SFA</span>
          <span className="text-brand-gray-300">/</span>
          <span className="text-sm font-medium text-brand-gray-500">
            {title}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-brand-gray-500">
            Loading...
          </div>
        ) : (
          <div className="space-y-8">
            <h1 className="text-display-sm font-bold text-brand-teal-900">
              {title}
            </h1>

            <div
              className="prose prose-gray max-w-none text-brand-gray-600"
              dangerouslySetInnerHTML={{ __html: description }}
            />

            {(email || phone) && (
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 text-brand-gray-700 hover:text-brand-teal-600 transition-colors"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-brand-teal-50">
                      <Mail className="size-5 text-brand-teal-600" />
                    </div>
                    <span className="text-sm font-medium">{email}</span>
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-3 text-brand-gray-700 hover:text-brand-teal-600 transition-colors"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-brand-teal-50">
                      <Phone className="size-5 text-brand-teal-600" />
                    </div>
                    <span className="text-sm font-medium">{phone}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

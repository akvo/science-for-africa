import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const { t } = useTranslation("common");

  const footerSections = [
    {
      title: t("footer.sections.general.title"),
      links: [
        { name: t("footer.sections.general.about"), href: "/coming-soon" },
        {
          name: t("footer.sections.general.resources"),
          href: "/resources",
        },
        {
          name: "News and Insights",
          href: "https://scienceforafrica.foundation/media-centre",
          external: true,
        },
        { name: t("footer.sections.general.account"), href: "/profile" },
      ],
    },
    {
      title: t("footer.sections.community.title"),
      links: [
        {
          name: t("footer.sections.community.communities"),
          href: "/community",
        },
        {
          name: t("footer.sections.community.discussions"),
          href: "/community",
        },
        {
          name: t("footer.sections.community.collaboration"),
          href: "/community/collaboration-hub",
        },
      ],
    },
    {
      title: t("footer.sections.legal.title"),
      links: [
        {
          name: t("footer.sections.legal.terms"),
          href: "/privacy-policy#terms",
        },
        { name: t("footer.sections.legal.privacy"), href: "/privacy-policy" },
        { name: t("footer.sections.legal.cookies"), href: "/privacy-policy" },
        { name: t("footer.sections.legal.settings"), href: "/profile" },
        { name: t("footer.sections.legal.contact"), href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-white">
      {/* Newsletter Section */}
      <div className="bg-brand-teal-50 border-y border-brand-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <h3 className="text-display-xs font-bold text-brand-teal-900">
              {t("footer.newsletter.title")}
            </h3>
            <p className="text-md text-brand-gray-600">
              {t("footer.newsletter.subtitle")}
            </p>
          </div>
          <div className="flex w-full md:w-auto max-w-2xl gap-3">
            <Input
              type="email"
              placeholder={t("footer.newsletter.placeholder")}
              className="bg-white border-brand-gray-200 h-11.5"
            />
            <Button variant="primary" size="xl">
              {t("footer.newsletter.subscribe")}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-12">
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-sm font-bold text-brand-gray-500 tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-brand-gray-900 hover:text-brand-teal-600 transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-base font-medium text-brand-gray-900 hover:text-brand-teal-600 transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-brand-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="shrink-0 relative w-auto h-32">
            <Image
              src="/logo-black.png"
              alt="Science for Africa"
              width={480}
              height={128}
              className="h-32 w-auto opacity-70"
            />
          </div>
          <p className="text-sm font-medium text-brand-gray-400">
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

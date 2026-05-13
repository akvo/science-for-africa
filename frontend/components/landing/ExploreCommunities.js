import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { fetchLandingCommunities, getStrapiMedia } from "../../lib/strapi";
import { useTranslation } from "next-i18next";

const ExploreCommunities = ({ title, description, linkText, linkUrl }) => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    async function loadCommunities() {
      try {
        const response = await fetchLandingCommunities(6, i18n.language);
        if (response?.data) {
          setCommunities(response.data);
        }
      } catch (error) {
        console.error("Failed to load communities:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCommunities();
  }, [i18n.language]);

  return (
    <section className="bg-white border-b border-brand-gray-100 overflow-hidden relative z-20">
      <div className="container mx-auto px-4 max-w-7xl py-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-display-sm md:text-display-md font-bold text-brand-teal-950 mb-4 leading-tight">
              {title}
            </h2>
            <p className="text-base md:text-lg text-brand-gray-700 leading-relaxed">
              {description}
            </p>
          </div>

          {linkText && linkUrl && (
            <Link
              href={linkUrl}
              className="group flex items-center gap-2 px-6 py-2 border border-brand-teal-900 rounded-full text-brand-teal-900 font-semibold transition-all hover:bg-brand-teal-900 hover:text-white"
            >
              {linkText}
              <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Communities Grid with Borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-brand-gray-100">
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-8 h-48 border-r border-b border-brand-gray-100 animate-pulse bg-brand-gray-50/30"
                />
              ))
            : communities.map((community, idx) => {
                const initials = community.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={community.documentId || idx}
                    className="group p-8 border-r border-b border-brand-gray-100 transition-colors hover:bg-brand-gray-50/50 flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Avatar + Info + Join */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-brand-teal-50 flex items-center justify-center text-brand-teal-600 font-bold text-sm border border-brand-teal-100">
                            {initials}
                          </div>
                          <div>
                            <h3 className="font-bold text-brand-teal-950 leading-tight">
                              {community.name}
                            </h3>
                            <p className="text-sm text-brand-gray-500">
                              {community.subCommunities?.length || 0}k
                              Subscribers
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-1.5 bg-brand-gray-100 text-brand-teal-950 text-sm font-bold rounded-full hover:bg-brand-teal-900 hover:text-white transition-all">
                          Join
                        </button>
                      </div>
                      {/* Card Body: Description */}
                      <p className="text-sm text-brand-gray-600 leading-relaxed line-clamp-2">
                        {community.description ||
                          "Explore the latest threads and collaborations within this community."}
                      </p>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default ExploreCommunities;

import React from "react";
import Image from "next/image";
import { getStrapiMedia } from "../../lib/strapi";

const AboutSection = ({ title, description, image, checklist }) => {
  const imageUrl =
    getStrapiMedia(image?.url) || "/assets/images/landing/about.png";

  return (
    <section className="bg-white border-b border-brand-gray-100 overflow-hidden relative z-20">
      <div className="container mx-auto px-4 max-w-7xl flex flex-col lg:flex-row items-stretch min-h-150">
        {/* Left Column: Image */}
        <div className="w-full lg:w-1/2 pr-0 lg:pr-16 py-24">
          <div className="relative h-full min-h-100 overflow-hidden animate-in fade-in slide-in-from-left-8 duration-1000">
            <Image
              src={imageUrl}
              alt={title || "About Science for Africa"}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Vertical Divider (Full Height) */}
        <div className="hidden lg:block w-px bg-brand-gray-100 self-stretch" />

        {/* Right Column: Content */}
        <div className="w-full lg:w-1/2 pl-0 lg:pl-16 py-24 animate-in fade-in slide-in-from-right-8 duration-1000 flex flex-col justify-center">
          <p className="text-base md:text-lg text-brand-gray-700 mb-12 leading-relaxed whitespace-pre-line">
            {description}
          </p>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {checklist?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 group">
                <div className="shrink-0 pt-1">
                  <svg
                    className="w-5 h-5 text-brand-teal-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-brand-teal-900 font-medium text-base leading-snug">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

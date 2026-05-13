import React from "react";
import Image from "next/image";
import { getStrapiMedia } from "../../lib/strapi";

const AboutSection = ({ title, description, image, checklist }) => {
  const imageUrl =
    getStrapiMedia(image?.url) || "/assets/images/landing/about.png";

  return (
    <section className="py-24 bg-white overflow-hidden relative z-20">
      <div className="container mx-auto px-4 max-w-7xl flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        <div className="w-full lg:w-1/2 relative aspect-4/3 overflow-hidden animate-in fade-in slide-in-from-left-8 duration-1000">
          <Image
            src={imageUrl}
            alt={title || "About Science for Africa"}
            fill
            className="object-cover"
          />
        </div>

        <div className="w-full lg:w-1/2 animate-in fade-in slide-in-from-right-8 duration-1000">
          <p className="text-base md:text-lg text-brand-gray-700 mb-10 leading-relaxed whitespace-pre-line">
            {description}
          </p>

          <ul className="space-y-5">
            {checklist?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-4 group">
                <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-brand-teal-50 flex items-center justify-center transition-colors group-hover:bg-brand-teal-100">
                  <svg
                    className="w-4 h-4 text-brand-teal-600"
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

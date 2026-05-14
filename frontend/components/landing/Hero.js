import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { getStrapiMedia } from "../../lib/strapi";

const Hero = ({ title, description, linkText, linkUrl, image }) => {
  const imageUrl =
    getStrapiMedia(image?.url) || "/assets/images/landing/hero.png";

  return (
    <section className="relative w-full min-h-215 flex items-start overflow-hidden bg-brand-teal-950">
      {/* Background Image Visual */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={title || "Science for Africa"}
          fill
          priority
          className="object-cover opacity-80"
        />
      </div>

      {/* Full-Width Overlapping Typography Bar */}
      <div className="relative z-10 w-full bg-white py-16 lg:py-24 shadow-2xl">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32 items-start">
            <h1 className="text-display-lg md:text-display-xl text-brand-teal-950 font-bold leading-[1.1] tracking-tight whitespace-pre-line">
              {title}
            </h1>

            <div className="space-y-8 pt-2">
              <p className="text-base text-brand-gray-700 leading-relaxed">
                {description}
              </p>

              {linkText && linkUrl && (
                <Link
                  href={linkUrl}
                  className="group flex items-center gap-2 text-brand-teal-800 text-base hover:text-brand-teal-600 transition-colors whitespace-nowrap"
                >
                  {linkText}
                  <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

import React from "react";
import Image from "next/image";
import { getStrapiMedia } from "../../lib/strapi";

const IdentitySection = ({ image, overlayText }) => {
  const imageUrl = getStrapiMedia(image?.url) || "/images/identity-fallback.jpg";

  return (
    <section className="relative w-full h-150 overflow-hidden flex items-center justify-center">
      <Image
        src={imageUrl}
        alt="SFA Identity"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10 bg-white/95 backdrop-blur-sm p-8 md:p-12 max-w-2xl mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-1000">
        <h2 className="text-display-xs md:text-display-sm text-brand-teal-950 leading-relaxed font-bold">
          {overlayText}
        </h2>
      </div>
    </section>
  );
};

export default IdentitySection;

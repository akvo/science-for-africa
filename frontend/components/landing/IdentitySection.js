import React from "react";
import Image from "next/image";
import { getStrapiMedia } from "../../lib/strapi";

const IdentitySection = ({ image, overlayText }) => {
  const imageUrl =
    getStrapiMedia(image?.url) || "/assets/images/landing/identity.png";

  return (
    <section className="relative w-full h-150 overflow-hidden flex items-center justify-center">
      <Image src={imageUrl} alt="SFA Identity" fill className="object-cover" />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 max-w-4xl mx-4 text-center animate-in fade-in zoom-in-95 duration-1000">
        <h2 className="text-display-sm md:text-display-md text-white leading-tight font-bold drop-shadow-lg">
          {overlayText}
        </h2>
      </div>
    </section>
  );
};

export default IdentitySection;

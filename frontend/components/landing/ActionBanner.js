import React from "react";
import Image from "next/image";
import { getStrapiMedia } from "../../lib/strapi";

const ActionBanner = ({ image }) => {
  const imageUrl = getStrapiMedia(image?.url) || "/images/action-fallback.jpg";

  return (
    <section className="relative aspect-21/9 w-full overflow-hidden">
      <Image
        src={imageUrl}
        alt="Action Banner"
        fill
        className="object-cover"
      />
    </section>
  );
};

export default ActionBanner;

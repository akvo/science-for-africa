import React from "react";
import Hero from "../landing/Hero";
import SecondaryHeading from "../landing/SecondaryHeading";
import AboutSection from "../landing/AboutSection";
import ExploreCommunities from "../landing/ExploreCommunities";
import ActionBanner from "../landing/ActionBanner";
import BenefitsGrid from "../landing/BenefitsGrid";
import IdentitySection from "../landing/IdentitySection";
import InfoAccordion from "../landing/InfoAccordion";

const components = {
  "page.hero": Hero,
  "page.secondary-heading": SecondaryHeading,
  "page.about-section": AboutSection,
  "page.explore-communities": ExploreCommunities,
  "page.action-banner": ActionBanner,
  "page.benefits-grid": BenefitsGrid,
  "page.identity-section": IdentitySection,
  "page.info-accordion": InfoAccordion,
};

const NO_GAP_COMPONENTS = [
  "page.hero",
  "page.about-section",
  "page.action-banner",
  "page.identity-section",
  "page.info-accordion",
];

const BlockRenderer = ({ blocks }) => {
  if (!blocks || !Array.isArray(blocks)) return null;

  return (
    <>
      {blocks.map((block, index) => {
        const Component = components[block.__component];
        if (!Component) {
          console.warn(`No component found for ${block.__component}`);
          return null;
        }

        const isNoGap = NO_GAP_COMPONENTS.includes(block.__component);
        const marginClass = isNoGap || index === 0 ? "" : "mt-24 md:mt-32";

        return (
          <div key={`${block.__component}-${index}`} className={marginClass}>
            <Component {...block} />
          </div>
        );
      })}
    </>
  );
};

export default BlockRenderer;

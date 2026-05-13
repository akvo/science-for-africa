import React from "react";
import Hero from "../landing/Hero";
import SecondaryHeading from "../landing/SecondaryHeading";
import TextSection from "../landing/TextSection";
import AboutSection from "../landing/AboutSection";
import ExploreCommunities from "../landing/ExploreCommunities";
import ActionBanner from "../landing/ActionBanner";
import BenefitsGrid from "../landing/BenefitsGrid";
import IdentitySection from "../landing/IdentitySection";
import InfoAccordion from "../landing/InfoAccordion";

const components = {
  "page.hero": Hero,
  "page.secondary-heading": SecondaryHeading,
  "page.text-section": TextSection,
  "page.about-section": AboutSection,
  "page.explore-communities": ExploreCommunities,
  "page.action-banner": ActionBanner,
  "page.benefits-grid": BenefitsGrid,
  "page.identity-section": IdentitySection,
  "page.info-accordion": InfoAccordion,
};

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
        return <Component key={`${block.__component}-${index}`} {...block} />;
      })}
    </>
  );
};

export default BlockRenderer;

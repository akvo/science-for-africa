"use strict";

const DEFAULT_LANDING_PAGE = {
  blocks: [
    {
      __component: "page.hero",
      title:
        "Pan-African Community of Practice for Research and Innovation Managers",
      description:
        "The PanAfrican Community of Practice (CoP) for Research and Innovation Management is a living, interactive professional platform designed to strengthen, professionalise, and connect Africa’s research and innovation management community.",
      linkText: "Explore communities",
      linkUrl: "/community",
    },
    {
      __component: "page.secondary-heading",
      tagline:
        "A professional home for Africa's research and innovation managers.",
      title:
        "Learn from peers. Build recognised skills. Connect institutions. Strengthen practice.",
    },
    {
      __component: "page.about-section",
      title: "",
      description:
        "The CoP supports research managers in their day to day practice while contributing to the longterm development of the profession across the continent. It brings together individuals, institutions, and partners to share experience, develop standards, build capacity, and collaborate.\n\nThis is not a static information portal. It is a peer-driven professional community where members:",
      checklist: [
        { text: "solve real operational and strategic challenges" },
        { text: "build recognised professional identities" },
        {
          text: "contribute to stronger research and innovation systems in Africa",
        },
        { text: "exchange practicebased knowledge and tools" },
        { text: "connect across institutions, countries, and career stages" },
      ],
    },
    {
      __component: "page.explore-communities",
      title: "Explore communities",
      description:
        "Dive into the world of creativity, from art history to modern expression.",
      linkText: "See all",
      linkUrl: "/community",
    },
    {
      __component: "page.action-banner",
    },
    {
      __component: "page.benefits-grid",
      tagline:
        "A professional home for Africa’s research and innovation managers.",
      title: "What You Can Do on the Platform",
      items: [
        {
          title: "Collaborate",
          description:
            "Connect with peers and institutions to develop proposals, tools and joint initiatives.",
          linkText: "Explore",
          linkUrl: "/collaboration",
        },
        {
          title: "Access Opportunities",
          description:
            "Find funding calls, jobs, consultancies, fellowships, and collaboration opportunities.",
          linkText: "Explore",
          linkUrl: "/resources",
        },
        {
          title: "Build Professional Recognition",
          description:
            "Create a trusted professional profile, showcase certifications and contribute recognised knowledge.",
          linkText: "Explore",
          linkUrl: "/profile",
        },
        {
          title: "Mentor and Be Mentored",
          description:
            "Engage in structured mentorship across career stages and geographies.",
          linkText: "Explore",
          linkUrl: "/collaboration",
        },
      ],
    },
    {
      __component: "page.identity-section",
      overlayText:
        "The platform enables members to build and demonstrate professional identity in research and innovation management.",
    },
    {
      __component: "page.info-accordion",
      items: [
        {
          title: "Who the Community is For",
          content:
            "The CoP is for research management professionals at all levels, from early career to senior leadership, across universities, research institutes, and funding agencies in Africa.",
        },
        {
          title: "Core Platform Capabilities",
          content:
            "The platform offers shared resources, community forums, collaboration tools, and professional networking to support the R&I management profession.",
        },
        {
          title: "Why Members Return Regularly",
          content:
            "Members return to stay connected with peers, discover new opportunities, and share knowledge that helps them advance their professional practice.",
        },
      ],
    },
    {
      __component: "page.newsletter-section",
      title: "Join our newsletter",
      text: "Want news, latest collaboration and research ideas?",
      buttonText: "Join",
      inputPlaceholder: "Your email",
    },
  ],
};

module.exports = { DEFAULT_LANDING_PAGE };

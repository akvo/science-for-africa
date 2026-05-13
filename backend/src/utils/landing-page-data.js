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
      title: "Empowering Africa's Research Ecosystem",
      description:
        "The SFA space for research managers is their digital home for connecting to the long term development of the profession across the continent. Bringing together individual practitioners, and leaders from African research institutions and networks, to build capacity and share leads.",
      checklist: [
        { text: "address real-world practical challenges and opportunities" },
        { text: "build lasting relationships with fellow peers" },
        {
          text: "find safe space to share personal experiences - successes and failures",
        },
        { text: "stay up to date on news, events and opportunities" },
        { text: "discover members and establish connections across Africa" },
      ],
    },
    {
      __component: "page.explore-communities",
      title: "Explore communities",
      description:
        "Join focus themed groups, sharing threads within each community.",
      linkText: "See all",
      linkUrl: "/communities",
    },
    {
      __component: "page.action-banner",
    },
    {
      __component: "page.benefits-grid",
      title: "What You Can Do on the Platform",
      items: [
        {
          title: "Collaborate",
          description:
            "Work with other professionals on research management projects, build networks and share skills.",
          linkText: "Explore",
          linkUrl: "/collaboration",
        },
        {
          title: "Access Opportunities",
          description:
            "Find latest grants, fellowships, and research management jobs available across the continent.",
          linkText: "Explore",
          linkUrl: "/resources",
        },
        {
          title: "Build Professional Recognition",
          description:
            "Showcase your expertise, contribute to best practices, and build a verified professional profile.",
          linkText: "Explore",
          linkUrl: "/profile",
        },
        {
          title: "Mentor and Be Mentored",
          description:
            "Engage in peer-to-peer learning, share knowledge, and support the next generation of managers.",
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

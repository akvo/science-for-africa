/**
 * Mock data for the Community / Forum scaffolding.
 *
 * Replace these constants with real data from Strapi once the
 * forum endpoints are available. Shapes are intentionally kept
 * close to what we expect from the API so swapping is mechanical.
 */

export const MOCK_COMMUNITY = {
  id: "community-of-researchers",
  slug: "community-of-researchers",
  name: "Community of researchers",
  handle: "891 775 7240",
  initials: "CR",
  bannerUrl:
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=60",
  about:
    "Lorem ipsum dolor sit amet consectetur. Nunc et posuere cras bibendum cras. Diam felis sagittis suspendisse scelerisque quam.",
  createdAt: "2024-03-01",
  stats: { subscribers: 63716, posts: 323 },
  moderators: [{ id: "m1", name: "Moderator list hidden" }],
  subCommunities: [
    { id: "sc1", name: "Health and Wellness", subscribers: 33000 },
    { id: "sc2", name: "Travel and Adventure", subscribers: 4000 },
    { id: "sc3", name: "Food and Cooking", subscribers: 33000 },
    { id: "sc4", name: "Finance and Investing", subscribers: 17000 },
  ],
  rules: [
    {
      id: "r1",
      label: "No Feature stories",
      description:
        "Posts must focus on research and discussion. Promotional or feature-style stories will be removed by moderators.",
    },
    {
      id: "r2",
      label: "Engagement Rate",
      description:
        "Members are expected to engage constructively. Low-effort or repetitive comments may be flagged.",
    },
    {
      id: "r3",
      label: "No editorials",
      description:
        "Opinion pieces and editorials are not permitted. Share data, findings, or peer-reviewed sources instead.",
    },
    {
      id: "r4",
      label: "Likes",
      description:
        "Use likes to acknowledge useful contributions. Like-farming or reciprocal liking is discouraged.",
    },
    {
      id: "r5",
      label: "Shares",
      description:
        "When sharing external content, always credit the original author and include a source link.",
    },
    {
      id: "r6",
      label: "Comments",
      description:
        "Keep comments respectful and on-topic. Personal attacks will result in removal from the community.",
    },
    {
      id: "r7",
      label: "Bounce Rate",
      description:
        "Frequent post deletions or low-quality submissions may affect your community standing.",
    },
  ],
};

import {
  Rss,
  MessageSquare,
  Handshake,
  BookOpen,
} from "lucide-react";

export const COMMUNITY_TABS = [
  { value: "feed", label: "Feed", icon: Rss },
  { value: "discussions", label: "Discussions", icon: MessageSquare },
  {
    value: "collaboration-calls",
    label: "Collaboration calls",
    icon: Handshake,
  },
  { value: "resources", label: "Resources", icon: BookOpen },
];

export const COLLABORATION_CALL_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
};

const baseCall = {
  title: "Collaboration title will go here",
  description:
    "Collaboration call objective and problem goes here. Collaboration call objective and problem goes here.",
  tags: ["#Technology", "#Innovation", "#Gadgets"],
};

export const MOCK_COLLABORATION_CALLS = [
  { id: "c1", status: "active", endsAt: "2024-11-30", ...baseCall },
  { id: "c2", status: "active", endsAt: "2024-11-30", ...baseCall },
  { id: "c3", status: "completed", endsAt: "2024-11-30", ...baseCall },
  { id: "c4", status: "active", endsAt: "2024-11-30", ...baseCall },
  { id: "c5", status: "completed", endsAt: "2024-11-30", ...baseCall },
];

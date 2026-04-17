/**
 * Mock / constant data for the Community / Forum scaffolding.
 *
 * Community data is now fetched from Strapi. Only tab config
 * and collaboration call mocks remain here.
 */

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

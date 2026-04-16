/**
 * Shared constants for the Community / Forum UI.
 * All content data is fetched from Strapi at runtime.
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

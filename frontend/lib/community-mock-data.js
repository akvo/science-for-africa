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
  { value: "feed", i18nKey: "community.tab_feed", icon: Rss },
  { value: "discussions", i18nKey: "community.tab_discussions", icon: MessageSquare },
  {
    value: "collaboration-calls",
    i18nKey: "community.tab_collaboration",
    icon: Handshake,
  },
  { value: "resources", i18nKey: "community.tab_resources", icon: BookOpen },
];

export const COLLABORATION_CALL_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
};

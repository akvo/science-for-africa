/**
 * Shared constants for the Community / Forum UI.
 * All content data is fetched from Strapi at runtime.
 */

import { BookOpen } from "lucide-react";
import CollaborationIcon from "@/components/icons/CollaborationIcon";

export const COMMUNITY_TABS = [
  {
    value: "collaboration-calls",
    i18nKey: "community.tab_collaboration",
    icon: CollaborationIcon,
  },
  { value: "resources", i18nKey: "community.tab_resources", icon: BookOpen },
];

export const COLLABORATION_CALL_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
};

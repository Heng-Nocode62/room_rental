import type { ComponentType } from "react";
export type Permission =
  | "ROOM_VIEW"
  | "AVAILABILITY_VIEW"
  | "RESERVATION_VIEW"
  | "ROOM_BLOCK_VIEW"
  | "ROOM_PRICE_VIEW"
  | "LOCATION_VIEW"
  | "ROOM_TYPE_VIEW"
  | "USER_VIEW"
  | "AMENITY_VIEW"
  | "ROLE_VIEW"
  | "AUDIT_VIEW"
  | "SETTINGS_VIEW"
  | "LANGUAGE_VIEW";

export type NavGroup = "application" | "setup" | "settings";

export interface NavigationItem {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  permission?: Permission;
  group: NavGroup;

  // For dropdown navigation
  children?: NavigationItem[];
}

export const navigationGroupLabels: Record<NavGroup, string> = {
  application: "navigation.groups.operations",
  setup: "navigation.groups.workspace",
  settings: "navigation.groups.administration",
};

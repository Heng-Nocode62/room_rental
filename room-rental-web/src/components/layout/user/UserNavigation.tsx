import type { ComponentType } from "react";
import logo from "../../../assets/logo.svg";
import { ClipboardList, CalendarCheck, CalendarDays } from "../../ui/MaterialIcon";
import { Home, User } from "../layoutIcons";

/** Hard-coded branding for the user area (not read from config / backend). */
export const USER_APP_NAME = "Room Rental";
export const USER_LOGO = logo;

export type UserIcon = ComponentType<{ size?: number; className?: string }>;

export interface UserNavItem {
  label: string;
  path: string;
  icon: UserIcon;
  children?: UserNavItem[];
}

export interface UserNavGroup {
  key: string;
  label: string;
  items: UserNavItem[];
}

/** Hard-coded navigation (not loaded from backend). */
export const userNavGroups: UserNavGroup[] = [
  {
    key: "booking",
    label: "Booking",
    items: [
      { label: "Dashboard", path: "/user/dashboard", icon: Home },
      {
        label: "Availability",
        path: "/availability",
        icon: CalendarCheck,
        children: [
          { label: "Hourly Availability", path: "/availability/hourly", icon: CalendarCheck },
          { label: "Daily Availability", path: "/availability/daily", icon: CalendarDays },
        ],
      },
    ],
  },
  {
    key: "account",
    label: "Account",
    items: [
      { label: "My Profile", path: "/user/profile", icon: User },
       { label: "My Reservations", path: "/user/reservations", icon: ClipboardList },
    ],
  },
  
];

export function isPathActive(path: string, pathname: string) {
  return pathname === path || pathname.startsWith(path + "/");
}

export function itemIsActive(item: UserNavItem, pathname: string) {
  return item.children?.length
    ? item.children.some((c) => isPathActive(c.path, pathname))
    : isPathActive(item.path, pathname);
}

export function groupIsActive(group: UserNavGroup, pathname: string) {
  return group.items.some((item) => itemIsActive(item, pathname));
}

/** Label of the page matching the current path (used as header title). */
export function activePageLabel(pathname: string): string | undefined {
  for (const group of userNavGroups) {
    for (const item of group.items) {
      const match = item.children?.find((c) => isPathActive(c.path, pathname));
      if (match) return match.label;
      if (!item.children?.length && isPathActive(item.path, pathname)) return item.label;
    }
  }
  return undefined;
}
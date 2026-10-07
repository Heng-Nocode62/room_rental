

import {
  CalendarDays,
  ClipboardList,
  DoorOpen,
  LayoutDashboard,
  MapPin,
  Settings2,
  Sparkles,
  Tag,
  Users,
  ShieldCheck,
  Languages,
  ScrollText,
  CircleDollarSign,
  Ban,
  Clock,
} from "../../../components/ui/MaterialIcon.tsx";

import type { ComponentType } from "react";
import type { NavigationItem } from "../types/navigation";

const iconMap = {
  CalendarDays,
  ClipboardList,
  DoorOpen,
  LayoutDashboard,
  MapPin,
  Settings2,
  Sparkles,
  Tag,
  Users,
  ShieldCheck,
  Languages,
  ScrollText,
  CircleDollarSign,
  Ban,
  Clock,
};

export interface BackendNavigationItem {
  key: string;
  path: string;
  icon: string;
  group: NavigationItem["group"];
  permission?: string | null;
  children?: BackendNavigationItem[] | null;
}

function resolveIcon(
  iconName: string
): ComponentType<{ className?: string; size?: number }> {
  return (
    iconMap[iconName as keyof typeof iconMap] ??
    LayoutDashboard
  );
}

export function mapNavigationItem(
  item: BackendNavigationItem
): NavigationItem {
  return {
    label: item.key,
    path: item.path,
    icon: resolveIcon(item.icon),
    permission: item.permission as NavigationItem["permission"],
    group: item.group,
    children: item.children?.map(mapNavigationItem),
  };
}

export function mapNavigation(
  items: BackendNavigationItem[]
): NavigationItem[] {
  return items.map(mapNavigationItem);
}
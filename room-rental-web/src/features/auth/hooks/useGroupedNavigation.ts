import { navigationGroupLabels } from "../types/navigation";
import { useNavigation } from "./useNavigation";
import { usePermissions } from "./usePermissions";
 
export type NavItem = ReturnType<typeof useNavigation>["navigation"][number];
 
export type NavGroup = {
  group: keyof typeof navigationGroupLabels;
  items: NavItem[];
};
 
/**
 * Applies permission filtering (including children) and groups the result
 * in the order defined by `navigationGroupLabels`.
 * Both the vertical Sidebar and the HorizontalNav consume this so the two
 * layouts always show exactly the same menu.
 */
export function useGroupedNavigation() {
  const { hasPermission } = usePermissions();
  const { navigation, isLoading } = useNavigation();
 
  const groupOrder = Object.keys(navigationGroupLabels) as Array<
    keyof typeof navigationGroupLabels
  >;
 
  const visibleItems: NavItem[] = navigation.flatMap((item) => {
    if (item.permission && !hasPermission(item.permission)) return [];
 
    if (item.children && item.children.length > 0) {
      const children = item.children.filter(
        (child) => !child.permission || hasPermission(child.permission),
      );
 
      // A parent whose children are all hidden should disappear too.
      if (children.length === 0) return [];
 
      return [{ ...item, children }];
    }
 
    return [item];
  });
 
  const groupedItems: NavGroup[] = groupOrder
    .map((group) => ({
      group,
      items: visibleItems.filter((item) => item.group === group),
    }))
    .filter(({ items }) => items.length > 0);
 
  return { groupedItems, isLoading };
}
 
/** Exact match, or a nested route under `path`. "/" only matches itself. */
export function isPathActive(path: string, pathname: string) {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}
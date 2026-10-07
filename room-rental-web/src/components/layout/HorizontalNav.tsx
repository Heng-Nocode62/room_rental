import { ChevronDown } from "../ui/MaterialIcon.tsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  isPathActive,
  useGroupedNavigation,
  type NavGroup,
  type NavItem,
} from "../../features/auth/hooks/useGroupedNavigation";
import { navigationGroupLabels } from "../../features/auth/types/navigation";
import { T } from "../../features/translation/TranslationText";
import { useDismissable } from "./useDismissable";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500";

type IconType = NavItem["icon"];

function groupIsActive({ items }: NavGroup, pathname: string) {
  return items.some((item) =>
    item.children?.length
      ? item.children.some((child) => isPathActive(child.path, pathname))
      : isPathActive(item.path, pathname),
  );
}

function MenuLink({
  to,
  label,
  Icon,
}: {
  to: string;
  label: string;
  Icon: IconType;
}) {
  return (
    <NavLink
      to={to}
      role="menuitem"
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${focusRing} ${
          isActive
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-700 hover:bg-slate-50"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
              isActive
                ? "bg-indigo-100 text-indigo-600"
                : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-sm"
            }`}
          >
            <Icon size={16} />
          </span>
          <span>
            <T k={label} />
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function HorizontalNav() {
  const { groupedItems, isLoading } = useGroupedNavigation();
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const close = useCallback(() => setOpenGroup(null), []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useDismissable(navRef, openGroup !== null, close);

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className="hidden h-full items-stretch gap-1 lg:flex"
    >
      {isLoading && (
        <span className="self-center px-3 text-xs text-slate-400">
          Loading navigation...
        </span>
      )}

      {groupedItems.map((entry) => {
        const { group, items } = entry;
        const isOpen = openGroup === group;
        const active = groupIsActive(entry, pathname);

        return (
          <div key={group} className="relative flex h-full">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={() => setOpenGroup(isOpen ? null : group)}
              className={`relative flex items-center gap-1.5 px-3 text-sm font-medium transition-colors ${focusRing} ${
                active || isOpen
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <T k={navigationGroupLabels[group]} />
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />

              {/* Active indicator sits on the header's bottom border */}
              <span
                aria-hidden
                className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-indigo-600 transition-opacity ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>

            {isOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
              >
                {items.map((item) =>
                  item.children && item.children.length > 0 ? (
                    <div
                      key={item.path}
                      className="mt-1 border-t border-slate-100 pt-1 first:mt-0 first:border-0 first:pt-0"
                    >
                      <p className="px-2.5 pb-1 pt-2 text-xs font-semibold text-slate-400">
                        <T k={item.label} />
                      </p>

                      <div className="space-y-0.5">
                        {item.children.map((child) => (
                          <MenuLink
                            key={child.path}
                            to={child.path}
                            label={child.label}
                            Icon={child.icon}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <MenuLink
                      key={item.path}
                      to={item.path}
                      label={item.label}
                      Icon={item.icon}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

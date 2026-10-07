import { ChevronDown, createIcon } from "../ui/MaterialIcon.tsx";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from '../../assets/logo.svg';
import {
  isPathActive,
  useGroupedNavigation,
} from "../../features/auth/hooks/useGroupedNavigation";
import { navigationGroupLabels } from "../../features/auth/types/navigation";
import { T } from "../../features/translation/TranslationText";
import { useAppConfig } from "../../features/settings/context/AppConfigProvider";

const MenuIcon = createIcon("menu");
const CloseIcon = createIcon("close");

export default function Sidebar() {
  const { config } = useAppConfig();
  const location = useLocation();
  const { groupedItems, isLoading } = useGroupedNavigation();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    application: true,
    setup: true,
    settings: false,
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMenu = (key: string) => {
    setOpenGroups((value) => ({
      ...value,
      [key]: !(value[key] ?? true),
    }));
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Close the drawer automatically on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            <img src={logo} alt="Room Rental logo" className="h-8 w-8" />
          </div>
          <p className="font-semibold text-slate-900">{config.app.appName}</p>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
        >
          <MenuIcon size={22} />
        </button>
      </div>

      {/* BACKDROP (mobile only, shown while drawer is open) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR / DRAWER */}
      <aside
        className={`app-layout-horizontal-sidebar fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white text-slate-600 transition-transform duration-200 ease-in-out lg:z-40 lg:w-60 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="shrink-0 border-b border-slate-200 px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                <img src={logo} alt="Room Rental logo" className="w-10 h-10" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{config.app.appName}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close menu"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            >
              <CloseIcon size={20} />
            </button>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 scrollbar-none">
          {isLoading && (
            <p className="px-2 text-xs text-slate-400">Loading navigation...</p>
          )}

          <div className="space-y-4">
            {groupedItems.map(({ group, items }) => {
              const isOpen = openGroups[group] ?? true;

              return (
                <section key={group}>
                  {/* GROUP HEADER */}
                  <button
                    type="button"
                    onClick={() => toggleMenu(group)}
                    className="flex w-full items-center justify-between px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 hover:text-slate-600"
                  >
                    <T k={navigationGroupLabels[group]} />

                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        isOpen ? "" : "-rotate-90"
                      }`}
                    />
                  </button>

                  {/* GROUP ITEMS */}
                  {isOpen && (
                    <div className="space-y-1">
                      {items.map((item) => {
                        const Icon = item.icon;

                        // Parent item with children (e.g. Availability)
                        if (item.children && item.children.length > 0) {
                          const parentOpen = openGroups[item.label] ?? true;

                          const active = item.children.some((child) =>
                            isPathActive(child.path, location.pathname),
                          );

                          return (
                            <div key={item.path}>
                              <button
                                type="button"
                                onClick={() => toggleMenu(item.label)}
                                className={`group flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition ${
                                  active
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                              >
                                <span className="flex items-center gap-3">
                                  <Icon
                                    size={17}
                                    className={
                                      active
                                        ? "text-indigo-600"
                                        : "text-slate-400 group-hover:text-slate-600"
                                    }
                                  />

                                  <span>
                                    <T k={item.label} />
                                  </span>
                                </span>

                                <ChevronDown
                                  size={15}
                                  className={`transition-transform ${
                                    parentOpen ? "" : "-rotate-90"
                                  }`}
                                />
                              </button>

                              {parentOpen && (
                                <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                  {item.children.map((child) => {
                                    const ChildIcon = child.icon;

                                    return (
                                      <NavLink
                                        key={child.path}
                                        to={child.path}
                                        onClick={closeMobileMenu}
                                        className={({ isActive }) =>
                                          `group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                                            isActive
                                              ? "bg-indigo-50 font-medium text-indigo-700"
                                              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                          }`
                                        }
                                      >
                                        {({ isActive }) => (
                                          <>
                                            <ChildIcon
                                              size={15}
                                              className={
                                                isActive
                                                  ? "text-indigo-600"
                                                  : "text-slate-400 group-hover:text-slate-600"
                                              }
                                            />

                                            <span>
                                              <T k={child.label} />
                                            </span>
                                          </>
                                        )}
                                      </NavLink>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                              `group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                                isActive
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <Icon
                                  size={17}
                                  className={
                                    isActive
                                      ? "text-indigo-600"
                                      : "text-slate-400 group-hover:text-slate-600"
                                  }
                                />

                                <span>
                                  <T k={item.label} />
                                </span>
                              </>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
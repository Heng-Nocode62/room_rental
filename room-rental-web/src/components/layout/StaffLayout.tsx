import { useEffect, useState, type ComponentType } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  DoorOpen,
  Menu as MenuIcon,
  PackagePlus,
  Settings2,
  Tag,
  Tags,
  X as CloseIcon,
} from "../../components/ui/MaterialIcon.tsx";

import logo from "../../assets/logo.svg";

import { Button } from "../../components/ui/Button";
import { useAppConfig } from "../../features/settings/context/AppConfigProvider";
import { useLocationScope } from "../../features/location-scope/LocationScopeProvider";
import { usePermissions } from "../../features/auth/hooks/usePermissions";
import { useLogout } from "../../features/auth/hooks/useLogout";
import { navigationGroupLabels } from "../../features/auth/types/navigation";
import { T } from "../../features/translation/TranslationText";

import ThemeToggle from "../../features/settings/ThemeToggle";
import LanguageSwitcher from "../../features/settings/LanguageSwitcher";

type StaffIcon = ComponentType<{
  className?: string;
  size?: number;
}>;

interface StaffNavChild {
  label: string;
  path: string;
  icon: StaffIcon;
}

interface StaffNavItem extends StaffNavChild {
  children?: StaffNavChild[];
}

interface StaffNavGroup {
  key: keyof typeof navigationGroupLabels;
  labelKey: string;
  items: StaffNavItem[];
}

const staffNavigationGroups: StaffNavGroup[] = [
  {
    key: "application",
    labelKey: navigationGroupLabels.application,
    items: [
      {
        label: "Dashboard",
        path: "/staff/dashboard",
        icon: Settings2,
      },
      {
        label: "Availability",
        path: "/availability",
        icon: CalendarCheck,
        children: [
          {
            label: "Hourly",
            path: "/availability/hourly",
            icon: CalendarCheck,
          },
          {
            label: "Daily",
            path: "/availability/daily",
            icon: CalendarDays,
          },
        ],
      },
      {
        label: "Reservations",
        path: "/staff/reservations",
        icon: ClipboardList,
      },
      {
        label: "Room Blocks",
        path: "/staff/room-blocks",
        icon: PackagePlus,
      },
    ],
  },
  {
    key: "setup",
    labelKey: navigationGroupLabels.setup,
    items: [
      {
        label: "Rooms",
        path: "/staff/rooms",
        icon: DoorOpen,
      },
      {
        label: "Room Types",
        path: "/staff/room-types",
        icon: Tags,
      },
      {
        label: "Amenities",
        path: "/staff/amenities",
        icon: Tag,
      },
      {
        label: "Room Prices",
        path: "/staff/room-prices",
        icon: Tags,
      },
    ],
  },
];

function isPathActive(path: string, pathname: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function StaffLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { config } = useAppConfig();
  const locationScope = useLocationScope();
  const { user } = usePermissions();
  const logoutMutation = useLogout();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    application: true,
    setup: true,
    Availability: true,
  });

  const closeMobileMenu = () => setMobileOpen(false);

  const toggleGroup = (key: string) => {
    setOpenGroups((current) => ({
      ...current,
      [key]: !(current[key] ?? true),
    }));
  };

  // Close the mobile drawer after navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent the page behind the mobile drawer from scrolling.
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/login", { replace: true });
  };

  const activeNavigation = staffNavigationGroups
    .flatMap((group) =>
      group.items.flatMap((item) =>
        item.children?.length ? item.children : [item],
      ),
    )
    .find((item) => isPathActive(item.path, pathname));

  return (
    <div
      className={`min-h-screen bg-slate-50 text-slate-900 ${
        config.app.skin === "bordered" ? "app-skin-bordered" : ""
      }`}
    >
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/20">
            <img src={logo} alt="Room Rental logo" className="h-8 w-8" />
          </div>

          <p className="font-semibold text-slate-900">{config.app.appName}</p>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
        >
          <MenuIcon size={22} />
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`app-layout-horizontal-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white text-slate-600 transition-transform duration-200 ease-in-out lg:z-40 lg:w-60 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo and application name */}
        <div className="shrink-0 border-b border-slate-200 px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
                <img src={logo} alt="Room Rental logo" className="h-10 w-10" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  {config.app.appName}
                </p>
                <p className="text-xs text-slate-500">Staff workspace</p>
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

        {/* Grouped navigation */}
        <nav
          aria-label="Staff navigation"
          className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4 scrollbar-none"
        >
          {staffNavigationGroups.map((group) => {
            const groupOpen = openGroups[group.key] ?? true;

            return (
              <section key={group.key}>
                {/* Group heading */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={groupOpen}
                  className="flex w-full items-center justify-between px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 hover:text-slate-600"
                >
                  <T k={group.labelKey} />

                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      groupOpen ? "" : "-rotate-90"
                    }`}
                  />
                </button>

                {/* Group items */}
                {groupOpen && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;

                      const active = item.children?.length
                        ? item.children.some((child) =>
                            isPathActive(child.path, pathname),
                          )
                        : isPathActive(item.path, pathname);

                      // Availability dropdown
                      if (item.children?.length) {
                        const childrenOpen = openGroups[item.label] ?? true;

                        return (
                          <div key={item.path}>
                            <button
                              type="button"
                              onClick={() => toggleGroup(item.label)}
                              aria-expanded={childrenOpen}
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
                                  childrenOpen ? "" : "-rotate-90"
                                }`}
                              />
                            </button>

                            {childrenOpen && (
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

                      // Regular navigation item
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
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:pl-60">
        {/* Header */}
        <header className="mt-14 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2 sm:px-6 lg:mt-0">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">{config.app.appName}</p>

            <p className="truncate text-xs text-slate-400">
              {activeNavigation?.label ?? "Staff workspace"}
              {locationScope.currentLocation?.name
                ? ` · ${locationScope.currentLocation.name}`
                : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {/* Location selector */}
            {locationScope.locations.length > 1 && (
              <label>
                <span className="sr-only">Current location</span>

                <select
                  value={locationScope.currentLocationId ?? ""}
                  onChange={(event) =>
                    locationScope.setCurrentLocationId(
                      Number(event.target.value),
                    )
                  }
                  className="h-9 max-w-36 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:max-w-48"
                >
                  {locationScope.locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Current user */}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">
                {user ? `${user.firstName} ${user.lastName}` : ""}
              </p>

              <p className="text-xs text-slate-500">{user?.username}</p>
            </div>

            <ThemeToggle />

            <LanguageSwitcher />

            <Button
              variant="ghost"
              onClick={handleLogout}
              loading={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
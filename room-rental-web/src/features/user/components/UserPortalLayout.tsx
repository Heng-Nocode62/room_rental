import { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useLogout } from "../../auth/hooks/useLogout";
import { Icon, cn } from "./UserUI";
import { useUserTheme } from "../UserThemeProvider";

const navItems = [
  { label: "Home", path: "/user/dashboard", icon: "home" as const },
  { label: "Browse Rooms", path: "/user/rooms", icon: "search" as const },
  { label: "My Reservations", path: "/user/reservations", icon: "calendar" as const },
  { label: "Profile", path: "/user/profile", icon: "user" as const },
];

const footerLinks = [
  { label: "Browse Rooms", path: "/user/rooms" },
  { label: "Reservations", path: "/user/reservations" },
  { label: "Profile", path: "/user/profile" },
];

const iconButtonClass =
  "relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white";

const dropdownPanelClass =
  "z-50 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-900/50 animate-in fade-in slide-in-from-top-2 duration-150";

const menuItemClass =
  "flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:bg-slate-800";

const HEADER_HEIGHT = "h-14"; // keep in sync with MOBILE_MENU_TOP
const MOBILE_MENU_TOP = "top-14";

function getInitials(first?: string | null, last?: string | null) {
  const f = first?.trim()[0] ?? "";
  const l = last?.trim()[0] ?? "";
  return (f + l).toUpperCase() || "U";
}

function Avatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 font-bold text-white shadow-sm",
        className,
      )}
    >
      {initials}
    </div>
  );
}

export default function UserPortalLayout() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useUserTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const avatarRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Replace with real data once notifications are wired up.
  const unreadCount = 0;

  const closeAll = useCallback(() => {
    setMobileOpen(false);
    setAvatarOpen(false);
    setNotifOpen(false);
  }, []);

  // Close everything on route change
  useEffect(() => {
    closeAll();
  }, [location.pathname, closeAll]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (avatarRef.current && !avatarRef.current.contains(target)) {
        setAvatarOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeAll();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeAll]);

  // Close the mobile menu if the viewport grows to desktop size
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    closeAll();
    try {
      // `mutate` returns void, so awaiting it did nothing.
      // `mutateAsync` actually waits for the request to finish.
      await logout.mutateAsync();
    } finally {
      navigate("/login");
    }
  };

  const initials = getInitials(user?.firstName, user?.lastName);
  const displayName = user?.firstName ?? "Guest";
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Guest";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 shadow-sm dark:border-slate-800/80">
        {/*
          Blur lives on a background layer, not on the header itself.
          backdrop-filter on an ancestor turns it into the containing block
          for `fixed` descendants, which breaks fixed-position popups.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-white/90 backdrop-blur-md transition-colors duration-300 dark:bg-slate-900/90"
        />

        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className={cn("flex items-center justify-between", HEADER_HEIGHT)}>
            {/* Logo */}
            <NavLink
              to="/user/dashboard"
              className="group flex flex-shrink-0 items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="RoomRental home"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-600/30 transition-transform duration-200 group-hover:scale-105">
                <Icon name="home" className="text-white" size={18} />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Room<span className="text-blue-600">Rental</span>
              </span>
            </NavLink>

            {/* Desktop center nav (underline sits on the header's bottom edge) */}
            <nav
              aria-label="Main"
              className={cn("hidden items-center gap-1 md:flex", HEADER_HEIGHT)}
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "relative flex h-full items-center px-4 text-sm font-medium transition-colors duration-200",
                      "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors after:duration-200",
                      "focus:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-800",
                      isActive
                        ? "text-blue-600 after:bg-blue-600 dark:text-blue-400 dark:after:bg-blue-400"
                        : "text-slate-600 after:bg-transparent hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Theme toggle (desktop; mobile has it in the menu) */}
              <button
                type="button"
                onClick={toggleTheme}
                className={cn(iconButtonClass, "hidden md:flex")}
                aria-label={
                  theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
              </button>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setAvatarOpen(false);
                  }}
                  className={iconButtonClass}
                  aria-label={
                    unreadCount > 0
                      ? `Notifications, ${unreadCount} unread`
                      : "Notifications"
                  }
                  aria-expanded={notifOpen}
                  aria-haspopup="true"
                >
                  <Icon name="bell" size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>

                {notifOpen && (
                  <div
                    className={cn(
                      dropdownPanelClass,
                      // Mobile: pinned under the header with side gutters so it never overflows.
                      // Desktop: anchored to the bell.
                      "fixed inset-x-4 top-[3.75rem] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80",
                    )}
                  >
                    <div className="border-b border-slate-100 px-4 py-2 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Notifications
                      </p>
                    </div>
                    <div className="px-4 py-8 text-center">
                      <Icon
                        name="bell"
                        size={28}
                        className="mx-auto mb-2 text-slate-300 dark:text-slate-600"
                      />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No new notifications
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar dropdown (desktop only; mobile uses the slide-down menu) */}
              <div className="relative hidden md:block" ref={avatarRef}>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarOpen((v) => !v);
                    setNotifOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl py-1 pl-1.5 pr-3 transition-colors duration-200",
                    "hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800",
                    avatarOpen && "bg-slate-100 dark:bg-slate-800",
                  )}
                  aria-label="User menu"
                  aria-expanded={avatarOpen}
                  aria-haspopup="true"
                >
                  <Avatar initials={initials} className="h-8 w-8 rounded-lg text-xs" />
                  <span className="max-w-[110px] truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                    {displayName}
                  </span>
                  <Icon
                    name="chevron-down"
                    size={14}
                    className={cn(
                      "text-slate-400 transition-transform duration-200",
                      avatarOpen && "rotate-180",
                    )}
                  />
                </button>

                {avatarOpen && (
                  <div className={cn(dropdownPanelClass, "absolute right-0 mt-2 w-60")}>
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={initials}
                          className="h-10 w-10 rounded-xl text-sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {fullName}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {user?.email ?? ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <NavLink to="/user/profile" className={menuItemClass}>
                        <Icon name="user" size={15} className="text-slate-400" />
                        My Profile
                      </NavLink>
                      <NavLink to="/user/reservations" className={menuItemClass}>
                        <Icon name="calendar" size={15} className="text-slate-400" />
                        My Reservations
                      </NavLink>
                    </div>

                    <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={logout.isPending}
                        className={cn(
                          menuItemClass,
                          "text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300",
                        )}
                      >
                        <Icon name="log-out" size={15} />
                        {logout.isPending ? "Signing out…" : "Sign Out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className={cn(iconButtonClass, "md:hidden")}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                <Icon name={mobileOpen ? "x" : "menu"} size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU (outside the header so it is never clipped) ───────── */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className={cn("fixed inset-x-0 bottom-0 z-40 md:hidden", MOBILE_MENU_TOP)}
        >
          {/* Backdrop */}
          <div
            aria-hidden="true"
            className="absolute inset-0 animate-in fade-in bg-slate-950/40 backdrop-blur-sm duration-200 dark:bg-slate-950/60"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-down panel */}
          <div className="relative max-h-full animate-in slide-in-from-top-2 fade-in overflow-y-auto border-b border-slate-200 bg-white shadow-2xl duration-200 dark:border-slate-800 dark:bg-slate-900">
            {/* User card */}
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <Avatar
                  initials={initials}
                  className="h-12 w-12 rounded-2xl text-base shadow-lg shadow-blue-500/30"
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                    {fullName}
                  </p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {user?.email ?? ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav aria-label="Mobile" className="space-y-1 px-3 py-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-4 rounded-2xl px-3 py-3 text-base font-medium transition-colors duration-200",
                      isActive
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors",
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                        )}
                      >
                        <Icon name={item.icon} size={18} />
                      </span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Footer actions */}
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 px-3 py-3 dark:border-slate-800">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logout.isPending}
                className="flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <Icon name="log-out" size={16} />
                {logout.isPending ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                <Icon name="home" className="text-white" size={14} />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Room<span className="text-blue-600">Rental</span>
              </span>
            </div>

            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            >
              {footerLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className="text-sm text-slate-500 transition-colors duration-200 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} RoomRental. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
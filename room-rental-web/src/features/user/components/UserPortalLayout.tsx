import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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

export default function UserPortalLayout() {
  const { user } = useCurrentUser();
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useUserTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const avatarRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    setAvatarOpen(false);
    setMobileOpen(false);
    await logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const displayName = user?.name ?? "Guest";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">

            {/* Logo */}
            <NavLink
              to="/user/dashboard"
              className="flex items-center gap-2.5 flex-shrink-0 group"
              onClick={() => setMobileOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform duration-200">
                <Icon name="home" className="text-white" size={18} />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Room<span className="text-blue-600">Rental</span>
              </span>
            </NavLink>

            {/* Desktop Center Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                      "after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:rounded-full after:transition-all after:duration-200",
                      isActive
                        ? "text-blue-600 dark:text-blue-400 after:bg-blue-600 dark:after:bg-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white after:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2">

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                aria-label="Toggle theme"
              >
                <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
              </button>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen((v) => !v); setAvatarOpen(false); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 relative"
                  aria-label="Notifications"
                >
                  <Icon name="bell" size={18} />
                  {/* Unread dot */}
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                    </div>
                    <div className="px-4 py-8 text-center">
                      <Icon name="bell" size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar Dropdown */}
              <div className="relative" ref={avatarRef}>
                <button
                  onClick={() => { setAvatarOpen((v) => !v); setNotifOpen(false); }}
                  className={cn(
                    "flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl transition-all duration-200",
                    "hover:bg-slate-100 dark:hover:bg-slate-800",
                    avatarOpen && "bg-slate-100 dark:bg-slate-800"
                  )}
                  aria-label="User menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                    {displayName}
                  </span>
                  <Icon
                    name="chevron-down"
                    size={14}
                    className={cn(
                      "hidden sm:block text-slate-400 transition-transform duration-200",
                      avatarOpen && "rotate-180"
                    )}
                  />
                </button>

                {avatarOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{displayName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email ?? ""}</p>
                        </div>
                      </div>
                    </div>

                    {/* Nav items in dropdown (mobile supplemental) */}
                    <div className="py-1">
                      <NavLink
                        to="/user/profile"
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Icon name="user" size={15} className="text-slate-400" />
                        My Profile
                      </NavLink>
                      <NavLink
                        to="/user/reservations"
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <Icon name="calendar" size={15} className="text-slate-400" />
                        My Reservations
                      </NavLink>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Icon name="logout" size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 ml-1"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                <Icon name={mobileOpen ? "x" : "menu"} size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE OVERLAY MENU ─────────────────────────────────────────── */}
        <div
          className={cn(
            "md:hidden fixed inset-0 top-16 z-40 transition-all duration-300 ease-in-out",
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Backdrop blur */}
          <div
            className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-down panel */}
          <div
            className={cn(
              "relative bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out",
              mobileOpen ? "translate-y-0" : "-translate-y-4"
            )}
          >
            {/* Mobile user card */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-blue-500/30 flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-slate-900 dark:text-white truncate">{displayName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user?.email ?? ""}</p>
                </div>
              </div>
            </div>

            {/* Mobile nav items */}
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-medium transition-all duration-200",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
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

            {/* Mobile footer actions */}
            <div className="px-4 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center justify-between">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Icon name="logout" size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                <Icon name="home" className="text-white" size={14} />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Room<span className="text-blue-600">Rental</span>
              </span>
            </div>

            {/* Footer links */}
            <nav className="flex items-center gap-6">
              {footerLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Copyright */}
            <p className="text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} RoomRental. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

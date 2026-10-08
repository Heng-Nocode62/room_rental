import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useCurrentUser } from "../../auth/hooks/useCurrentUser";
import { useLogout } from "../../auth/hooks/useLogout";

import { Icon, cn } from "./UserUI";
import { useUserTheme } from "../UserThemeProvider";

const navItems = [
  {
    label: "Home",
    path: "/user/dashboard",
    icon: "home" as const,
  },
  {
    label: "Browse Rooms",
    path: "/user/rooms",
    icon: "search" as const,
  },
  {
    label: "My Reservations",
    path: "/user/reservations",
    icon: "calendar" as const,
  },
  {
    label: "Profile",
    path: "/user/profile",
    icon: "user" as const,
  },
];

export default function UserPortalLayout() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggleTheme } = useUserTheme();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    "U";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-8">
            <NavLink
              to="/user/dashboard"
              className="flex items-center gap-2.5"
              onClick={() => setMobileOpen(false)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                <Icon name="home" size={19} />
              </div>

              <span className="text-lg font-extrabold tracking-tight">
                RoomRental
              </span>
            </NavLink>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.slice(0, 3).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "rounded-xl px-3.5 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Icon name={isDark ? "sun" : "moon"} size={18} />
            </button>

            <button
              type="button"
              className="hidden rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:block"
            >
              <Icon name="bell" size={18} />
            </button>

            <NavLink
              to="/user/profile"
              className="hidden items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 sm:flex"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                {initials}
              </div>

              <div className="max-w-28 text-left">
                <p className="truncate text-sm font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-slate-400">My profile</p>
              </div>
            </NavLink>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            >
              <Icon name={mobileOpen ? "x" : "menu"} size={20} />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 md:hidden">
            <div className="mx-auto max-w-[1440px] space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-300",
                    )
                  }
                >
                  <Icon name={item.icon} size={17} />
                  {item.label}
                </NavLink>
              ))}

              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400"
              >
                <Icon name="log-out" size={17} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

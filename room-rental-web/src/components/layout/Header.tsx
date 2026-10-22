import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePermissions } from "../../features/auth/hooks/usePermissions";
import { useLogout } from "../../features/auth/hooks/useLogout";
import LanguageSwitcher from "../../features/settings/LanguageSwitcher";
import ThemeToggle from "../../features/settings/ThemeToggle";
import { useAppConfig } from "../../features/settings/context/AppConfigProvider";

/** Top bar for the vertical (sidebar) layout. The horizontal layout uses HorizontalHeader. */
export default function Header() {
  const navigate = useNavigate();
  const { user } = usePermissions();
  const logoutMutation = useLogout();
  const { config } = useAppConfig();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setMenuOpen(false);

    navigate("/login", { replace: true });
  };

  const handleProfile = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "";

  const itemClass =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:bg-slate-100 disabled:opacity-60 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:bg-slate-800";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end-safe border-b border-slate-200/70 bg-white/80 px-6 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-900/80">
    
      {/* Right: settings + user menu */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        <span
          aria-hidden="true"
          className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700"
        />

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-800"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
              {initials || "?"}
            </span>

            <span className="text-left leading-tight">
              <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                {fullName}
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                {user?.username}
              </span>
            </span>

            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`h-4 w-4 text-slate-400 transition-transform duration-150 ${
                menuOpen ? "rotate-180" : ""
              }`}
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {fullName}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user?.username}
                </p>
              </div>

              <div className="pt-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleProfile}
                  className={itemClass}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-slate-400"
                  >
                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                  </svg>
                  My profile
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className={`${itemClass} text-rose-600 hover:bg-rose-50 focus-visible:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:focus-visible:bg-rose-950/40`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {logoutMutation.isPending ? "Logging out…" : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
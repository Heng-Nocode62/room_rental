import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { MapPin } from "../../components/ui/MaterialIcon.tsx";
import { ChevronDown, LogOut, MoreHorizontal } from "./layoutIcons.tsx";

export interface RoleNavItem {
  label: string;
  /** Shorter label used in the mobile bottom bar (falls back to `label`). */
  shortLabel?: string;
  path: string;
  icon?: ReactNode;
}

export interface RoleUser {
  name: string;
  email?: string;
}

interface Props {
  title: string;
  nav: RoleNavItem[];
  locationName?: string;
  locations?: Array<{ id: number; name: string }>;
  currentLocationId?: number | null;
  onLocationChange?: (id: number) => void;
  user?: RoleUser;
  onLogout?: () => void;
  children?: ReactNode;
}

/** Max items in the bottom bar. If nav is longer, the last slot becomes "More". */
const MAX_TABS = 5;

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/* ------------------------------ Location switcher ------------------------------ */

function LocationSelect({
  locations,
  value,
  onChange,
}: {
  locations: Array<{ id: number; name: string }>;
  value: number;
  onChange: (id: number) => void;
}) {
  return (
    <label className="relative flex items-center">
      <span className="sr-only">Location</span>
      <MapPin
        size={16}
        className="pointer-events-none absolute left-3 text-teal-700"
      />
      <select
        className={`h-10 max-w-[10.5rem] appearance-none rounded-full border border-slate-200 bg-slate-50 pl-9 pr-8 text-sm font-medium text-slate-800 transition hover:border-slate-300 sm:max-w-xs ${focusRing}`}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 text-slate-500" />
    </label>
  );
}

/* -------------------------------- Account menu -------------------------------- */

function AccountMenu({ user, onLogout }: { user: RoleUser; onLogout?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white transition hover:bg-teal-800 ${focusRing}`}
      >
        {initials(user.name)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            {user.email && <p className="truncate text-xs text-slate-500">{user.email}</p>}
          </div>
          {onLogout && (
            <>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${focusRing}`}
              >
                <LogOut size={18} className="text-slate-500" />
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------ Shell ------------------------------------ */

export default function RoleLayoutShell({
  title,
  nav,
  locationName,
  locations,
  currentLocationId,
  onLocationChange,
  user,
  onLogout,
  children,
}: Props) {
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const hasOverflow = nav.length > MAX_TABS;
  const tabItems = hasOverflow ? nav.slice(0, MAX_TABS - 1) : nav;
  const overflowItems = hasOverflow ? nav.slice(MAX_TABS - 1) : [];

  const activeItem = useMemo(
    () => nav.find((n) => pathname === n.path || pathname.startsWith(n.path + "/")),
    [nav, pathname],
  );
  const overflowActive = overflowItems.some((n) => n === activeItem);

  // Close the "More" sheet on navigation.
  useEffect(() => setMoreOpen(false), [pathname]);

  // Lock page scroll and support Escape while the sheet is open.
  useEffect(() => {
    if (!moreOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMoreOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const showLocations =
    !!locations && locations.length > 0 && currentLocationId != null && !!onLocationChange;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-200 px-5 py-5">
          <p className="text-xs font-semibold tracking-wide text-teal-700">Room Rental</p>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">{title}</h1>
        </div>
        <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${focusRing} ${
                  isActive
                    ? "bg-teal-50 text-teal-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-teal-700" aria-hidden="true" />
                  )}
                  <span className={isActive ? "text-teal-700" : "text-slate-400 group-hover:text-slate-600"}>
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
          <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:min-h-16 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold leading-tight text-slate-900 sm:text-lg">
                {activeItem?.label ?? title}
              </h2>
              <p className="truncate text-xs text-slate-500">
                {locationName ? locationName : title}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {showLocations && (
                <LocationSelect
                  locations={locations!}
                  value={currentLocationId as number}
                  onChange={onLocationChange!}
                />
              )}
              {user && <AccountMenu user={user} onLogout={onLogout} />}
            </div>
          </div>
        </header>

        <main
          id="main"
          className="mx-auto w-full max-w-6xl px-4 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:py-8 lg:pb-8"
        >
          {children ?? <Outlet />}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="mx-auto flex max-w-xl">
          {tabItems.map((item) => (
            <li key={item.path} className="flex-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition ${focusRing} ${
                    isActive ? "text-teal-800" : "text-slate-500 active:bg-slate-50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute inset-x-5 top-0 h-0.5 rounded-b-full bg-teal-700" aria-hidden="true" />
                    )}
                    <span className={isActive ? "text-teal-700" : "text-slate-400"}>{item.icon}</span>
                    <span className="max-w-full truncate">{item.shortLabel ?? item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}

          {hasOverflow && (
            <li className="flex-1">
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={moreOpen}
                className={`relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition ${focusRing} ${
                  overflowActive ? "text-teal-800" : "text-slate-500 active:bg-slate-50"
                }`}
              >
                {overflowActive && (
                  <span className="absolute inset-x-5 top-0 h-0.5 rounded-b-full bg-teal-700" aria-hidden="true" />
                )}
                <MoreHorizontal size={18} className={overflowActive ? "text-teal-700" : "text-slate-400"} />
                More
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* "More" bottom sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="More pages">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" aria-hidden="true" />
            <ul className="space-y-1">
              {overflowItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium ${focusRing} ${
                        isActive ? "bg-teal-50 text-teal-900" : "text-slate-700 active:bg-slate-50"
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
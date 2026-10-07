import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import LanguageSwitcher from "../../../features/settings/LanguageSwitcher";
import  { T } from "../../../features/translation/TranslationText";
import { X, Menu } from "../../ui/MaterialIcon";
import { ChevronDown } from "../layoutIcons";
import UserMenu from "../UserMenu";
import { type UserIcon, USER_LOGO, USER_APP_NAME, userNavGroups, groupIsActive } from "./UserNavigation";
import UserLocationSelect from "./UserLocationSelect";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500";

function MenuLink({ to, label, Icon }: { to: string; label: string; Icon: UserIcon }) {
  return (
    <NavLink
      to={to}
      role="menuitem"
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${focusRing} ${
          isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
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
          <T k={label} />
        </>
      )}
    </NavLink>
  );
}

function MobileLink({ to, label, Icon }: { to: string; label: string; Icon: UserIcon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className={isActive ? "text-indigo-600" : "text-slate-400"} />
          <T k={label} />
        </>
      )}
    </NavLink>
  );
}

interface Props {
  locationName?: string;
  locations?: Array<{ id: number; name: string }>;
  currentLocationId?: number | null;
  onLocationChange?: (id: number) => void;
}

export default function UserHorizontalHeader({ locations, currentLocationId, onLocationChange }: Props) {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const showLocations = !!locations?.length && currentLocationId != null && !!onLocationChange;

  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dismiss dropdown on outside click / Escape.
  useEffect(() => {
    if (openGroup === null) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenGroup(null);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openGroup]);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur transition-shadow ${
        scrolled ? "shadow-sm shadow-slate-900/5" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="user-mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="-ml-2 rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2.5">
          <img src={USER_LOGO} alt={`${USER_APP_NAME} logo`} className="h-9 w-9" />
          <p className="hidden text-[15px] font-semibold tracking-tight text-slate-900 sm:block">{USER_APP_NAME}</p>
        </div>

        <div className="hidden h-6 w-px bg-slate-200 lg:block" />

        {/* Desktop navigation */}
        <nav ref={navRef} aria-label="Main navigation" className="hidden h-full items-stretch gap-1 lg:flex">
          {userNavGroups.map((group) => {
            const isOpen = openGroup === group.key;
            const active = groupIsActive(group, pathname);
            return (
              <div key={group.key} className="relative flex h-full">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  onClick={() => setOpenGroup(isOpen ? null : group.key)}
                  className={`relative flex items-center gap-1.5 px-3 text-sm font-medium transition-colors ${focusRing} ${
                    active || isOpen ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <T k={group.label} />
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
                    {group.items.map((item) =>
                      item.children?.length ? (
                        <div key={item.path} className="mt-1 border-t border-slate-100 pt-1 first:mt-0 first:border-0 first:pt-0">
                          <p className="px-2.5 pb-1 pt-2 text-xs font-semibold text-slate-400">
                            <T k={item.label} />
                          </p>
                          <div className="space-y-0.5">
                            {item.children.map((child) => (
                              <MenuLink key={child.path} to={child.path} label={child.label} Icon={child.icon} />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <MenuLink key={item.path} to={item.path} label={item.label} Icon={item.icon} />
                      ),
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {showLocations && (
            <UserLocationSelect locations={locations!} value={currentLocationId as number} onChange={onLocationChange!} />
          )}
          <LanguageSwitcher />
          <UserMenu />
        </div>
      </div>

      {mobileOpen && (
        <div
          id="user-mobile-menu"
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 sm:px-6 lg:hidden"
        >
          <nav aria-label="Mobile navigation" className="space-y-5">
            {userNavGroups.map((group) => (
              <section key={group.key}>
                <h2 className="px-3 pb-1 text-xs font-semibold text-slate-400">
                  <T k={group.label} />
                </h2>
                <div className="space-y-0.5">
                  {group.items.map((item) =>
                    item.children?.length ? (
                      <div key={item.path} className="pt-1">
                        <p className="px-3 py-1.5 text-xs font-medium text-slate-500">
                          <T k={item.label} />
                        </p>
                        <div className="ml-4 space-y-0.5 border-l border-slate-200 pl-2">
                          {item.children.map((child) => (
                            <MobileLink key={child.path} to={child.path} label={child.label} Icon={child.icon} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <MobileLink key={item.path} to={item.path} label={item.label} Icon={item.icon} />
                    ),
                  )}
                </div>
              </section>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
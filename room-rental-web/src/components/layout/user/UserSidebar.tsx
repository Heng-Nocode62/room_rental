import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import  { T } from "../../../features/translation/TranslationText";
import { Menu, X } from "../../ui/MaterialIcon";
import { ChevronDown } from "../layoutIcons";
import { USER_LOGO, USER_APP_NAME, userNavGroups, itemIsActive, isPathActive } from "./UserNavigation";


export default function UserSidebar() {
  const { pathname } = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const isOpen = (key: string) => openGroups[key] ?? true;
  const toggle = (key: string) => setOpenGroups((v) => ({ ...v, [key]: !(v[key] ?? true) }));
  const closeMobile = () => setIsMobileOpen(false);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  useEffect(() => setIsMobileOpen(false), [pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <img src={USER_LOGO} alt={`${USER_APP_NAME} logo`} className="h-8 w-8" />
          <p className="font-semibold text-slate-900">{USER_APP_NAME}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
        >
          <Menu size={22} />
        </button>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={closeMobile} aria-hidden="true" />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white text-slate-600 transition-transform duration-200 ease-in-out lg:z-40 lg:w-60 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="shrink-0 border-b border-slate-200 px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={USER_LOGO} alt={`${USER_APP_NAME} logo`} className="h-10 w-10" />
              <p className="font-semibold text-slate-900">{USER_APP_NAME}</p>
            </div>
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Close menu"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav aria-label="Main navigation" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <div className="space-y-4">
            {userNavGroups.map((group) => (
              <section key={group.key}>
                <button
                  type="button"
                  onClick={() => toggle(group.key)}
                  aria-expanded={isOpen(group.key)}
                  className="flex w-full items-center justify-between px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 hover:text-slate-600"
                >
                  <T k={group.label} />
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen(group.key) ? "" : "-rotate-90"}`} />
                </button>

                {isOpen(group.key) && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;

                      if (item.children?.length) {
                        const parentOpen = isOpen(item.path);
                        const active = itemIsActive(item, pathname);
                        return (
                          <div key={item.path}>
                            <button
                              type="button"
                              onClick={() => toggle(item.path)}
                              aria-expanded={parentOpen}
                              className={`group flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition ${
                                active
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              <span className="flex items-center gap-3">
                                <Icon
                                  size={17}
                                  className={active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}
                                />
                                <T k={item.label} />
                              </span>
                              <ChevronDown size={15} className={`transition-transform ${parentOpen ? "" : "-rotate-90"}`} />
                            </button>

                            {parentOpen && (
                              <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                {item.children.map((child) => {
                                  const ChildIcon = child.icon;
                                  return (
                                    <NavLink
                                      key={child.path}
                                      to={child.path}
                                      onClick={closeMobile}
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
                                            className={isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}
                                          />
                                          <T k={child.label} />
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
                          onClick={closeMobile}
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
                                className={isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}
                              />
                              <T k={item.label} />
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}

// Re-exported so other user components can share the same helper.
export { isPathActive };
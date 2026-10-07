import { NavLink } from "react-router-dom";

import {
  useGroupedNavigation,
  type NavItem,
} from "../../features/auth/hooks/useGroupedNavigation";
import { navigationGroupLabels } from "../../features/auth/types/navigation";
import { T } from "../../features/translation/TranslationText";

function MobileLink({
  to,
  label,
  Icon,
}: {
  to: string;
  label: string;
  Icon: NavItem["icon"];
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-700 hover:bg-slate-50"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={17}
            className={isActive ? "text-indigo-600" : "text-slate-400"}
          />
          <span>
            <T k={label} />
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function MobileMenu() {
  const { groupedItems, isLoading } = useGroupedNavigation();

  return (
    <nav aria-label="Mobile navigation" className="space-y-5">
      {isLoading && (
        <p className="px-3 text-xs text-slate-400">Loading navigation...</p>
      )}

      {groupedItems.map(({ group, items }) => (
        <section key={group}>
          <h2 className="px-3 pb-1 text-xs font-semibold text-slate-400">
            <T k={navigationGroupLabels[group]} />
          </h2>

          <div className="space-y-0.5">
            {items.map((item) =>
              item.children && item.children.length > 0 ? (
                <div key={item.path} className="pt-1">
                  <p className="px-3 py-1.5 text-xs font-medium text-slate-500">
                    <T k={item.label} />
                  </p>

                  <div className="ml-4 space-y-0.5 border-l border-slate-200 pl-2">
                    {item.children.map((child) => (
                      <MobileLink
                        key={child.path}
                        to={child.path}
                        label={child.label}
                        Icon={child.icon}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <MobileLink
                  key={item.path}
                  to={item.path}
                  label={item.label}
                  Icon={item.icon}
                />
              ),
            )}
          </div>
        </section>
      ))}
    </nav>
  );
}

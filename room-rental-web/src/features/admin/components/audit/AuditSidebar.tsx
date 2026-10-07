export type AuditTab = { key: string; label: string };

type Props = {
  tabs: AuditTab[];
  activeKey: string;
  onChange: (key: string) => void;
};

export function AuditSidebar({ tabs, activeKey, onChange }: Props) {
  return (
    <aside className="w-full shrink-0 md:w-56">
      <nav
        aria-label="Audit sections"
        className="flex gap-1 overflow-x-auto md:sticky md:top-4 md:flex-col md:overflow-visible"
      >
        {tabs.map((tab) => {
          const active = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
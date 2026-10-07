import { cn } from "../../../../components/ui";

export interface SettingsTab {
  key: string;
  label: string;
}

interface Props {
  tabs: SettingsTab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function SettingsTabs({ tabs, activeKey, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors",
            tab.key === activeKey
              ? "border-b-2 border-slate-900 text-slate-900"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

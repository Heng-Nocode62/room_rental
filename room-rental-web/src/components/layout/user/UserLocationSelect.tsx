import { MapPin } from "../../ui/MaterialIcon";
import { ChevronDown } from "../layoutIcons";

interface Props {
  locations: Array<{ id: number; name: string }>;
  value: number;
  onChange: (id: number) => void;
}

export default function UserLocationSelect({ locations, value, onChange }: Props) {
  return (
    <label className="relative flex items-center">
      <span className="sr-only">Location</span>
      <MapPin size={16} className="pointer-events-none absolute left-3 text-indigo-600" />
      <select
        className="h-9 max-w-[10.5rem] appearance-none rounded-full border border-slate-200 bg-slate-50 pl-9 pr-8 text-sm font-medium text-slate-800 transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:max-w-xs"
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
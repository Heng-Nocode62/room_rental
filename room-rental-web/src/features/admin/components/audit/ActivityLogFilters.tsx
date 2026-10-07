import { Input, Select } from "../../../../components/ui/index.ts";

interface Props {
  method: string;
  search: string;
  from: string;
  to: string;
  onMethodChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

export function ActivityLogFilters({
  method, search, from, to,
  onMethodChange, onSearchChange, onFromChange, onToChange,
}: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Input
        placeholder="Search URL, IP, user…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select
        value={method}
        onChange={(e) => onMethodChange(e.target.value)}
        options={[
          { label: "All methods", value: "" },
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
          { label: "PATCH", value: "PATCH" },
          { label: "DELETE", value: "DELETE" },
        ]}
      />
      <Input placeholder="true" label="From" type="datetime-local" value={from} onChange={(e) => onFromChange(e.target.value)} />
      <Input placeholder="true" label="To" type="datetime-local" value={to} onChange={(e) => onToChange(e.target.value)} />
    </div>
  );
}
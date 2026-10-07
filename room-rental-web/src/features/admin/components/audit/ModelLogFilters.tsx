import { Input, Select } from "../../../../components/ui/index.ts";

interface Props {
  modelType: string;
  event: string;
  search: string;
  from: string;
  to: string;
  onModelTypeChange: (v: string) => void;
  onEventChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

export function ModelLogFilters({
  modelType, event, search, from, to,
  onModelTypeChange, onEventChange, onSearchChange, onFromChange, onToChange,
}: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      <Input
        placeholder="Search…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Input
      label="Model type"
        
        value={modelType}
        onChange={(e) => onModelTypeChange(e.target.value)}
      />
      <Select
        value={event}
        onChange={(e) => onEventChange(e.target.value)}
        options={[
          { label: "All events", value: "" },
          { label: "Create", value: "CREATE" },
          { label: "Update", value: "UPDATE" },
          { label: "Delete", value: "DELETE" },
        ]}
      />
      <Input placeholder="true" label="From" type="datetime-local" value={from} onChange={(e) => onFromChange(e.target.value)} />
      <Input placeholder="true" label="To"  type="datetime-local" value={to} onChange={(e) => onToChange(e.target.value)} />
    </div>
  );
}
import { Input, Select } from "../../../components/ui";

import type { RoomBlockStatus, RoomBlockType } from "../types/roomBlock";

interface Props {
  keyword: string;

  status: RoomBlockStatus | "";

  blockType: RoomBlockType | "";

  date: string;

  onKeywordChange: (value: string) => void;

  onStatusChange: (value: string) => void;

  onBlockTypeChange: (value: string) => void;

  onDateChange: (value: string) => void;
}

export function RoomBlockFilters({
  keyword,
  status,
  blockType,
  date,
  onKeywordChange,
  onStatusChange,
  onBlockTypeChange,
  onDateChange,
}: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Input
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="Search room or reason..."
      />

      <Select
        value={blockType}
        onChange={(event) => onBlockTypeChange(event.target.value)}
        options={[
          {
            label: "All types",
            value: "",
          },
          {
            label: "Maintenance",
            value: "MAINTENANCE",
          },
          {
            label: "Cleaning",
            value: "CLEANING",
          },
          {
            label: "Private event",
            value: "PRIVATE_EVENT",
          },
          {
            label: "Renovation",
            value: "RENOVATION",
          },
          {
            label: "Other",
            value: "OTHER",
          },
        ]}
      />

      <Select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        options={[
          {
            label: "All statuses",
            value: "",
          },
          {
            label: "Active",
            value: "ACTIVE",
          },
          {
            label: "Completed",
            value: "COMPLETED",
          },
          {
            label: "Cancelled",
            value: "CANCELLED",
          },
        ]}
      />

      <Input
        type="date"
        value={date}
        onChange={(event) => onDateChange(event.target.value)}
      />
    </div>
  );
}

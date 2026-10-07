import { Input, Select } from "../../../components/ui";

interface ReservationFiltersProps {
  keyword: string;
  status: string;
  date: string;

  onKeywordChange: (value: string) => void;

  onStatusChange: (value: string) => void;

  onDateChange: (value: string) => void;
}

export function ReservationFilters({
  keyword,
  status,
  date,
  onKeywordChange,
  onStatusChange,
  onDateChange,
}: ReservationFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
      <Input
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder="Search reference, contact, purpose..."
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
            label: "Pending",
            value: "PENDING",
          },
          {
            label: "Confirmed",
            value: "CONFIRMED",
          },
          {
            label: "Checked in",
            value: "CHECKED_IN",
          },
          {
            label: "Checked out",
            value: "CHECKED_OUT",
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

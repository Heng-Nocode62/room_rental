import { Input, Select } from "../../../components/ui";

import type { RoomBlockStatus, RoomBlockType } from "../types/roomBlock";

import { BLOCK_TYPE_OPTIONS } from "../utils/roomBlockUtils";

interface Props {
  keyword: string;

  status: RoomBlockStatus | "";

  blockType: RoomBlockType | "";

  date: string;

  /** The date the page starts with (today). It is not counted as an active filter. */
  defaultDate?: string;

  resultLabel?: string;

  onKeywordChange: (value: string) => void;

  onStatusChange: (value: string) => void;

  onBlockTypeChange: (value: string) => void;

  onDateChange: (value: string) => void;

  onClear?: () => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function RoomBlockFilters({
  keyword,
  status,
  blockType,
  date,
  defaultDate = "",
  resultLabel,
  onKeywordChange,
  onStatusChange,
  onBlockTypeChange,
  onDateChange,
  onClear,
}: Props) {
  const activeCount = [
    keyword.trim(),
    status,
    blockType,
    date !== defaultDate ? "date" : "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_220px_220px]">
        <Input
          label="Search"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Room number, name or reason..."
        />

        <Select
          label="Block type"
          value={blockType}
          onChange={(event) => onBlockTypeChange(event.target.value)}
          options={[
            { label: "All types", value: "" },
            ...BLOCK_TYPE_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
            })),
          ]}
        />

        <div>
          <Input
            label="Active on date"
            placeholder=" "
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
          />

          <div className="mt-1 flex gap-3 text-xs">
            <button
              type="button"
              onClick={() => onDateChange(defaultDate)}
              className="font-medium text-indigo-600 hover:underline"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => onDateChange("")}
              className="font-medium text-slate-500 hover:underline"
            >
              Any date
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div
          role="group"
          aria-label="Filter by status"
          className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5"
        >
          {STATUS_OPTIONS.map((option) => {
            const selected = status === option.value;

            return (
              <button
                key={option.value || "all"}
                type="button"
                aria-pressed={selected}
                onClick={() => onStatusChange(option.value)}
                className={[
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  selected
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {resultLabel && (
            <span className="text-sm text-slate-500">{resultLabel}</span>
          )}

          {activeCount > 0 && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-md px-2.5 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Clear filters ({activeCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
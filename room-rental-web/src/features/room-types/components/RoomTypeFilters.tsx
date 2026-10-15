import { Input, Select } from "../../../components/ui";

export type RoomTypeView = "grid" | "table";

interface LocationOption {
  id: number;
  name: string;
}

interface Props {
  keyword: string;
  status: "" | "ACTIVE" | "INACTIVE";
  locationId: string;
  locations: LocationOption[];
  /** Hide the location select when the page is already scoped to one location */
  showLocationFilter?: boolean;
  view: RoomTypeView;
  resultLabel?: string;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: "" | "ACTIVE" | "INACTIVE") => void;
  onLocationChange: (value: string) => void;
  onViewChange: (value: RoomTypeView) => void;
  onClear: () => void;
}

const STATUS_OPTIONS: { value: "" | "ACTIVE" | "INACTIVE"; label: string }[] = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export function RoomTypeFilters({
  keyword,
  status,
  locationId,
  locations,
  showLocationFilter = true,
  view,
  resultLabel,
  onKeywordChange,
  onStatusChange,
  onLocationChange,
  onViewChange,
  onClear,
}: Props) {
  const activeCount = [
    keyword.trim(),
    status,
    showLocationFilter ? locationId : "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div
        className={[
          "grid gap-4 lg:items-end",
          showLocationFilter
            ? "lg:grid-cols-[1fr_220px_auto]"
            : "lg:grid-cols-[1fr_auto]",
        ].join(" ")}
      >
        <Input
          label="Search"
          placeholder="Name, code or description..."
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />

        {showLocationFilter && (
          <Select
            label="Location"
            value={locationId}
            onChange={(event) => onLocationChange(event.target.value)}
            options={[
              { value: "", label: "All locations" },
              ...locations.map((location) => ({
                value: String(location.id),
                label: location.name,
              })),
            ]}
          />
        )}

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Status</p>

          <div
            role="group"
            aria-label="Filter by status"
            className="inline-flex w-full rounded-lg border border-slate-200 bg-slate-50 p-0.5 lg:w-auto"
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
                    "flex-1 rounded-md px-3 py-2 text-sm font-medium transition lg:flex-none",
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
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3">
          {resultLabel && (
            <span className="text-sm text-slate-500">{resultLabel}</span>
          )}

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-md px-2.5 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Clear filters ({activeCount})
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Change layout"
          className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5"
        >
          {(["grid", "table"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => onViewChange(option)}
              className={[
                "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition",
                view === option
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800",
              ].join(" ")}
            >
              {option === "grid" ? "Cards" : "Table"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
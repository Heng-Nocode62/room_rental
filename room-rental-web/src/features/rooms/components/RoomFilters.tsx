import { useState } from "react";

import { Input, Select } from "../../../components/ui";
import type { AmenityResponse, RoomStatus } from "../types/room";

interface Option {
  id: number;
  name: string;
}

interface Props {
  keyword: string;
  locationId: string;
  roomTypeId: string;
  status: RoomStatus | "";
  minCapacity: string;
  maxCapacity: string;
  amenityId: string;
  locations: Option[];
  roomTypes: Option[];
  amenities: AmenityResponse[];
  amenitiesDisabled?: boolean;
  showLocationFilter?: boolean;
  /** The status the page starts with; it is not counted as an active filter */
  defaultStatus?: RoomStatus | "";
  /** e.g. "42 rooms" */
  resultLabel?: string;
  onClearFilters?: () => void;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onRoomTypeChange: (value: string) => void;
  onStatusChange: (value: RoomStatus | "") => void;
  onMinCapacityChange: (value: string) => void;
  onMaxCapacityChange: (value: string) => void;
  onAmenityChange: (value: string) => void;
}

const STATUS_OPTIONS: { value: RoomStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

export function RoomFilters({
  keyword,
  locationId,
  roomTypeId,
  status,
  minCapacity,
  maxCapacity,
  amenityId,
  locations,
  roomTypes,
  amenities,
  amenitiesDisabled = false,
  showLocationFilter = true,
  defaultStatus = "",
  resultLabel,
  onClearFilters,
  onKeywordChange,
  onLocationChange,
  onRoomTypeChange,
  onStatusChange,
  onMinCapacityChange,
  onMaxCapacityChange,
  onAmenityChange,
}: Props) {
  const advancedCount = [
    showLocationFilter ? locationId : "",
    roomTypeId,
    minCapacity,
    maxCapacity,
    amenityId,
  ].filter(Boolean).length;

  const activeCount =
    advancedCount + (keyword.trim() ? 1 : 0) + (status !== defaultStatus ? 1 : 0);

  const [expanded, setExpanded] = useState(advancedCount > 0);

  // Chips for the advanced filters that are currently applied.
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (showLocationFilter && locationId) {
    chips.push({
      key: "location",
      label:
        locations.find((item) => String(item.id) === locationId)?.name ??
        "Location",
      onRemove: () => onLocationChange(""),
    });
  }

  if (roomTypeId) {
    chips.push({
      key: "type",
      label:
        roomTypes.find((item) => String(item.id) === roomTypeId)?.name ??
        "Room type",
      onRemove: () => onRoomTypeChange(""),
    });
  }

  if (minCapacity || maxCapacity) {
    chips.push({
      key: "capacity",
      label: `Capacity ${minCapacity || "1"}–${maxCapacity || "∞"}`,
      onRemove: () => {
        onMinCapacityChange("");
        onMaxCapacityChange("");
      },
    });
  }

  if (amenityId) {
    chips.push({
      key: "amenity",
      label:
        amenities.find((item) => String(item.id) === amenityId)?.name ??
        "Amenity",
      onRemove: () => onAmenityChange(""),
    });
  }

  return (
    <div className="space-y-4">
      {/* Primary row */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <Input
          label="Search"
          placeholder="Room number or name..."
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />

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

      {/* Advanced */}
      <div>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="inline-flex items-center gap-2 rounded-md py-1 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <span
            aria-hidden="true"
            className={`inline-block transition-transform ${expanded ? "rotate-90" : ""}`}
          >
            ›
          </span>
          More filters
          {advancedCount > 0 && (
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">
              {advancedCount}
            </span>
          )}
        </button>

        {expanded && (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

            <Select
              label="Room type"
              value={roomTypeId}
              onChange={(event) => onRoomTypeChange(event.target.value)}
              options={[
                { value: "", label: "All room types" },
                ...roomTypes.map((type) => ({
                  value: String(type.id),
                  label: type.name,
                })),
              ]}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min capacity"
                type="number"
                min={1}
                placeholder="1"
                value={minCapacity}
                onChange={(event) => onMinCapacityChange(event.target.value)}
              />

              <Input
                label="Max capacity"
                type="number"
                min={1}
                placeholder="∞"
                value={maxCapacity}
                onChange={(event) => onMaxCapacityChange(event.target.value)}
              />
            </div>

            <Select
              label="Amenity"
              value={amenityId}
              disabled={amenitiesDisabled}
              onChange={(event) => onAmenityChange(event.target.value)}
              options={[
                {
                  value: "",
                  label: amenitiesDisabled
                    ? locationId
                      ? "Loading amenities..."
                      : "Select a location first"
                    : "All amenities",
                },
                ...amenities.map((amenity) => ({
                  value: String(amenity.id),
                  label: `${amenity.name} · $${amenity.price.toFixed(2)}`,
                })),
              ]}
            />
          </div>
        )}
      </div>

      {/* Summary */}
      {(resultLabel || activeCount > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {resultLabel && (
              <span className="mr-1 text-sm text-slate-500">{resultLabel}</span>
            )}

            {chips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-2.5 pr-1.5 text-xs font-medium text-slate-700"
              >
                {chip.label}

                <button
                  type="button"
                  aria-label={`Remove filter ${chip.label}`}
                  onClick={chip.onRemove}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {activeCount > 0 && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
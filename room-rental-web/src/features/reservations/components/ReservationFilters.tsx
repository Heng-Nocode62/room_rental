
import { Input, Select } from "../../../components/ui";
import { useLocationsWithEnable } from "../../locations/hooks/useLocations";
import { useRoomsWithEnable } from "../../rooms/hooks/useRooms";
import { pricingUnitOptions } from "../../pricing/config/pricingUnits";

interface ReservationFiltersProps {
  keyword: string;
  status: string;
  date: string;

  onKeywordChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateChange: (value: string) => void;

  showResourceFilters?: boolean;

  fixedLocationId?: number | string | null;

  roomId?: string;
  locationId?: string;
  pricingUnitId?: string;
  fromDate?: string;
  toDate?: string;

  onRoomIdChange?: (value: string) => void;
  onLocationIdChange?: (value: string) => void;
  onPricingUnitIdChange?: (value: string) => void;
  onFromDateChange?: (value: string) => void;
  onToDateChange?: (value: string) => void;
  onClearFilters?: () => void;
}

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Checked in", value: "CHECKED_IN" },
  { label: "Checked out", value: "CHECKED_OUT" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function ReservationFilters({
  keyword,
  status,
  date,
  onKeywordChange,
  onStatusChange,
  onDateChange,
  showResourceFilters = false,
  fixedLocationId,
  roomId = "",
  locationId = "",
  pricingUnitId = "",
  fromDate = "",
  toDate = "",
  onRoomIdChange,
  onLocationIdChange,
  onPricingUnitIdChange,
  onFromDateChange,
  onToDateChange,
  onClearFilters,
}: ReservationFiltersProps) {
  const locationIsFixed = fixedLocationId !== undefined;

  const effectiveLocationId = locationIsFixed
    ? fixedLocationId == null
      ? ""
      : String(fixedLocationId)
    : locationId;

  const {
    data: locations = [],
    isLoading: locationsLoading,
    isError: locationsError,
  } = useLocationsWithEnable(showResourceFilters && !locationIsFixed);

  // Always fetch rooms for the effective location.
  // In owner mode, this is the fixed location from LocationScopeProvider.
  const roomsQuery = useRoomsWithEnable(
    {
      locationId: effectiveLocationId
        ? Number(effectiveLocationId)
        : undefined,
      page: 0,
      size: 100,
      sort: "roomNumber,asc",
    },
    showResourceFilters && Boolean(effectiveLocationId),
  );

  const roomOptions = roomsQuery.isPlaceholderData
    ? []
    : roomsQuery.data?.content ?? [];

  const locationOptions = locations.map((location) => ({
    value: String(location.id),
    label: `${location.name} (${location.code})${
      location.status === "ACTIVE" ? "" : " · Inactive"
    }`,
  }));

  const locationPlaceholder = locationsLoading
    ? "Loading locations..."
    : locationsError
      ? "Could not load locations"
      : "All locations";

  const roomPlaceholder = !effectiveLocationId
    ? locationIsFixed
      ? "No active location selected"
      : "Select a location first"
    : roomsQuery.isFetching
      ? "Loading rooms..."
      : roomsQuery.isError
        ? "Could not load rooms"
        : roomOptions.length === 0
          ? "No rooms found"
          : "All rooms";

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {showResourceFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Filter reservations
            </h2>
          </div>

          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      <div
        className={
          showResourceFilters
            ? locationIsFixed
              ? "grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_210px]"
              : "grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_210px_260px]"
            : "grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]"
        }
      >
        <Input
          aria-label="Search reservations"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Search reference, contact, purpose..."
        />

        <Select
          label="Status"
          aria-label="Filter by status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          options={statusOptions}
        />

        {showResourceFilters && !locationIsFixed ? (
          <Select
            label="Location"
            aria-label="Filter by location"
            value={locationId}
            onChange={(event) =>
              onLocationIdChange?.(event.target.value)
            }
            disabled={locationsLoading || locationsError}
            options={[
              { label: locationPlaceholder, value: "" },
              ...locationOptions,
            ]}
          />
        ) : !showResourceFilters ? (
          <Input
            id="reservation-date"
            aria-label="Reservation date"
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
          />
        ) : null}
      </div>

      {showResourceFilters && (
        <div className="border-t border-slate-100 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Room and schedule
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Select
              label="Room"
              aria-label="Filter by room"
              value={roomId}
              onChange={(event) =>
                onRoomIdChange?.(event.target.value)
              }
              disabled={
                !effectiveLocationId ||
                roomsQuery.isFetching ||
                roomsQuery.isError ||
                roomOptions.length === 0
              }
              options={[
                { label: roomPlaceholder, value: "" },
                ...roomOptions.map((room) => ({
                  value: String(room.id),
                  label:
                    room.name && room.name !== room.roomNumber
                      ? `${room.roomNumber} · ${room.name}`
                      : `Room ${room.roomNumber}`,
                })),
              ]}
            />

            <Select
              label="Pricing unit"
              aria-label="Filter by pricing unit"
              value={pricingUnitId}
              onChange={(event) =>
                onPricingUnitIdChange?.(event.target.value)
              }
              options={[
                { label: "All pricing units", value: "" },
                ...pricingUnitOptions.map((unit) => ({
                  value: String(unit.id),
                  label: unit.name,
                })),
              ]}
            />

            <Input
              id="reservation-date"
              placeholder=" "
              label="On date"
              aria-label="Reservation date"
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
            />

            <Input
              id="reservation-from-date"
              label="From date"
              placeholder=" "
              aria-label="Reservation start date"
              type="date"
              value={fromDate}
              onChange={(event) =>
                onFromDateChange?.(event.target.value)
              }
            />

            <Input
              id="reservation-to-date"
              label="To date"
              placeholder=" "
              aria-label="Reservation end date"
              type="date"
              value={toDate}
              onChange={(event) =>
                onToDateChange?.(event.target.value)
              }
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Use either “On date” or a date range, not both.
          </p>
        </div>
      )}
    </section>
  );
}

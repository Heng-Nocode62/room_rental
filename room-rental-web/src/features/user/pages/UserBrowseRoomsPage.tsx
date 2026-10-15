import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { DateTime } from "luxon";

import { useLocations } from "../../locations/hooks/useLocations";
import { useAmenities } from "../../amenities/hooks/useAmenities";
import { useRoomTypes } from "../../room-types/hooks/useRoomTypes";
import { useRooms } from "../../rooms/hooks/useRooms";
import { useDayAvailabilityOverview } from "../../availability/hooks/useDayAvailabilityOverview";
import type { RoomResponse } from "../../rooms/types/room";
import type { RoomAvailabilityResponse } from "../../availability/types/availability";

import {
  Card,
  Empty,
  Icon,
  Input,
  PageLoading,
  SelectInput,
} from "../components/UserUI";

import { RoomCard } from "../components/RoomCard";

const CAPACITY_RANGES = [
  { value: "1-4", label: "1–4 people", min: 1, max: 4 },
  { value: "5-10", label: "5–10 people", min: 5, max: 10 },
  { value: "11-20", label: "11–20 people", min: 11, max: 20 },
  { value: "21+", label: "21+ people", min: 21, max: undefined },
] as const;

const FLOOR_OPTIONS = [
  { value: "1", label: "Floor 1" },
  { value: "2", label: "Floor 2" },
  { value: "3", label: "Floor 3" },
  { value: "4+", label: "Floor 4+" },
] as const;

const START_TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

function parseList(value: string | null): string[] {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function toMinutes(value: string): number {
  const timePart = value.includes("T")
    ? (value.split("T").pop() ?? value)
    : value;
  const [hours, minutes] = timePart.slice(0, 5).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return -1;
  return hours * 60 + minutes;
}

function roomHourlyPrice(room: RoomResponse, effectiveDate: string) {
  const effectivePrices = (room.prices ?? [])
    .filter((price) => price.pricingUnitCode.toUpperCase() === "HOURLY")
    .filter((price) => price.effectiveFrom <= effectiveDate)
    .filter((price) => !price.effectiveTo || price.effectiveTo >= effectiveDate)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));

  // A historical price may now be inactive even though it was valid on the selected date.
  return (
    effectivePrices.find((price) => price.status === "ACTIVE") ??
    effectivePrices[0]
  );
}

function roomIsAvailableForDuration(
  availability: RoomAvailabilityResponse | undefined,
  startTime: string,
  durationHours: number,
): boolean {
  if (!availability) return false;

  const wantedStart = toMinutes(startTime);
  if (wantedStart < 0 || durationHours <= 0) return false;
  const wantedEnd = wantedStart + durationHours * 60;

  const slots = [...(availability.slots ?? [])].sort(
    (a, b) => toMinutes(a.start) - toMinutes(b.start),
  );

  let expectedStart = wantedStart;
  while (expectedStart < wantedEnd) {
    const slot = slots.find(
      (candidate) => toMinutes(candidate.start) === expectedStart,
    );

    if (!slot || slot.status !== "AVAILABLE") return false;

    const end = toMinutes(slot.end);
    if (end <= expectedStart || end > wantedEnd) return false;

    expectedStart = end;
  }

  return expectedStart === wantedEnd;
}

function floorMatches(roomFloor: string | undefined, selectedFloors: string[]) {
  if (selectedFloors.length === 0) return true;
  if (!roomFloor) return false;

  const normalized = roomFloor.trim().toLowerCase();
  const numberMatch = normalized.match(/\d+/);
  const floorNumber = numberMatch ? Number(numberMatch[0]) : NaN;

  return selectedFloors.some((floor) => {
    if (floor === "4+") return Number.isFinite(floorNumber) && floorNumber >= 4;
    return normalized === floor || floorNumber === Number(floor);
  });
}

function capacityMatches(capacity: number, selectedRanges: string[]) {
  if (selectedRanges.length === 0) return true;
  return CAPACITY_RANGES.some((range) => {
    if (!selectedRanges.includes(range.value)) return false;
    return (
      capacity >= range.min &&
      (range.max === undefined || capacity <= range.max)
    );
  });
}

function roomHasAmenities(room: RoomResponse, selectedAmenityIds: string[]) {
  if (selectedAmenityIds.length === 0) return true;
  const roomAmenityIds = new Set(
    (room.amenities ?? []).map((amenity) => amenity.amenityId),
  );
  return selectedAmenityIds.every((id) => roomAmenityIds.has(Number(id)));
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export default function UserBrowseRoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = DateTime.now().toISODate() ?? "";

  // Draft values: the user can adjust the top search and sidebar, then press Search.
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [locationId, setLocationId] = useState(
    searchParams.get("locationId") ?? "",
  );
  const [date, setDate] = useState(searchParams.get("date") ?? today);
  const [startTime, setStartTime] = useState(
    searchParams.get("startTime") ?? "10:00",
  );
  const [durationHours, setDurationHours] = useState(
    searchParams.get("durationHours") ?? "2",
  );
  const [capacityRanges, setCapacityRanges] = useState(
    parseList(searchParams.get("capacityRanges")),
  );
  const [maxHourlyPrice, setMaxHourlyPrice] = useState(
    Number(searchParams.get("maxHourlyPrice") ?? 100),
  );
  const [amenityIds, setAmenityIds] = useState(
    parseList(searchParams.get("amenityIds")),
  );
  const [floors, setFloors] = useState(parseList(searchParams.get("floors")));
  const [sort, setSort] = useState(searchParams.get("sort") ?? "recommended");

  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const { data: roomTypes = [] } = useRoomTypes();
  const { data: amenitiesResponse, isLoading: amenitiesLoading } = useAmenities(
    {
      locationId: locationId ? Number(locationId) : undefined,
      status: "ACTIVE",
      page: 0,
      size: 100,
      sort: "name,asc",
    },
  );

  const activeLocations = useMemo(
    () => locations.filter((location) => location.status === "ACTIVE"),
    [locations],
  );
  const activeAmenities = useMemo(
    () =>
      (amenitiesResponse?.content ?? []).filter(
        (amenity) => amenity.status === "ACTIVE",
      ),
    [amenitiesResponse?.content],
  );
  // Temporary compatibility: use the existing room-type image as a visual only.
  // The RoomType name itself is not displayed as a user-facing field/filter.
  const roomTypeMap = useMemo(
    () => new Map(roomTypes.map((roomType) => [roomType.id, roomType])),
    [roomTypes],
  );

  // Applied values come from the URL. The rooms query only changes after Search is pressed.
  const appliedKeyword = searchParams.get("keyword")?.trim() || undefined;
  const appliedLocationText = searchParams.get("locationId") ?? "";
  const appliedLocationId = appliedLocationText
    ? Number(appliedLocationText)
    : undefined;
  const appliedDate = searchParams.get("date") ?? today;
  const appliedStartTime = searchParams.get("startTime") ?? "10:00";
  const appliedDurationHours = Number(searchParams.get("durationHours") ?? 2);
  const appliedCapacityRangesParam = searchParams.get("capacityRanges") ?? "";
  const appliedAmenityIdsParam = searchParams.get("amenityIds") ?? "";
  const appliedFloorsParam = searchParams.get("floors") ?? "";
  const appliedCapacityRanges = parseList(appliedCapacityRangesParam || null);
  const appliedAmenityIds = parseList(appliedAmenityIdsParam || null);
  const appliedFloors = parseList(appliedFloorsParam || null);
  const rawAppliedMaxHourlyPrice = Number(
    searchParams.get("maxHourlyPrice") ?? 100,
  );
  const appliedMaxHourlyPrice = Number.isFinite(rawAppliedMaxHourlyPrice)
    ? Math.min(100, Math.max(0, rawAppliedMaxHourlyPrice))
    : 100;

  const serverCapacityBounds = useMemo(() => {
    const selected = CAPACITY_RANGES.filter((range) =>
      appliedCapacityRanges.includes(range.value),
    );
    if (selected.length === 0)
      return { minCapacity: undefined, maxCapacity: undefined };
    return {
      minCapacity: Math.min(...selected.map((range) => range.min)),
      maxCapacity: selected.some((range) => range.max === undefined)
        ? undefined
        : Math.max(...selected.map((range) => range.max ?? 0)),
    };
  }, [appliedCapacityRangesParam]);

  const rooms = useRooms({
    keyword: appliedKeyword,
    locationId: appliedLocationId,
    status: "ACTIVE",
    minCapacity: serverCapacityBounds.minCapacity,
    maxCapacity: serverCapacityBounds.maxCapacity,
    // The extended API accepts multiple selected amenities.
    amenityIds: appliedAmenityIds.map(Number),
    // The current backend floor filter is exact-match. Handle 4+ client-side
    // so a selection includes floors 4, 5, 6, and higher.
    floors:
      appliedFloors.length > 0 && !appliedFloors.includes("4+")
        ? appliedFloors
        : undefined,
    // Preserve the current behavior for rooms without an hourly price at the
    // default $100 cap. Lower caps are filtered by the backend for this date.
    maxHourlyPrice:
      appliedMaxHourlyPrice < 100 ? appliedMaxHourlyPrice : undefined,
    effectiveDate: appliedDate,
    page: 0,
    size: 100,
    sort: "roomNumber,asc",
  });

  const availability = useDayAvailabilityOverview(
    appliedDate,
    undefined,
    appliedLocationId,
  );

  const availabilityByRoomId = useMemo(
    () =>
      new Map(
        (availability.data?.rooms ?? []).map((item) => [item.roomId, item]),
      ),
    [availability.data?.rooms],
  );

  const filteredRooms = useMemo(() => {
    let result = [...(rooms.data?.content ?? [])];

    result = result.filter((room) =>
      capacityMatches(room.capacity, appliedCapacityRanges),
    );
    result = result.filter((room) => roomHasAmenities(room, appliedAmenityIds));
    result = result.filter((room) => floorMatches(room.floor, appliedFloors));
    result = result.filter((room) => {
      const price = roomHourlyPrice(room, appliedDate)?.price;
      // Rooms without a configured hourly rate remain visible at the default range;
      // selecting a lower cap excludes rooms whose hourly rate is unknown or too high.
      if (price === undefined || price === null)
        return appliedMaxHourlyPrice >= 100;
      return price <= appliedMaxHourlyPrice;
    });
    result = result.filter((room) =>
      roomIsAvailableForDuration(
        availabilityByRoomId.get(room.id),
        appliedStartTime,
        appliedDurationHours,
      ),
    );

    switch (sort) {
      case "price-low":
        result.sort(
          (a, b) =>
            (roomHourlyPrice(a, appliedDate)?.price ??
              Number.POSITIVE_INFINITY) -
            (roomHourlyPrice(b, appliedDate)?.price ??
              Number.POSITIVE_INFINITY),
        );
        break;
      case "price-high":
        result.sort(
          (a, b) =>
            (roomHourlyPrice(b, appliedDate)?.price ?? -1) -
            (roomHourlyPrice(a, appliedDate)?.price ?? -1),
        );
        break;
      case "capacity-high":
        result.sort((a, b) => b.capacity - a.capacity);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
    }

    return result;
  }, [
    rooms.data?.content,
    availabilityByRoomId,
    appliedDate,
    appliedCapacityRangesParam,
    appliedAmenityIdsParam,
    appliedFloorsParam,
    appliedMaxHourlyPrice,
    appliedStartTime,
    appliedDurationHours,
    sort,
  ]);

 // Push draft filter values into the URL whenever they change.
// The rooms query reads from the URL, so this is what triggers the search.
useEffect(() => {
  const timer = window.setTimeout(() => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (locationId) params.set("locationId", locationId);
    if (date) params.set("date", date);
    if (startTime) params.set("startTime", startTime);
    if (durationHours) params.set("durationHours", durationHours);
    if (capacityRanges.length) params.set("capacityRanges", capacityRanges.join(","));
    params.set("maxHourlyPrice", String(maxHourlyPrice));
    if (amenityIds.length) params.set("amenityIds", amenityIds.join(","));
    if (floors.length) params.set("floors", floors.join(","));
    if (sort) params.set("sort", sort);
    setSearchParams(params, { replace: true });
  }, 350);

  return () => window.clearTimeout(timer);
}, [
  keyword,
  locationId,
  date,
  startTime,
  durationHours,
  capacityRanges,
  maxHourlyPrice,
  amenityIds,
  floors,
  sort,
  setSearchParams,
]);

  const clearFilters = () => {
  setKeyword("");
  setLocationId("");
  setDate(today);
  setStartTime("10:00");
  setDurationHours("2");
  setCapacityRanges([]);
  setMaxHourlyPrice(100);
  setAmenityIds([]);
  setFloors([]);
  setSort("recommended");
};
  const handleLocationChange = (value: string) => {
    setLocationId(value);
    // Amenities belong to a location, so don't carry selected amenity IDs across locations.
    setAmenityIds([]);
  };

  const isLoading = rooms.isLoading || availability.isLoading;
  const hasError = rooms.isError || availability.isError;
  const appliedLocationName = activeLocations.find(
    (location) => location.id === appliedLocationId,
  )?.name;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-7 lg:px-8">
        {/* Top search bar — location, date, start time and duration */}
        <Card className="p-3 sm:p-4">
          <div className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-[1.15fr_1.05fr_0.95fr_0.9fr]">
            <SelectInput
              label="Location"
              value={locationId}
              disabled={locationsLoading}
              onChange={(event) => handleLocationChange(event.target.value)}
            >
              <option value="">All locations</option>
              {activeLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </SelectInput>

            <Input
              label="Date"
              type="date"
              value={date}
              min={today}
              onChange={(event) => setDate(event.target.value)}
            />

            <SelectInput
              label="Start time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            >
              {START_TIMES.map((time) => (
                <option key={time} value={time}>
                  {DateTime.fromFormat(time, "HH:mm").toFormat("hh:mm a")}
                </option>
              ))}
            </SelectInput>

            <SelectInput
              label="Duration"
              value={durationHours}
              onChange={(event) => setDurationHours(event.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 8].map((hours) => (
                <option key={hours} value={hours}>
                  {hours} {hours === 1 ? "hour" : "hours"}
                </option>
              ))}
            </SelectInput>
          </div>
        </Card>

        {/* Main content: sidebar filters + room results */}
        <div className="grid items-start gap-6 lg:grid-cols-[245px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-[84px]">
            <Card className="flex flex-col overflow-hidden lg:max-h-[calc(100vh-84px-24px)]">
              {/* Header: stays pinned at the top */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Icon
                    name="search"
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                    Filters
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Clear all
                </button>
              </div>

              {/* Scrollable filter list */}
              <div className="min-h-0 flex-1 divide-y divide-slate-200 overflow-y-auto overscroll-contain dark:divide-slate-800">
                <FilterSection title="Search rooms">
                  <Input
                    placeholder="Room name or number"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                  />
                </FilterSection>

                <FilterSection title="Capacity">
                  {CAPACITY_RANGES.map((range) => (
                    <CheckboxRow
                      key={range.value}
                      label={range.label}
                      checked={capacityRanges.includes(range.value)}
                      onChange={() =>
                        setCapacityRanges((current) =>
                          toggleValue(current, range.value),
                        )
                      }
                    />
                  ))}
                </FilterSection>

                <FilterSection title="Price per hour">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>$0</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Up to ${maxHourlyPrice}
                    </span>
                    <span>$100</span>
                  </div>
                  <input
                    aria-label="Maximum hourly price"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={maxHourlyPrice}
                    onChange={(event) =>
                      setMaxHourlyPrice(Number(event.target.value))
                    }
                    className="mt-3 w-full cursor-pointer accent-blue-600"
                  />
                </FilterSection>

                <FilterSection title="Amenities">
                  {amenitiesLoading ? (
                    <p className="text-xs text-slate-400">Loading amenities…</p>
                  ) : activeAmenities.length === 0 ? (
                    <p className="text-xs leading-5 text-slate-400">
                      {locationId
                        ? "No active amenities for this location."
                        : "No active amenities available."}
                    </p>
                  ) : (
                    activeAmenities.map((amenity) => (
                      <CheckboxRow
                        key={amenity.id}
                        label={amenity.name}
                        checked={amenityIds.includes(String(amenity.id))}
                        onChange={() =>
                          setAmenityIds((current) =>
                            toggleValue(current, String(amenity.id)),
                          )
                        }
                      />
                    ))
                  )}
                </FilterSection>

                <FilterSection title="Floor">
                  {FLOOR_OPTIONS.map((floor) => (
                    <CheckboxRow
                      key={floor.value}
                      label={floor.label}
                      checked={floors.includes(floor.value)}
                      onChange={() =>
                        setFloors((current) =>
                          toggleValue(current, floor.value),
                        )
                      }
                    />
                  ))}
                </FilterSection>
              </div>
            </Card>
          </aside>

          <section className="min-w-0 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-lg font-bold text-slate-950 dark:text-white">
                  {isLoading
                    ? "Finding rooms…"
                    : `${filteredRooms.length} rooms found`}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Available{" "}
                  {DateTime.fromISO(appliedDate).toFormat("dd MMM yyyy")} at{" "}
                  {DateTime.fromFormat(appliedStartTime, "HH:mm").toFormat(
                    "hh:mm a",
                  )}{" "}
                  for {appliedDurationHours}{" "}
                  {appliedDurationHours === 1 ? "hour" : "hours"}
                  {appliedLocationName
                    ? ` · ${appliedLocationName}`
                    : " · All locations"}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:justify-end">
                <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                  Sort by
                </span>
                <SelectInput
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="min-w-[165px]"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="capacity-high">Capacity: high to low</option>
                  <option value="name-asc">Name A–Z</option>
                </SelectInput>
              </div>
            </div>

            {isLoading && <PageLoading />}

            {hasError && (
              <Empty
                title="Unable to find available rooms"
                description="We couldn't load rooms or check availability. Please try again."
              />
            )}

            {!isLoading && !hasError && filteredRooms.length === 0 && (
              <Empty
                title="No available rooms found"
                description="Try another date or start time, increase the hourly price limit, or clear some filters."
              />
            )}

            {!isLoading && !hasError && filteredRooms.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    roomType={roomTypeMap.get(room.roomTypeId)}
                    effectiveDate={appliedDate}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      {children}
    </section>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 accent-blue-600 dark:border-slate-600"
      />
      <span>{label}</span>
    </label>
  );
}

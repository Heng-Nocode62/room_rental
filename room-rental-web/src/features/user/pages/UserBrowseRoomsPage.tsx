import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DateTime } from "luxon";

import { useLocations } from "../../locations/hooks/useLocations";
import { useAmenities } from "../../amenities/hooks/useAmenities";
import { useRooms } from "../../rooms/hooks/useRooms";

import {
  Card,
  Empty,
  Icon,
  Input,
  PageLoading,
  SelectInput,
  SectionTitle,
} from "../components/UserUI";

import { RoomCard } from "../components/RoomCard";

export default function UserBrowseRoomsPage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
   * =========================================================
   * FILTER STATE
   * =========================================================
   */

  const [keyword, setKeyword] = useState(
    searchParams.get("keyword") ?? "",
  );

  const [locationId, setLocationId] = useState(
    searchParams.get("locationId") ?? "",
  );

  const [minCapacity, setMinCapacity] =
    useState(
      searchParams.get("minCapacity") ?? "",
    );

  const [maxCapacity, setMaxCapacity] =
    useState(
      searchParams.get("maxCapacity") ?? "",
    );

  const [amenityId, setAmenityId] =
    useState(
      searchParams.get("amenityId") ?? "",
    );

  /*
   * Keep the room list user-facing.
   * Status is always ACTIVE.
   */

  const [sort, setSort] = useState(
    searchParams.get("sort") ??
      "roomNumber,asc",
  );

  /*
   * =========================================================
   * MASTER DATA
   * =========================================================
   */

  const {
    data: locations = [],
    isLoading: locationsLoading,
  } = useLocations();

  /*
   * Amenities are location-specific in your system.
   *
   * When a location is selected, only load active
   * amenities for that location.
   *
   * When no location is selected, load active amenities
   * generally so the filter is still usable.
   */

  const {
    data: amenitiesResponse,
    isLoading: amenitiesLoading,
  } = useAmenities({
    locationId: locationId
      ? Number(locationId)
      : undefined,

    status: "ACTIVE",

    page: 0,
    size: 100,

    sort: "id,asc",
  });

  const amenities =
    amenitiesResponse?.content ?? [];

  /*
   * =========================================================
   * ROOMS
   * =========================================================
   */

  const rooms = useRooms({
    keyword:
      keyword.trim() || undefined,

    locationId: locationId
      ? Number(locationId)
      : undefined,

    /*
     * Room type deliberately removed.
     * Users search for rooms, not your internal room type.
     */

    status: "ACTIVE",

    minCapacity:
      minCapacity === ""
        ? undefined
        : Number(minCapacity),

    maxCapacity:
      maxCapacity === ""
        ? undefined
        : Number(maxCapacity),

    amenityId:
      amenityId === ""
        ? undefined
        : Number(amenityId),

    page: 0,

    size: 100,

    sort,
  });

  /*
   * =========================================================
   * DATA
   * =========================================================
   */

  const activeLocations = useMemo(
    () =>
      locations.filter(
        (location) =>
          location.status === "ACTIVE",
      ),
    [locations],
  );

  const activeAmenities =
    useMemo(
      () =>
        amenities.filter(
          (amenity) =>
            amenity.status ===
            "ACTIVE",
        ),
      [amenities],
    );

  /*
   * =========================================================
   * FILTER ACTIONS
   * =========================================================
   */

  const applyFilters = () => {
    const params =
      new URLSearchParams();

    if (keyword.trim()) {
      params.set(
        "keyword",
        keyword.trim(),
      );
    }

    if (locationId) {
      params.set(
        "locationId",
        locationId,
      );
    }

    if (minCapacity) {
      params.set(
        "minCapacity",
        minCapacity,
      );
    }

    if (maxCapacity) {
      params.set(
        "maxCapacity",
        maxCapacity,
      );
    }

    if (amenityId) {
      params.set(
        "amenityId",
        amenityId,
      );
    }

    if (sort) {
      params.set(
        "sort",
        sort,
      );
    }

    setSearchParams(params);
  };

  const clearFilters = () => {
    setKeyword("");
    setLocationId("");
    setMinCapacity("");
    setMaxCapacity("");
    setAmenityId("");
    setSort("roomNumber,asc");

    setSearchParams({});
  };

  /*
   * =========================================================
   * LOCATION CHANGE
   * =========================================================
   *
   * An amenity belongs to a location in your current model,
   * so changing location should clear the selected amenity.
   */

  const handleLocationChange = (
    value: string,
  ) => {
    setLocationId(value);

    setAmenityId("");
  };

  /*
   * =========================================================
   * VALIDATION
   * =========================================================
   */

  const capacityError =
    minCapacity !== "" &&
    maxCapacity !== "" &&
    Number(minCapacity) >
      Number(maxCapacity);

  return (
    <div className="mx-auto max-w-[1440px] space-y-8 px-4 py-8 lg:px-8">
      {/* =====================================================
          HEADER
         ===================================================== */}

      <SectionTitle
        eyebrow="Discover"
        title="Browse rooms"
        description="Find a room that fits your needs and reserve it when you're ready."
      />

      {/* =====================================================
          FILTER PANEL
         ===================================================== */}

      <Card className="overflow-visible p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-950 dark:text-white">
              Find your room
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Search by location, capacity and amenities.
            </p>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400"
          >
            Clear all
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Keyword */}

          <Input
            label="Search"
            placeholder="Room name or number..."
            value={keyword}
            onChange={(event) =>
              setKeyword(
                event.target.value,
              )
            }
          />

          {/* Location */}

          <SelectInput
            label="Location"
            value={locationId}
            disabled={locationsLoading}
            onChange={(event) =>
              handleLocationChange(
                event.target.value,
              )
            }
          >
            <option value="">
              All locations
            </option>

            {activeLocations.map(
              (location) => (
                <option
                  key={location.id}
                  value={location.id}
                >
                  {location.name}
                </option>
              ),
            )}
          </SelectInput>

          {/* Minimum capacity */}

          <Input
            label="Minimum capacity"
            type="number"
            min={1}
            placeholder="e.g. 4"
            value={minCapacity}
            onChange={(event) =>
              setMinCapacity(
                event.target.value,
              )
            }
          />

          {/* Maximum capacity */}

          <Input
            label="Maximum capacity"
            type="number"
            min={1}
            placeholder="e.g. 20"
            value={maxCapacity}
            onChange={(event) =>
              setMaxCapacity(
                event.target.value,
              )
            }
          />

          {/* Amenity */}

          <SelectInput
            label="Amenity"
            value={amenityId}
            disabled={
              amenitiesLoading
            }
            onChange={(event) =>
              setAmenityId(
                event.target.value,
              )
            }
          >
            <option value="">
              All amenities
            </option>

            {activeAmenities.map(
              (amenity) => (
                <option
                  key={amenity.id}
                  value={amenity.id}
                >
                  {amenity.name}
                </option>
              ),
            )}
          </SelectInput>

          {/* Sort */}

          <SelectInput
            label="Sort by"
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value,
              )
            }
          >
            <option value="roomNumber,asc">
              Room number
            </option>

            <option value="name,asc">
              Name A–Z
            </option>

            <option value="capacity,asc">
              Capacity: low to high
            </option>

            <option value="capacity,desc">
              Capacity: high to low
            </option>
          </SelectInput>

          {/* Search */}

          <div className="flex items-end xl:col-span-2">
            <button
              type="button"
              onClick={applyFilters}
              disabled={capacityError}
              className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon
                name="search"
                size={17}
              />

              Search rooms
            </button>
          </div>
        </div>

        {capacityError && (
          <p className="mt-3 text-xs font-medium text-rose-600 dark:text-rose-400">
            Minimum capacity cannot be greater than maximum capacity.
          </p>
        )}

        {/* Active filters */}

        {(keyword.trim() ||
          locationId ||
          minCapacity ||
          maxCapacity ||
          amenityId) && (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <span className="mr-1 text-xs font-semibold text-slate-400">
              Filters:
            </span>

            {keyword.trim() && (
              <FilterChip
                label={`"${keyword.trim()}"`}
              />
            )}

            {locationId && (
              <FilterChip
                label={
                  activeLocations.find(
                    (location) =>
                      String(
                        location.id,
                      ) === locationId,
                  )?.name ??
                  `Location #${locationId}`
                }
              />
            )}

            {minCapacity && (
              <FilterChip
                label={`Min ${minCapacity} people`}
              />
            )}

            {maxCapacity && (
              <FilterChip
                label={`Max ${maxCapacity} people`}
              />
            )}

            {amenityId && (
              <FilterChip
                label={
                  activeAmenities.find(
                    (amenity) =>
                      String(
                        amenity.id,
                      ) === amenityId,
                  )?.name ??
                  `Amenity #${amenityId}`
                }
              />
            )}
          </div>
        )}
      </Card>

      {/* =====================================================
          RESULT HEADER
         ===================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xl font-bold text-slate-950 dark:text-white">
            {rooms.data?.totalElements ??
              0}{" "}
            rooms found
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Showing active rooms matching your search.
          </p>
        </div>

        {searchParams.get(
          "date",
        ) && (
          <p className="text-xs text-slate-400">
            Selected date:{" "}
            {DateTime.fromISO(
              searchParams.get(
                "date",
              )!,
            ).toFormat(
              "dd MMM yyyy",
            )}
          </p>
        )}
      </div>

      {/* =====================================================
          LOADING
         ===================================================== */}

      {rooms.isLoading && (
        <PageLoading />
      )}

      {/* =====================================================
          ERROR
         ===================================================== */}

      {rooms.isError && (
        <Empty
          title="Unable to load rooms"
          description="Something went wrong while loading rooms. Please try again."
        />
      )}

      {/* =====================================================
          EMPTY
         ===================================================== */}

      {!rooms.isLoading &&
        !rooms.isError &&
        rooms.data?.empty && (
          <Empty
            title="No rooms found"
            description="Try changing your location, capacity or amenity filters."
          />
        )}

      {/* =====================================================
          ROOM GRID
         ===================================================== */}

      {!rooms.isLoading &&
        !rooms.isError &&
        rooms.data &&
        !rooms.data.empty && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {rooms.data.content.map(
              (room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                />
              ),
            )}
          </div>
        )}
    </div>
  );
}

function FilterChip({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
      {label}
    </span>
  );
}
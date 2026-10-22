import { useEffect, useState } from "react";
import { DoorOpen, Plus } from "../../../components/ui/MaterialIcon.tsx";
import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
  Select,
} from "../../../components/ui";
import { useLocationScope } from "../../location-scope/LocationScopeProvider";
import { useLocationAmenities } from "../../rooms/hooks/useLocationAmenities";
import { useRooms } from "../../rooms/hooks/useRooms";
import { useRoom } from "../../rooms/hooks/useRoom";
import { useCreateRoom } from "../../rooms/hooks/useCreateRoom";
import { useUpdateRoom } from "../../rooms/hooks/useUpdateRoom";
import { useUpdateRoomImage } from "../../rooms/hooks/useUpdateRoomImage";
import { useDeactivateRoom } from "../../rooms/hooks/useDeactivateRoom";
import { useDebouncedValue } from "../../rooms/hooks/useDebouncedValue";

import { RoomFilters } from "../../rooms/components/RoomFilters";
import { RoomTable } from "../../rooms/components/RoomTable";
import { RoomStatusBadge } from "../../rooms/components/RoomStatusBadge";
import { RoomAmenityManager } from "../../rooms/components/RoomAmenityManager";
import { OwnerRoomForm } from "../components/rooms/OwnerRoomForm";

import type {
  RoomResponse,
  RoomSearchParams,
  RoomStatus,
} from "../../rooms/types/room";
import { useRoomTypesByLocation } from "../../room-types/hooks/useRoomTypesByLocation.ts";
import { getErrorMessage } from "../../rooms/utils/roomUtils";
import type { RoomFormValues } from "../../rooms/components/RoomForm";

const DEFAULT_SIZE = 20;
const DEFAULT_SORT = "roomNumber,asc";

const PAGE_SIZES = [10, 20, 50, 100];

const SORT_OPTIONS = [
  { value: "roomNumber,asc", label: "Room number (A–Z)" },
  { value: "roomNumber,desc", label: "Room number (Z–A)" },
];

export default function OwnerRoomsPage() {
  const scope = useLocationScope();
  const locationId = scope.currentLocationId;

  const [keyword, setKeyword] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [status, setStatus] = useState<RoomStatus | "">("ACTIVE");
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [amenityId, setAmenityId] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [sort, setSort] = useState(DEFAULT_SORT);

  const [dialog, setDialog] = useState<
    "create" | "edit" | "view" | "amenities" | null
  >(null);
  const [selected, setSelected] = useState<RoomResponse | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const debouncedKeyword = useDebouncedValue(keyword, 350);

  const roomTypes = useRoomTypesByLocation(locationId);

  const { data: filterAmenities = [], isLoading: amenitiesLoading } =
    useLocationAmenities(Number(locationId), Boolean(locationId));

  const create = useCreateRoom();
  const update = useUpdateRoom();
  const updateImage = useUpdateRoomImage();
  const deactivate = useDeactivateRoom();

  // Reset filters tied to the previous location.
  useEffect(() => {
    setKeyword("");
    setRoomTypeId("");
    setStatus("ACTIVE");
    setMinCapacity("");
    setMaxCapacity("");
    setAmenityId("");
    setPage(0);
    setSelected(null);
    setDialog(null);
  }, [locationId]);

  const roomParams: RoomSearchParams = {
    keyword: debouncedKeyword.trim() || undefined,
    locationId: locationId ?? undefined,
    roomTypeId: roomTypeId ? Number(roomTypeId) : undefined,
    status: status || undefined,
    minCapacity: minCapacity ? Number(minCapacity) : undefined,
    maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
    amenityId: amenityId ? Number(amenityId) : undefined,
    page,
    size,
    sort,
  };

  const rooms = useRooms(roomParams, Boolean(locationId));

  // Fetched by id, so the amenities modal is independent of the list's
  // filters and paging and never shows a stale snapshot.
  const { data: amenitiesRoom } = useRoom(
    //change later
    dialog === "amenities" ? (selected!.id ) : 0,
  );

  // If the current page becomes empty (e.g. the last row on it was
  // deactivated under the Active filter), step back one page.
  useEffect(() => {
    if (rooms.data && rooms.data.empty && page > 0) {
      setPage((current) => Math.max(0, current - 1));
    }
  }, [rooms.data, page]);

  const resetPage = () => setPage(0);

  const changePage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setKeyword("");
    setRoomTypeId("");
    setStatus("ACTIVE");
    setMinCapacity("");
    setMaxCapacity("");
    setAmenityId("");
    resetPage();
  };

  const close = () => {
    setDialog(null);
    setSelected(null);
    setFormError(null);
  };

  const submit = async (values: RoomFormValues) => {
    setFormError(null);

    try {
      if (dialog === "edit" && selected) {
        await update.mutateAsync({
          id: selected.id,
          request: {
            name: values.name.trim(),
            floor: values.floor.trim() || undefined,
            description: values.description.trim() || undefined,
            hourlyPrice: Number(values.hourlyPrice ?? 0),
            dailyPrice: Number(values.dailyPrice ?? 0),
          },
        });

        if (values.image) {
          try {
            await updateImage.mutateAsync({
              id: selected.id,
              image: values.image,
            });
          } catch (imageError) {
            setFormError(
              getErrorMessage(
                imageError,
                "Room details were saved, but the image upload failed. Please try again.",
              ),
            );
            return;
          }
        }
      } else if (locationId) {
        const created = await create.mutateAsync({
          locationId,
          roomTypeId: Number(values.roomTypeId),
          roomNumber: values.roomNumber.trim(),
          name: values.name.trim(),
          floor: values.floor.trim() || undefined,
          description: values.description.trim() || undefined,
          hourlyPrice: Number(values.hourlyPrice ?? 0),
          dailyPrice: Number(values.dailyPrice ?? 0),
          amenities: (values.amenities ?? []).map((item) => ({
            amenityId: Number(item.amenityId),
            amount: Number(item.amount),
          })),
        });

        if (values.image) {
          try {
            await updateImage.mutateAsync({
              id: created.id,
              image: values.image,
            });
          } catch (imageError) {
            setSelected(created);
            setDialog("edit");
            setFormError(
              getErrorMessage(
                imageError,
                "The room was created, but its image could not be uploaded. Choose the image again and save changes.",
              ),
            );
            return;
          }
        }
      }

      close();
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          "Unable to save the room. Please check the values and try again.",
        ),
      );
    }
  };

  if (scope.isLoading || roomTypes.isLoading) {
    return <LoadingState />;
  }

  if (!locationId || !scope.currentLocation) {
    return (
      <EmptyState
        title="No location available"
        description="This account is not assigned to a location."
      />
    );
  }

  const items = rooms.data?.content ?? [];
  const totalElements = rooms.data?.totalElements;
  const firstItem =
    rooms.data && !rooms.data.empty
      ? rooms.data.page * rooms.data.size + 1
      : 0;
  const lastItem = rooms.data ? firstItem + items.length - 1 : 0;

  // Full-page spinner only on the very first load. On page/size/sort changes
  // the previous results stay visible (needs keepPreviousData in useRooms).
  const initialLoading = rooms.isLoading && !rooms.data;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <PageHeader
        icon={<DoorOpen size={19} />}
        title="Rooms"
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={() => setDialog("create")}
          >
            Add room
          </Button>
        }
      />

      <Card>
        <RoomFilters
          keyword={keyword}
          locationId={String(locationId)}
          roomTypeId={roomTypeId}
          status={status}
          minCapacity={minCapacity}
          maxCapacity={maxCapacity}
          amenityId={amenityId}
          locations={[scope.currentLocation]}
          roomTypes={roomTypes.data ?? []}
          amenities={filterAmenities}
          amenitiesDisabled={amenitiesLoading}
          showLocationFilter={false}
          onClearFilters={clearFilters}
          onKeywordChange={(value) => {
            setKeyword(value);
            resetPage();
          }}
          onLocationChange={() => {
            // Location is fixed by the owner location scope.
          }}
          onRoomTypeChange={(value) => {
            setRoomTypeId(value);
            resetPage();
          }}
          onStatusChange={(value) => {
            setStatus(value);
            resetPage();
          }}
          onMinCapacityChange={(value) => {
            setMinCapacity(value);
            resetPage();
          }}
          onMaxCapacityChange={(value) => {
            setMaxCapacity(value);
            resetPage();
          }}
          onAmenityChange={(value) => {
            setAmenityId(value);
            resetPage();
          }}
        />
      </Card>

      {initialLoading && <LoadingState />}

      {rooms.isError && (
        <EmptyState
          title="Unable to load rooms"
          description="Something went wrong while loading rooms."
          action={
            <Button variant="secondary" onClick={() => void rooms.refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {!initialLoading && !rooms.isError && rooms.data?.empty && page === 0 && (
        <EmptyState
          title="No rooms found"
          description="No rooms match the current filters."
          action={
            <Button variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      )}

      {!initialLoading &&
        !rooms.isError &&
        rooms.data &&
        !rooms.data.empty && (
          <div
            className={[
              "space-y-4 transition-opacity",
              rooms.isFetching ? "opacity-60" : "opacity-100",
            ].join(" ")}
            aria-busy={rooms.isFetching}
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-800">
                  {firstItem}–{lastItem}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-800">
                  {totalElements}
                </span>
              </p>

              <div className="flex flex-wrap items-end gap-3">
                <div className="w-48">
                  <Select
                    label="Sort by"
                    value={sort}
                    onChange={(event) => {
                      setSort(event.target.value);
                      resetPage();
                    }}
                    options={SORT_OPTIONS}
                  />
                </div>

                <div className="w-32">
                  <Select
                    label="Per page"
                    value={String(size)}
                    onChange={(event) => {
                      setSize(Number(event.target.value));
                      resetPage();
                    }}
                    options={PAGE_SIZES.map((n) => ({
                      value: String(n),
                      label: String(n),
                    }))}
                  />
                </div>
              </div>
            </div>

            <Card className="overflow-hidden p-0">
              <RoomTable
                rooms={items}
                onView={(item) => {
                  setSelected(item);
                  setDialog("view");
                }}
                onEdit={(item) => {
                  setSelected(item);
                  setDialog("edit");
                }}
                onAmenities={(item) => {
                  setSelected(item);
                  setDialog("amenities");
                }}
                onToggle={(item) => {
                  if (item.status === "ACTIVE") {
                    void deactivate.mutateAsync(item.id);
                  }
                }}
              />
            </Card>

            <Pagination pagination={rooms.data} onPageChange={changePage} />
          </div>
        )}

      <Modal
        open={dialog === "create" || dialog === "edit"}
        onClose={close}
        title={dialog === "edit" ? "Edit room" : "Add room"}
        description="Room details stay in one focused dialog."
        size="lg"
      >
        <OwnerRoomForm
          key={`${dialog}-${selected?.id ?? "new"}`}
          locations={[scope.currentLocation]}
          roomTypes={roomTypes.data ?? []}
          mode={dialog === "edit" ? "edit" : "create"}
          initialValues={
            selected
              ? {
                  locationId: String(selected.locationId),
                  roomTypeId: String(selected.roomTypeId),
                  roomNumber: selected.roomNumber,
                  name: selected.name,
                  floor: selected.floor ?? "",
                  description: selected.description ?? "",
                  imageUrl: selected.imageUrl,
                  hourlyPrice:
                    selected.prices.find(
                      (price) => price.pricingUnitCode === "HOURLY",
                    )?.price ?? 0,

                  dailyPrice:
                    selected.prices.find(
                      (price) => price.pricingUnitCode === "DAILY",
                    )?.price ?? 0,
                  amenities: selected.amenities.map((amenity) => ({
                    amenityId: String(amenity.amenityId),
                    amount: amenity.amount,
                  })),
                }
              : undefined
          }
          onSubmit={submit}
          loading={create.isPending || update.isPending || updateImage.isPending}
          error={formError}
          fixedLocationId={locationId}
        />
      </Modal>

      <Modal
        open={dialog === "view"}
        onClose={close}
        title={
          selected
            ? `${selected.roomNumber} · ${selected.name}`
            : "Room details"
        }
        size="lg"
      >
        {selected && (
          <div className="space-y-6">
            {selected.imageUrl && (
              <img
                src={selected.imageUrl}
                alt={selected.name}
                className="max-h-72 w-full rounded-xl object-cover"
              />
            )}
            <div className="flex items-center justify-between">
              <RoomStatusBadge status={selected.status} />
              <span className="text-sm text-slate-500">
                Capacity {selected.capacity}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Location" value={selected.locationName} />
              <Info label="Room type" value={selected.roomTypeName} />
              <Info label="Room number" value={selected.roomNumber} />
              <Info label="Floor" value={selected.floor || "—"} />
              <Info
                label="Hourly price"
                value={String(
                  selected.prices.find(
                    (price) => price.pricingUnitCode === "HOURLY",
                  )?.price ?? 0,
                )}
              />

              <Info
                label="Daily price"
                value={String(
                  selected.prices.find(
                    (price) => price.pricingUnitCode === "DAILY",
                  )?.price ?? 0,
                )}
              />
            </div>

            <div>
              <p className="text-xs text-slate-500">Amenities</p>

              {selected.amenities.length > 0 ? (
                <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                  {selected.amenities.map((amenity) => (
                    <div
                      key={amenity.amenityId}
                      className="flex items-center justify-between gap-4 border-b border-slate-100 px-3 py-3 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {amenity.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {amenity.amount} × {amenity.price.toFixed(2)}
                        </p>
                      </div>

                      <span className="text-sm font-semibold text-slate-900">
                        {(amenity.amount * amenity.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-slate-500">
                  No amenities assigned.
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-500">Description</p>
              <p className="mt-1 text-sm text-slate-700">
                {selected.description || "No description."}
              </p>
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={close}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={dialog === "amenities"}
        onClose={close}
        title="Manage amenities"
        description={
          selected ? `${selected.roomNumber} · ${selected.locationName}` : ""
        }
        size="lg"
      >
        {amenitiesRoom ? (
          <RoomAmenityManager
            roomId={amenitiesRoom.id}
            locationId={locationId}
            currentAmenities={amenitiesRoom.amenities}
          />
        ) : (
          <LoadingState />
        )}
      </Modal>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
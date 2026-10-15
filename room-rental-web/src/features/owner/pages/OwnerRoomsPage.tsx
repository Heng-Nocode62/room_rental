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
} from "../../../components/ui";
import { useLocationScope } from "../../location-scope/LocationScopeProvider";
import { useLocationAmenities } from "../../rooms/hooks/useLocationAmenities";
import { useRooms } from "../../rooms/hooks/useRooms";
import { useCreateRoom } from "../../rooms/hooks/useCreateRoom";
import { useUpdateRoom } from "../../rooms/hooks/useUpdateRoom";
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

  const [dialog, setDialog] = useState<
    "create" | "edit" | "view" | "amenities" | null
  >(null);
  const [selected, setSelected] = useState<RoomResponse | null>(null);

  const debouncedKeyword = useDebouncedValue(keyword, 350);

  const roomTypes = useRoomTypesByLocation(locationId);

  const { data: filterAmenities = [], isLoading: amenitiesLoading } =
    useLocationAmenities(Number(locationId), Boolean(locationId));

  const create = useCreateRoom();
  const update = useUpdateRoom();
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
    size: 20,
    sort: "roomNumber,asc",
  };

  const rooms = useRooms(roomParams, Boolean(locationId));

  const liveAmenitiesRoom =
    (selected && rooms.data?.content.find((room) => room.id === selected.id)) ||
    selected;

  const resetPage = () => setPage(0);

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
  };

  const submit = async (values: any) => {
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
    } else if (locationId) {
      await create.mutateAsync({
        locationId,
        roomTypeId: Number(values.roomTypeId),
        roomNumber: values.roomNumber.trim(),
        name: values.name.trim(),
        floor: values.floor.trim() || undefined,
        description: values.description.trim() || undefined,
        hourlyPrice: Number(values.hourlyPrice ?? 0),
        dailyPrice: Number(values.dailyPrice ?? 0),
        amenities: (values.amenities ?? []).map((item: any) => ({
          amenityId: Number(item.amenityId),
          amount: Number(item.amount),
        })),
      });
    }

    close();
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

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <PageHeader
        icon={<DoorOpen size={19} />}
        title="Rooms"
        description={`Manage rooms for ${scope.currentLocation.name}.`}
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

      {rooms.isLoading && <LoadingState />}

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

      {!rooms.isLoading && !rooms.isError && rooms.data?.empty && (
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

      {!rooms.isLoading &&
        !rooms.isError &&
        rooms.data &&
        !rooms.data.empty && (
          <>
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

            <Pagination pagination={rooms.data} onPageChange={setPage} />
          </>
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
          loading={create.isPending || update.isPending}
          fixedLocationId={locationId}
        />

        {(create.isError || update.isError) && (
          <p className="mt-3 text-sm text-rose-600">
            Unable to save the room. Please check the values and try again.
          </p>
        )}
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
        {liveAmenitiesRoom && (
          <RoomAmenityManager
            roomId={liveAmenitiesRoom.id}
            locationId={locationId}
            currentAmenities={liveAmenitiesRoom.amenities}
          />
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

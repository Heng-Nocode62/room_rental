import { useState } from "react";
import { DoorOpen, Plus } from "../../../components/ui/MaterialIcon.tsx";

import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
} from "../../../components/ui/index.ts";

import { useLocations } from "../../locations/hooks/useLocations.ts";
import { useRoomTypes } from "../../room-types/hooks/useRoomTypes.ts";

import { useLocationAmenities } from "../../rooms/hooks/useLocationAmenities.ts";
import { useRooms } from "../../rooms/hooks/useRooms.ts";
import { useCreateRoom } from "../../rooms/hooks/useCreateRoom.ts";
import { useUpdateRoom } from "../../rooms/hooks/useUpdateRoom.ts";
import { useDeactivateRoom } from "../../rooms/hooks/useDeactivateRoom.ts";
import { useDebouncedValue } from "../../rooms/hooks/useDebouncedValue.ts";

import { RoomFilters } from "../../rooms/components/RoomFilters";
import { RoomTable } from "../../rooms/components/RoomTable";
import {
  AdminRoomForm,
  type AdminRoomFormValues,
} from "../components/rooms/AdminRoomForm.tsx";
import { RoomStatusBadge } from "../../rooms/components/RoomStatusBadge";
import { RoomAmenityManager } from "../../rooms/components/RoomAmenityManager";

import type {
  CreateRoomRequest,
  RoomResponse,
  RoomSearchParams,
  RoomStatus,
  UpdateRoomPriceRequest,
} from "../../rooms/types/room.ts";

export default function RoomsPage() {
  const [keyword, setKeyword] = useState("");
  const [locationId, setLocationId] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [status, setStatus] = useState<RoomStatus | "">("ACTIVE");
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [amenityId, setAmenityId] = useState("");
  const [page, setPage] = useState(0);

  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<RoomResponse | null>(null);
  const [view, setView] = useState<RoomResponse | null>(null);
  const [amenitiesView, setAmenitiesView] =
    useState<RoomResponse | null>(null);

  const debouncedKeyword = useDebouncedValue(keyword, 350);

  const {
    data: locations,
    isLoading: locationsLoading,
  } = useLocations();

  const {
    data: roomTypes,
    isLoading: roomTypesLoading,
  } = useRoomTypes();

  const {
    data: filterAmenities = [],
    isLoading: filterAmenitiesLoading,
  } = useLocationAmenities(
    Number(locationId),
    Boolean(locationId),
  );

  const create = useCreateRoom();
  const update = useUpdateRoom();
  const deactivate = useDeactivateRoom();

  const roomParams: RoomSearchParams = {
    keyword: debouncedKeyword.trim() || undefined,
    locationId: locationId ? Number(locationId) : undefined,
    roomTypeId: roomTypeId ? Number(roomTypeId) : undefined,
    status: status || undefined,
    minCapacity: minCapacity ? Number(minCapacity) : undefined,
    maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
    amenityId: amenityId ? Number(amenityId) : undefined,
    page,
    size: 20,
    sort: "roomNumber,asc",
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useRooms(roomParams);

  const liveAmenitiesRoom =
    (amenitiesView &&
      data?.content.find((room) => room.id === amenitiesView.id)) ||
    amenitiesView;

  const resetPage = () => setPage(0);

  const clearFilters = () => {
    setKeyword("");
    setLocationId("");
    setRoomTypeId("");
    setStatus("ACTIVE");
    setMinCapacity("");
    setMaxCapacity("");
    setAmenityId("");
    resetPage();
  };

  const closeForm = () => {
    setMode(null);
    setSelected(null);
  };

  const submit = async (values: AdminRoomFormValues) => {
    if (mode === "edit" && selected) {
      await update.mutateAsync({
        id: selected.id,
        request: {
          name: values.name.trim(),
          floor: values.floor.trim() || undefined,
          description: values.description.trim() || undefined,
          dailyPrice: values.dailyPrice,
          hourlyPrice: values.hourlyPrice
        },
      });

      closeForm();
      return;
    }

    const request: CreateRoomRequest = {
      locationId: Number(values.locationId),
      roomTypeId: Number(values.roomTypeId),
      roomNumber: values.roomNumber.trim(),
      name: values.name.trim(),
      floor: values.floor.trim() || undefined,
      hourlyPrice: values.hourlyPrice,
      dailyPrice: values.dailyPrice,
      description: values.description.trim() || undefined,
      amenities: values.amenities.length
        ? values.amenities.map((amenity) => ({
            amenityId: Number(amenity.amenityId),
            amount: Number(amenity.amount),
          }))
        : undefined,
    };

    await create.mutateAsync(request);
    closeForm();
  };

  const loadingLookups = locationsLoading || roomTypesLoading;

  if (loadingLookups) {
    return <LoadingState />;
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <PageHeader
        icon={<DoorOpen size={19} />}
        title="Rooms"
        actions={
          <Button
            leftIcon={<Plus size={17} />}
            onClick={() => setMode("create")}
          >
            Add room
          </Button>
        }
      />

      <Card>
        <RoomFilters
          keyword={keyword}
          locationId={locationId}
          roomTypeId={roomTypeId}
          status={status}
          minCapacity={minCapacity}
          maxCapacity={maxCapacity}
          amenityId={amenityId}
          locations={locations ?? []}
          roomTypes={roomTypes ?? []}
          amenities={filterAmenities}
          amenitiesDisabled={!locationId || filterAmenitiesLoading}
          onKeywordChange={(value) => {
            setKeyword(value);
            resetPage();
          }}
          onLocationChange={(value) => {
            setLocationId(value);
            setAmenityId("");
            resetPage();
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

      {isLoading && <LoadingState />}

      {isError && (
        <EmptyState
          title="Unable to load rooms"
          description="Something went wrong while loading rooms."
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {!isLoading && !isError && data?.empty && (
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

      {!isLoading && !isError && data && !data.empty && (
        <>
          <Card className="overflow-hidden p-0">
            <RoomTable
              rooms={data.content}
              onView={setView}
              onEdit={(item) => {
                setSelected(item);
                setMode("edit");
              }}
              onAmenities={setAmenitiesView}
              onToggle={(item) => {
                if (item.status === "ACTIVE") {
                  void deactivate.mutateAsync(item.id);
                }
              }}
            />
          </Card>

          <Pagination
            pagination={data}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Create / Edit dialog */}
      <Modal
        open={mode !== null}
        onClose={closeForm}
        title={mode === "edit" ? "Edit room" : "Add room"}
        description="Room details stay in one focused dialog. Amenities can be added during creation."
        size="lg"
      >
        <AdminRoomForm
          key={`${mode}-${selected?.id ?? "new"}`}
          mode={mode === "edit" ? "edit" : "create"}
          initialValues={
            selected
              ? {
                  locationId: String(selected.locationId),
                  roomTypeId: String(selected.roomTypeId),
                  roomNumber: selected.roomNumber,
                  name: selected.name,
                  floor: selected.floor || "",
                  hourlyPrice: selected.prices.find(p=>p.pricingUnitCode==="HOURLY")?.price,
                  dailyPrice: selected.prices.find(p=>p.pricingUnitCode==="DAILY")?.price,
                  description: selected.description || "",
                  amenities: selected.amenities.map((amenity) => ({
                    amenityId: String(amenity.amenityId),
                    amount: amenity.amount,
                  })),
                }
              : undefined
          }
          locations={locations ?? []}
          roomTypes={roomTypes ?? []}
          onSubmit={submit}
          loading={create.isPending || update.isPending}
        />

        {(create.isError || update.isError) && (
          <p className="mt-3 text-sm text-rose-600">
            Unable to save the room. Please check the values and try again.
          </p>
        )}
      </Modal>

      {/* Room details dialog */}
      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title={view ? `${view.roomNumber} · ${view.name}` : ""}
        description={view ? `${view.locationName} · ${view.roomTypeName}` : ""}
        size="lg"
      >
        {view && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <RoomStatusBadge status={view.status} />
              <span className="text-sm text-slate-500">
                Capacity {view.capacity}
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Detail label="Location" value={view.locationName} />
              <Detail label="Room type" value={view.roomTypeName} />
              <Detail label="Room number" value={view.roomNumber} />
              <Detail label="Floor" value={view.floor || "—"} />
              <Detail label="Capacity" value={`${view.capacity} people`} />
            </div>

            <div>
              <p className="text-xs text-slate-500">Amenities</p>

              {view.amenities.length ? (
                <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                  {view.amenities.map((amenity) => (
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
                {view.description || "No description."}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Amenity management dialog */}
      <Modal
        open={!!amenitiesView}
        onClose={() => setAmenitiesView(null)}
        title="Manage amenities"
        description={
          amenitiesView
            ? `${amenitiesView.roomNumber} · ${amenitiesView.locationName}`
            : ""
        }
        size="lg"
      >
        {liveAmenitiesRoom && (
          <RoomAmenityManager
            roomId={liveAmenitiesRoom.id}
            locationId={liveAmenitiesRoom.locationId}
            currentAmenities={liveAmenitiesRoom.amenities}
          />
        )}
      </Modal>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

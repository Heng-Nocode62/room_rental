import { useEffect, useState } from "react";
import { DoorOpen, Plus, Power } from "../../../components/ui/MaterialIcon.tsx";

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
  RoomForm,
  type RoomFormValues,
} from "../../rooms/components/RoomForm";
import { RoomDetailDialog } from "../../rooms/components/RoomDetailDialog";
import { RoomAmenityManager } from "../../rooms/components/RoomAmenityManager";
import { getErrorMessage } from "../../rooms/utils/roomUtils";

import type {
  CreateRoomRequest,
  RoomResponse,
  RoomSearchParams,
  RoomStatus,
} from "../../rooms/types/room.ts";

type Notice = { type: "success" | "error"; message: string } | null;

const DEFAULT_STATUS: RoomStatus = "ACTIVE";

export default function AdminRoomsPage() {
  const [keyword, setKeyword] = useState("");
  const [locationId, setLocationId] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [status, setStatus] = useState<RoomStatus | "">(DEFAULT_STATUS);
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [amenityId, setAmenityId] = useState("");
  const [page, setPage] = useState(0);

  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<RoomResponse | null>(null);
  const [view, setView] = useState<RoomResponse | null>(null);
  const [amenitiesView, setAmenitiesView] = useState<RoomResponse | null>(null);
  const [toDeactivate, setToDeactivate] = useState<RoomResponse | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const debouncedKeyword = useDebouncedValue(keyword, 350);

  const { data: locations, isLoading: locationsLoading } = useLocations();
  const { data: roomTypes, isLoading: roomTypesLoading } = useRoomTypes();

  const { data: filterAmenities = [], isLoading: filterAmenitiesLoading } =
    useLocationAmenities(Number(locationId), Boolean(locationId));

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

  const { data, isLoading, isFetching, isError, refetch } =
    useRooms(roomParams);

  const liveAmenitiesRoom =
    (amenitiesView &&
      data?.content.find((room) => room.id === amenitiesView.id)) ||
    amenitiesView;

  // Auto-dismiss success notices.
  useEffect(() => {
    if (!notice || notice.type !== "success") return;

    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const resetPage = () => setPage(0);

  const clearFilters = () => {
    setKeyword("");
    setLocationId("");
    setRoomTypeId("");
    setStatus(DEFAULT_STATUS);
    setMinCapacity("");
    setMaxCapacity("");
    setAmenityId("");
    resetPage();
  };

  const openCreate = () => {
    setSelected(null);
    setFormError(null);
    setMode("create");
  };

  const openEdit = (room: RoomResponse) => {
    setSelected(room);
    setFormError(null);
    setMode("edit");
  };

  const closeForm = () => {
    setMode(null);
    setSelected(null);
    setFormError(null);
  };

  const submit = async (values: RoomFormValues) => {
    setFormError(null);

    try {
      if (mode === "edit" && selected) {
        await update.mutateAsync({
          id: selected.id,
          request: {
            name: values.name.trim(),
            floor: values.floor.trim() || undefined,
            description: values.description.trim() || undefined,
            dailyPrice: values.dailyPrice,
            hourlyPrice: values.hourlyPrice,
          },
        });

        setNotice({
          type: "success",
          message: `Room ${selected.roomNumber} updated.`,
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

      setNotice({
        type: "success",
        message: `Room ${values.roomNumber.trim()} created.`,
      });
      closeForm();
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          "Unable to save the room. Please check the values and try again.",
        ),
      );
    }
  };

  const confirmDeactivate = async () => {
    if (!toDeactivate) return;

    try {
      await deactivate.mutateAsync(toDeactivate.id);

      setNotice({
        type: "success",
        message: `Room ${toDeactivate.roomNumber} deactivated.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Unable to deactivate the room."),
      });
    } finally {
      setToDeactivate(null);
    }
  };

  const totalElements = data
    ? (data as { totalElements?: number }).totalElements
    : undefined;

  const loadingLookups = locationsLoading || roomTypesLoading;

  if (loadingLookups) {
    return <LoadingState />;
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <PageHeader
        icon={<DoorOpen size={19} />}
        title="Rooms"
        description="Manage rooms, pricing and the amenities assigned to them."
        actions={
          <Button leftIcon={<Plus size={17} />} onClick={openCreate}>
            Add room
          </Button>
        }
      />

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={[
            "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800",
          ].join(" ")}
        >
          <p>{notice.message}</p>

          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setNotice(null)}
            className="text-lg leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <Card>
        <RoomFilters
          keyword={keyword}
          locationId={locationId}
          roomTypeId={roomTypeId}
          status={status}
          defaultStatus={DEFAULT_STATUS}
          minCapacity={minCapacity}
          maxCapacity={maxCapacity}
          amenityId={amenityId}
          locations={locations ?? []}
          roomTypes={roomTypes ?? []}
          amenities={filterAmenities}
          amenitiesDisabled={!locationId || filterAmenitiesLoading}
          resultLabel={
            totalElements !== undefined
              ? `${totalElements} ${totalElements === 1 ? "room" : "rooms"}`
              : undefined
          }
          onClearFilters={clearFilters}
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
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>

              <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
                Add room
              </Button>
            </div>
          }
        />
      )}

      {!isLoading && !isError && data && !data.empty && (
        <div
          className={[
            "space-y-4 transition-opacity",
            isFetching ? "opacity-60" : "opacity-100",
          ].join(" ")}
          aria-busy={isFetching}
        >
          <Card className="overflow-hidden p-0">
            <RoomTable
              rooms={data.content}
              onView={setView}
              onEdit={openEdit}
              onAmenities={setAmenitiesView}
              onToggle={(item) => {
                if (item.status === "ACTIVE") setToDeactivate(item);
              }}
            />
          </Card>

          <Pagination pagination={data} onPageChange={setPage} />
        </div>
      )}

      {/* Create / Edit */}
      <Modal
        open={mode !== null}
        onClose={closeForm}
        title={mode === "edit" ? "Edit room" : "Add room"}
        description={
          mode === "edit"
            ? "Update the room's name, floor, description and prices."
            : "Choose a location and room type (or create a new type), then set details, prices and amenities."
        }
        size="lg"
      >
        <RoomForm
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
                  hourlyPrice: selected.prices.find(
                    (p) => p.pricingUnitCode === "HOURLY",
                  )?.price,
                  dailyPrice: selected.prices.find(
                    (p) => p.pricingUnitCode === "DAILY",
                  )?.price,
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
          onCancel={closeForm}
          error={formError}
          loading={create.isPending || update.isPending}
        />
      </Modal>

      {/* Details */}
      <RoomDetailDialog
        room={view}
        onClose={() => setView(null)}
        onEdit={(room) => {
          setView(null);
          openEdit(room);
        }}
        onAmenities={(room) => {
          setView(null);
          setAmenitiesView(room);
        }}
      />

      {/* Amenities */}
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

      {/* Deactivate confirmation */}
      <Modal
        open={!!toDeactivate}
        onClose={() => setToDeactivate(null)}
        title="Deactivate room"
      >
        {toDeactivate && (
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Power size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Deactivate {toDeactivate.roomNumber} · {toDeactivate.name}?
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  The room will no longer be available for new bookings.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                variant="secondary"
                onClick={() => setToDeactivate(null)}
                disabled={deactivate.isPending}
              >
                Cancel
              </Button>

              <Button
                onClick={() => void confirmDeactivate()}
                loading={deactivate.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                Deactivate
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
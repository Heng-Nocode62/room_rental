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
  Select,
} from "../../../components/ui/index.ts";

import { useLocations } from "../../locations/hooks/useLocations.ts";
import { useRoomTypes } from "../../room-types/hooks/useRoomTypes.ts";

import { useLocationAmenities } from "../../rooms/hooks/useLocationAmenities.ts";
import { useRooms } from "../../rooms/hooks/useRooms.ts";
import { useRoom } from "../../rooms/hooks/useRoom.ts";
import { useCreateRoom } from "../../rooms/hooks/useCreateRoom.ts";
import { useUpdateRoom } from "../../rooms/hooks/useUpdateRoom.ts";
import { useUpdateRoomImage } from "../../rooms/hooks/useUpdateRoomImage.ts";
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
const DEFAULT_SIZE = 20;
const DEFAULT_SORT = "roomNumber,asc";

const PAGE_SIZES = [10, 20, 50, 100];

const SORT_OPTIONS = [
  { value: "roomNumber,asc", label: "Room number (A–Z)" },
  { value: "roomNumber,desc", label: "Room number (Z–A)" },
];

export default function AdminRoomsPage() {
  const [keyword, setKeyword] = useState("");
  const [locationId, setLocationId] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [status, setStatus] = useState<RoomStatus | "">(DEFAULT_STATUS);
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [amenityId, setAmenityId] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [sort, setSort] = useState(DEFAULT_SORT);

  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<RoomResponse | null>(null);
  const [view, setView] = useState<RoomResponse | null>(null);
  const [amenitiesRoomId, setAmenitiesRoomId] = useState<number | null>(null);
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
  const updateImage = useUpdateRoomImage();
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
    size,
    sort,
  };

  const { data, isLoading, isFetching, isError, refetch } =
    useRooms(roomParams);

  // Fetched by id, so it is independent of the list's filters and paging.
  const { data: amenitiesRoom } = useRoom(amenitiesRoomId!);

  // Auto-dismiss success notices.
  useEffect(() => {
    if (!notice || notice.type !== "success") return;

    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // If the current page becomes empty (e.g. the last row on it was
  // deactivated under a status filter), step back one page.
  useEffect(() => {
    if (data && data.empty && page > 0) {
      setPage((current) => Math.max(0, current - 1));
    }
  }, [data, page]);

  const resetPage = () => setPage(0);

  const changePage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

      const created = await create.mutateAsync(request);

      if (values.image) {
        try {
          await updateImage.mutateAsync({
            id: created.id,
            image: values.image,
          });
        } catch (imageError) {
          // The room already exists. Open it in edit mode so retrying does not
          // create a duplicate room.
          setSelected(created);
          setMode("edit");
          setFormError(
            getErrorMessage(
              imageError,
              "The room was created, but its image could not be uploaded. Choose the image again and save changes.",
            ),
          );
          return;
        }
      }

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

  const totalElements = data?.totalElements;
  const firstItem = data && !data.empty ? data.page * data.size + 1 : 0;
  const lastItem = data ? firstItem + data.content.length - 1 : 0;

  // Full-page spinner only on the very first load. On page/size/sort changes
  // the previous results stay visible (needs keepPreviousData in useRooms).
  const initialLoading = isLoading && !data;

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

      {initialLoading && <LoadingState />}

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

      {!initialLoading && !isError && data?.empty && page === 0 && (
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

      {!initialLoading && !isError && data && !data.empty && (
        <div
          className={[
            "space-y-4 transition-opacity",
            isFetching ? "opacity-60" : "opacity-100",
          ].join(" ")}
          aria-busy={isFetching}
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
              rooms={data.content}
              onView={setView}
              onEdit={openEdit}
              onAmenities={(room) => setAmenitiesRoomId(room.id)}
              onToggle={(item) => {
                if (item.status === "ACTIVE") setToDeactivate(item);
              }}
            />
          </Card>

          <Pagination pagination={data} onPageChange={changePage} />
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
                  imageUrl: selected.imageUrl,
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
          loading={create.isPending || update.isPending || updateImage.isPending}
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
          setAmenitiesRoomId(room.id);
        }}
      />

      {/* Amenities */}
      <Modal
        open={amenitiesRoomId !== null}
        onClose={() => setAmenitiesRoomId(null)}
        title="Manage amenities"
        description={
          amenitiesRoom
            ? `${amenitiesRoom.roomNumber} · ${amenitiesRoom.locationName}`
            : ""
        }
        size="lg"
      >
        {amenitiesRoom ? (
          <RoomAmenityManager
            roomId={amenitiesRoom.id}
            locationId={amenitiesRoom.locationId}
            currentAmenities={amenitiesRoom.amenities}
          />
        ) : (
          <LoadingState />
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
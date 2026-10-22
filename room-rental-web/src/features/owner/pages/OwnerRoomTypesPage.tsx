import { useEffect, useMemo, useState } from "react";

import { Plus, Power, Sparkles } from "../../../components/ui/MaterialIcon.tsx";

import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  Modal,
  PageHeader,
} from "../../../components/ui/index.ts";

import { useLocationScope } from "../../location-scope/LocationScopeProvider";

import { useCreateRoomType } from "../../room-types/hooks/useCreateRoomType.ts";
import { useUpdateRoomType } from "../../room-types/hooks/useUpdateRoomType.ts";
import { useDeactivateRoomType } from "../../room-types/hooks/useDeactivateRoomType.ts";
import { useUpdateRoomTypeImage } from "../../room-types/hooks/useUpdateRoomTypeImage.ts";
import { useRoomTypesByLocation } from "../../room-types/hooks/useRoomTypesByLocation.ts";

import { RoomTypeTable } from "../../room-types/components/RoomTypeTable";
import { RoomTypeCard } from "../../room-types/components/RoomTypeCard";
import {
  RoomTypeFilters,
  type RoomTypeView,
} from "../../room-types/components/RoomTypeFilters";
import { RoomTypeDetailDialog } from "../../room-types/components/RoomTypeDetailDialog.tsx";
import {
  RoomTypeForm,
  type RoomTypeFormValues,
} from "../../room-types/components/RoomTypeForm.tsx";
import type { RoomTypeResponse } from "../../room-types/types/roomType.ts";

import { getErrorMessage } from "../../rooms/utils/roomUtils";

import { useTranslation } from "react-i18next";

type Notice = { type: "success" | "error"; message: string } | null;

const VIEW_KEY = "room-types:view";

function readStoredView(): RoomTypeView {
  try {
    return localStorage.getItem(VIEW_KEY) === "table" ? "table" : "grid";
  } catch {
    return "grid";
  }
}

export default function OwnerRoomTypePage() {
  const { t } = useTranslation();
  const scope = useLocationScope();

  const locationId = scope.currentLocationId;
  const currentLocation = scope.currentLocation;

  const {
    data: roomTypes,
    isLoading,
    isError,
    refetch,
  } = useRoomTypesByLocation(locationId);

  const create = useCreateRoomType();
  const update = useUpdateRoomType();
  const deactivate = useDeactivateRoomType();
  const updateImage = useUpdateRoomTypeImage();

  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<RoomTypeResponse | null>(null);
  const [view, setView] = useState<RoomTypeResponse | null>(null);
  const [toDeactivate, setToDeactivate] = useState<RoomTypeResponse | null>(
    null,
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"" | "ACTIVE" | "INACTIVE">("");
  const [layout, setLayout] = useState<RoomTypeView>(readStoredView);

  // Display only room types belonging to the active location.
  const locationRoomTypes = useMemo(
    () =>
      (roomTypes ?? []).filter((roomType) => roomType.locationId === locationId),
    [roomTypes, locationId],
  );

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return locationRoomTypes.filter((item) => {
      if (status && String(item.status) !== status) return false;

      if (q) {
        const haystack = [item.name, item.code, item.description ?? ""]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [locationRoomTypes, keyword, status]);

  // Close dialogs and reset filters when the active location changes.
  useEffect(() => {
    setMode(null);
    setSelected(null);
    setView(null);
    setToDeactivate(null);
    setFormError(null);
    setKeyword("");
    setStatus("");
  }, [locationId]);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, layout);
    } catch {
      // storage unavailable – ignore
    }
  }, [layout]);

  useEffect(() => {
    if (!notice || notice.type !== "success") return;

    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const clearFilters = () => {
    setKeyword("");
    setStatus("");
  };

  const close = () => {
    setMode(null);
    setSelected(null);
    setFormError(null);
  };

  const openCreate = () => {
    setSelected(null);
    setFormError(null);
    setMode("create");
  };

  const openEdit = (item: RoomTypeResponse) => {
    setSelected(item);
    setFormError(null);
    setMode("edit");
  };

  const submit = async (v: RoomTypeFormValues) => {
    if (locationId == null) {
      return;
    }

    setFormError(null);

    const request = {
      name: v.name.trim(),
      description: v.description.trim() || undefined,
      capacity: v.capacity === "" ? undefined : v.capacity,
    };

    try {
      // Update an existing room type.
      if (mode === "edit" && selected) {
        await update.mutateAsync({
          id: selected.id,
          request,
        });

        // Image upload is a separate API operation.
        if (v.image) {
          await updateImage.mutateAsync({
            id: selected.id,
            image: v.image,
          });
        }

        setNotice({
          type: "success",
          message: `Room type “${request.name}” updated.`,
        });
        close();
        return;
      }

      // Create a room type using the fixed owner location.
      const created = await create.mutateAsync({
        ...request,
        code: v.code.trim(),
        locationId,
      });

      // Upload the image only after the room type has been created.
      if (v.image) {
        try {
          await updateImage.mutateAsync({
            id: created.id,
            image: v.image,
          });
        } catch (error) {
          console.error("Room type created, but image upload failed:", error);

          // Keep the created room type so retrying won't create a duplicate.
          setSelected(created);
          setMode("edit");
          setFormError(
            "The room type was created, but the image could not be uploaded. Select the image again to retry.",
          );
          return;
        }
      }

      setNotice({
        type: "success",
        message: `Room type “${request.name}” created.`,
      });
      close();
    } catch (error) {
      console.error("Unable to save room type:", error);

      setFormError(
        getErrorMessage(
          error,
          mode === "edit"
            ? "Unable to update the room type. Please try again."
            : "Unable to create the room type. Please check your input and try again.",
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
        message: `Room type “${toDeactivate.name}” deactivated.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Unable to deactivate the room type."),
      });
    } finally {
      setToDeactivate(null);
    }
  };

  if (scope.isLoading) {
    return <LoadingState />;
  }

  if (scope.isError) {
    return (
      <EmptyState
        title="Unable to load location"
        description="Something went wrong while loading your assigned location."
      />
    );
  }

  if (locationId == null || !currentLocation) {
    return (
      <EmptyState
        title="No location available"
        description="This account is not assigned to a location."
      />
    );
  }

  const handlers = {
    onView: setView,
    onEdit: openEdit,
    onToggle: (item: RoomTypeResponse) => {
      if (String(item.status) === "ACTIVE") setToDeactivate(item);
    },
  };

  // Every row belongs to the current location, so the lookup is a single entry.
  const locationNames = new Map([[currentLocation.id, currentLocation.name]]);

  const total = locationRoomTypes.length;
  const hasFilters = Boolean(keyword.trim() || status);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <PageHeader
        icon={<Sparkles size={19} />}
        title={t("roomTypes")}
        actions={
          <Button leftIcon={<Plus size={17} />} onClick={openCreate}>
            Add room type
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

      {isLoading && <LoadingState />}

      {isError && (
        <EmptyState
          title="Unable to load room types"
          description="Something went wrong while loading room types."
          action={
            <Button variant="secondary" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {!isLoading && !isError && total > 0 && (
        <>
          <Card>
            <RoomTypeFilters
              keyword={keyword}
              status={status}
              locationId=""
              locations={[]}
              showLocationFilter={false}
              view={layout}
              resultLabel={
                hasFilters
                  ? `${filtered.length} of ${total} room types`
                  : `${total} room ${total === 1 ? "type" : "types"}`
              }
              onKeywordChange={setKeyword}
              onStatusChange={setStatus}
              onLocationChange={() => undefined}
              onViewChange={setLayout}
              onClear={clearFilters}
            />
          </Card>

          {filtered.length === 0 ? (
            <EmptyState
              title="No room types found"
              description="No room types match the current filters."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : layout === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((item) => (
                <RoomTypeCard
                  key={item.id}
                  item={item}
                  locationName={currentLocation.name}
                  {...handlers}
                />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden p-0">
              <RoomTypeTable
                roomTypes={filtered}
                locationNames={locationNames}
                {...handlers}
              />
            </Card>
          )}
        </>
      )}

      {!isLoading && !isError && total === 0 && (
        <EmptyState
          title="No room types yet"
          description={`No room types have been created for ${currentLocation.name}.`}
          action={<Button onClick={openCreate}>Add room type</Button>}
        />
      )}

      {/* Create / Edit */}
      <Modal
        open={mode !== null}
        onClose={close}
        title={mode === "edit" ? "Edit room type" : "Add room type"}
        description={
          mode === "edit"
            ? "Update the room type information and optionally replace its image."
            : `Create a room type for ${currentLocation.name}.`
        }
      >
        <RoomTypeForm
          key={`${mode}-${selected?.id ?? "new"}`}
          mode={mode ?? "create"}
          locations={[
            {
              id: currentLocation.id,
              name: currentLocation.name,
            },
          ]}
          loadingLocations={scope.isLoading}
          fixedLocationId={locationId}
          initialValues={
            selected
              ? {
                  locationId: selected.locationId,
                  name: selected.name,
                  code: selected.code,
                  description: selected.description ?? "",
                  capacity: selected.capacity ?? "",
                  imageUrl: selected.imageUrl,
                }
              : undefined
          }
          onSubmit={submit}
          onCancel={close}
          error={formError}
          loading={
            create.isPending || update.isPending || updateImage.isPending
          }
        />
      </Modal>

      {/* Details */}
      <RoomTypeDetailDialog
        open={!!view}
        onClose={() => setView(null)}
        roomType={view}
        locationName={currentLocation.name}
        onEdit={(item) => {
          setView(null);
          openEdit(item);
        }}
      />

      {/* Deactivate confirmation */}
      <Modal
        open={!!toDeactivate}
        onClose={() => setToDeactivate(null)}
        title="Deactivate room type"
      >
        {toDeactivate && (
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Power size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  Deactivate “{toDeactivate.name}”?
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  It will no longer be available when creating new rooms.
                  Existing rooms are not changed.
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
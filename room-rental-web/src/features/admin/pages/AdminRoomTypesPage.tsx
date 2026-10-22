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

import { useRoomTypes } from "../../room-types/hooks/useRoomTypes.ts";
import { useCreateRoomType } from "../../room-types/hooks/useCreateRoomType.ts";
import { useUpdateRoomType } from "../../room-types/hooks/useUpdateRoomType.ts";
import { useDeactivateRoomType } from "../../room-types/hooks/useDeactivateRoomType.ts";
import { useUpdateRoomTypeImage } from "../../room-types/hooks/useUpdateRoomTypeImage.ts";

import {
  RoomTypeForm,
  type RoomTypeFormValues,
  type LocationOption,
} from "../../room-types/components/RoomTypeForm.tsx";

// Replace this path if your location hook lives elsewhere.
import { useLocations } from "../../locations/hooks/useLocations.ts";

import { RoomTypeTable } from "../../room-types/components/RoomTypeTable";
import { RoomTypeCard } from "../../room-types/components/RoomTypeCard";
import {
  RoomTypeFilters,
  type RoomTypeView,
} from "../../room-types/components/RoomTypeFilters";
import { RoomTypeDetailDialog } from "../../room-types/components/RoomTypeDetailDialog.tsx";
import type { RoomTypeResponse } from "../../room-types/types/roomType.ts";

import { getErrorMessage } from "../../rooms/utils/roomUtils";

import { useTranslation } from "react-i18next";

interface LocationRecord {
  id: number;
  name: string;
}

type Notice = { type: "success" | "error"; message: string } | null;

function normalizeLocations(data: unknown): LocationRecord[] {
  if (Array.isArray(data)) {
    return data.filter(
      (item): item is LocationRecord =>
        !!item &&
        typeof item === "object" &&
        typeof (item as { id?: unknown }).id === "number" &&
        typeof (item as { name?: unknown }).name === "string",
    );
  }

  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { content?: unknown }).content)
  ) {
    return normalizeLocations((data as { content: unknown[] }).content);
  }

  return [];
}

const VIEW_KEY = "room-types:view";

function readStoredView(): RoomTypeView {
  try {
    return localStorage.getItem(VIEW_KEY) === "table" ? "table" : "grid";
  } catch {
    return "grid";
  }
}

export default function AdminRoomTypesPage() {
  const { t } = useTranslation();

  const { data: roomTypes, isLoading, isError, refetch } = useRoomTypes();

  const locationsQuery = useLocations();

  const locationOptions: LocationOption[] = useMemo(
    () => normalizeLocations(locationsQuery.data),
    [locationsQuery.data],
  );

  const locationNames = useMemo(
    () => new Map(locationOptions.map((location) => [location.id, location.name])),
    [locationOptions],
  );

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

  // Filters (applied on the already loaded list)
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"" | "ACTIVE" | "INACTIVE">("");
  const [locationId, setLocationId] = useState("");
  const [layout, setLayout] = useState<RoomTypeView>(readStoredView);

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

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return (roomTypes ?? []).filter((item) => {
      if (status && String(item.status) !== status) return false;
      if (locationId && String(item.locationId) !== locationId) return false;

      if (q) {
        const haystack = [item.name, item.code, item.description ?? ""]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [roomTypes, keyword, status, locationId]);

  const clearFilters = () => {
    setKeyword("");
    setStatus("");
    setLocationId("");
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
    setFormError(null);

    const req = {
      name: v.name.trim(),
      description: v.description.trim() || undefined,
      capacity: v.capacity === "" ? undefined : v.capacity,
    };

    try {
      // EDIT
      if (mode === "edit" && selected) {
        await update.mutateAsync({
          id: selected.id,
          request: req,
        });

        if (v.image) {
          await updateImage.mutateAsync({
            id: selected.id,
            image: v.image,
          });
        }

        setNotice({
          type: "success",
          message: `Room type “${req.name}” updated.`,
        });
        close();
        return;
      }

      // CREATE
      if (!v.locationId || v.locationId <= 0) {
        return;
      }

      const created = await create.mutateAsync({
        ...req,
        code: v.code.trim(),
        locationId: v.locationId,
      });

      // Upload image after creation.
      if (v.image) {
        try {
          await updateImage.mutateAsync({
            id: created.id,
            image: v.image,
          });
        } catch (error) {
          console.error("Room type saved, image upload failed:", error);

          // The room type already exists. Switch to edit mode on it so a
          // retry only re-uploads the image instead of creating a duplicate.
          setSelected(created);
          setMode("edit");
          setFormError(
            "The room type was created, but the image could not be uploaded. You can try uploading it again.",
          );
          return;
        }
      }

      setNotice({
        type: "success",
        message: `Room type “${req.name}” created.`,
      });
      close();
    } catch (error) {
      console.error("Unable to save room type:", error);

      setFormError(
        getErrorMessage(
          error,
          mode === "edit"
            ? "Unable to update the room type."
            : "Unable to create the room type.",
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

  const handlers = {
    onView: setView,
    onEdit: openEdit,
    onToggle: (item: RoomTypeResponse) => {
      if (String(item.status) === "ACTIVE") setToDeactivate(item);
    },
  };

  const total = roomTypes?.length ?? 0;
  const hasFilters = Boolean(keyword.trim() || status || locationId);

  return (
    <div className="mx-auto w-full max-w-350 space-y-6">
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
              locationId={locationId}
              locations={locationOptions}
              view={layout}
              resultLabel={
                hasFilters
                  ? `${filtered.length} of ${total} room types`
                  : `${total} room ${total === 1 ? "type" : "types"}`
              }
              onKeywordChange={setKeyword}
              onStatusChange={setStatus}
              onLocationChange={setLocationId}
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
                  locationName={locationNames.get(item.locationId)}
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
          description="Create a room type before you add rooms."
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
            : "Select a location, create a room type, and optionally upload an image."
        }
      >
        <RoomTypeForm
          key={`${mode}-${selected?.id ?? "new"}`}
          mode={mode ?? "create"}
          locations={locationOptions}
          loadingLocations={locationsQuery.isLoading}
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

        {locationsQuery.isError && (
          <p className="mt-3 text-sm text-rose-600">
            Unable to load locations. Please try again.
          </p>
        )}
      </Modal>

      {/* Details */}
      <RoomTypeDetailDialog
        open={!!view}
        onClose={() => setView(null)}
        roomType={view}
        locationName={view ? locationNames.get(view.locationId) : undefined}
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
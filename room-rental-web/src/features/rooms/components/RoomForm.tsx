import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "../../../components/ui/MaterialIcon.tsx";

import { Button, Input, Select, Textarea } from "../../../components/ui";

import { useLocationAmenities } from "../hooks/useLocationAmenities";
import { formatMoney } from "../utils/roomUtils";
import {
  RoomTypeQuickCreate,
  type CreatedRoomType,
} from "./RoomTypeQuickCreate";

export interface RoomAmenityFormValue {
  amenityId: string;
  amount: number;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface RoomFormValues {
  locationId: string;
  roomTypeId: string;
  roomNumber: string;
  name: string;
  floor: string;
  hourlyPrice: number;
  dailyPrice: number;
  description: string;
  image: File | null;
  amenities: RoomAmenityFormValue[];
}

interface Option {
  id: number;
  name: string;
  capacity?: number;
}

interface Props {
  locations: Option[];
  roomTypes: Option[];
  mode?: "create" | "edit";
  initialValues?: Partial<RoomFormValues> & { imageUrl?: string | null };
  loading?: boolean;
  fixedLocationId?: number;
  /** Server error message shown above the buttons */
  error?: string | null;
  onSubmit: (values: RoomFormValues) => Promise<void>;
  onCancel?: () => void;
  /** Called after a room type was created from inside this form */
  onRoomTypeCreated?: (roomType: CreatedRoomType) => void;
}

export function RoomForm({
  locations,
  roomTypes,
  mode = "create",
  initialValues,
  loading = false,
  fixedLocationId,
  error,
  onSubmit,
  onCancel,
  onRoomTypeCreated,
}: Props) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<RoomFormValues>({
    defaultValues: {
      locationId:
        initialValues?.locationId ??
        (fixedLocationId ? String(fixedLocationId) : ""),
      roomTypeId: initialValues?.roomTypeId ?? "",
      roomNumber: initialValues?.roomNumber ?? "",
      name: initialValues?.name ?? "",
      floor: initialValues?.floor ?? "",
      hourlyPrice: initialValues?.hourlyPrice,
      dailyPrice: initialValues?.dailyPrice,
      description: initialValues?.description ?? "",
      image: null,
      amenities: initialValues?.amenities ?? [],
    },
  });

  useEffect(() => {
    if (fixedLocationId) {
      setValue("locationId", String(fixedLocationId), { shouldValidate: true });
    }
  }, [fixedLocationId, setValue]);

  useEffect(() => {
    register("locationId", { required: "Location is required" });
    register("roomTypeId", { required: "Room type is required" });
    register("image", {
      validate: (file) => {
        if (!file) return true;
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return "Only JPEG, PNG, and WebP images are allowed";
        }
        return file.size <= MAX_IMAGE_SIZE || "Image must not exceed 5 MB";
      },
    });
  }, [register]);

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "amenities",
  });

  const locationId = watch("locationId");
  const roomTypeId = watch("roomTypeId");
  const watchedAmenities = watch("amenities");
  const selectedImage = watch("image");

  const previewUrl = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : null),
    [selectedImage],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const shownImage = previewUrl ?? initialValues?.imageUrl ?? null;

  const locationName =
    locations.find((location) => location.id === Number(locationId))?.name ??
    "";

  /* ---------------------------------------------------------------------- */
  /* Room types (including the ones created from this form)                  */
  /* ---------------------------------------------------------------------- */

  const [createdTypes, setCreatedTypes] = useState<Option[]>([]);
  const [creatingType, setCreatingType] = useState(false);
  const [typeNotice, setTypeNotice] = useState<{
    kind: "success" | "warning";
    message: string;
  } | null>(null);

  const allRoomTypes = useMemo(() => {
    const known = new Set(roomTypes.map((type) => type.id));

    return [
      ...roomTypes,
      ...createdTypes.filter((type) => !known.has(type.id)),
    ];
  }, [roomTypes, createdTypes]);

  const handleTypeCreated = (created: CreatedRoomType, warning?: string) => {
    setCreatedTypes((current) => [
      ...current,
      { id: created.id, name: created.name },
    ]);

    setValue("roomTypeId", String(created.id), {
      shouldValidate: true,
      shouldDirty: true,
    });

    setTypeNotice(
      warning
        ? { kind: "warning", message: warning }
        : { kind: "success", message: `Room type “${created.name}” created and selected.` },
    );

    onRoomTypeCreated?.(created);
    setCreatingType(false);
  };


  const { data: amenities = [], isLoading: amenitiesLoading } =
    useLocationAmenities(
      Number(locationId),
      mode === "create" && Boolean(locationId),
    );

  const [amenityToAdd, setAmenityToAdd] = useState("");
  const [amountToAdd, setAmountToAdd] = useState(1);

  const selectedIds = useMemo(
    () => new Set(fields.map((field) => Number(field.amenityId))),
    [fields],
  );

  const availableAmenities = useMemo(
    () => amenities.filter((amenity) => !selectedIds.has(amenity.id)),
    [amenities, selectedIds],
  );

  const amenityBeingAdded = amenities.find(
    (item) => item.id === Number(amenityToAdd),
  );

  useEffect(() => {
    if (mode !== "create") return;

    setAmenityToAdd("");
    setAmountToAdd(1);
    replace([]);
  }, [locationId, mode, replace]);

  const addAmenity = () => {
    if (!amenityBeingAdded || amountToAdd < 1) return;
    if (amountToAdd > amenityBeingAdded.stockQuantity) return;

    append({
      amenityId: String(amenityBeingAdded.id),
      amount: amountToAdd,
    });

    setAmenityToAdd("");
    setAmountToAdd(1);
  };

  const amenitiesTotal = (watchedAmenities ?? []).reduce((total, item) => {
    const amenity = amenities.find((a) => a.id === Number(item.amenityId));
    return total + (amenity ? amenity.price * (Number(item.amount) || 0) : 0);
  }, 0);


  const canCreateType = mode === "create" && Boolean(locationId);

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={creatingType ? "hidden" : "space-y-8"}
        noValidate
      >
        {/* 1 — Location & type */}
        <Section step={1} title="Location & type">
          <div className="grid gap-4 sm:grid-cols-2">
            {!fixedLocationId ? (
              <Select
                id="room-location"
                label="Location"
                requiredMark
                value={locationId}
                disabled={mode === "edit"}
                onChange={(event) =>
                  setValue("locationId", event.target.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                error={errors.locationId?.message}
                options={[
                  { value: "", label: "Select location" },
                  ...locations.map((location) => ({
                    value: String(location.id),
                    label: location.name,
                  })),
                ]}
              />
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <p className="text-xs font-medium text-slate-500">Location</p>
                <p className="mt-0.5 text-sm font-medium text-slate-800">
                  {locationName || `#${fixedLocationId}`}
                </p>
              </div>
            )}

            <div>
              <Select
                id="room-type"
                label="Room type"
                requiredMark
                value={roomTypeId}
                disabled={mode === "edit"}
                onChange={(event) => {
                  setTypeNotice(null);
                  setValue("roomTypeId", event.target.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                error={errors.roomTypeId?.message}
                options={[
                  { value: "", label: "Select room type" },
                  ...allRoomTypes.map((type) => ({
                    value: String(type.id),
                    label: `${type.name} ( ${type.capacity} people)`,
                  })),
                ]}
              />

              {mode === "create" && (
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">
                    {canCreateType
                      ? "Can't find the type you need?"
                      : "Select a location to create a type."}
                  </p>

                  <button
                    type="button"
                    disabled={!canCreateType}
                    onClick={() => {
                      setTypeNotice(null);
                      setCreatingType(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
                  >
                    <Plus size={14} />
                    New room type
                  </button>
                </div>
              )}
            </div>
          </div>

          {typeNotice && (
            <p
              role="status"
              className={[
                "rounded-lg px-3 py-2 text-xs",
                typeNotice.kind === "success"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-amber-50 text-amber-800",
              ].join(" ")}
            >
              {typeNotice.message}
            </p>
          )}
        </Section>

        {/* 2 — Details */}
        <Section step={2} title="Room details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Room number"
              requiredMark
              disabled={mode === "edit"}
              placeholder="M-101"
              error={errors.roomNumber?.message}
              {...register("roomNumber", {
                required: "Room number is required",
              })}
            />

            <Input
              label="Room name"
              requiredMark
              placeholder="Main Meeting Room"
              error={errors.name?.message}
              {...register("name", { required: "Room name is required" })}
            />
          </div>

          <Input
            label="Floor"
            placeholder="e.g. 2"
            requiredMark
            error={errors.floor?.message}
            {...register("floor", { required: "Floor is required" })}
          />

          <Textarea
            label="Description"
            placeholder="Describe this room..."
            {...register("description")}
          />

          
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-slate-600">Room image (optional)</p>
              <span className="text-xs text-slate-400">JPEG, PNG, or WebP · up to 5 MB</span>
            </div>

            {shownImage && (
              <div className="relative overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={shownImage}
                  alt={selectedImage ? "Selected room" : "Current room"}
                  className="h-44 w-full object-cover"
                />
                <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
                  {selectedImage ? "New image preview" : "Current image"}
                </span>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={() =>
                      setValue("image", null, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className="absolute right-2 top-2 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow hover:bg-white"
                  >
                    Clear selection
                  </button>
                )}
              </div>
            )}

            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-5 text-center transition hover:border-slate-400 hover:bg-slate-50">
              <span className="text-sm font-medium text-slate-700">
                {shownImage ? "Choose a different image" : "Click to upload a room image"}
              </span>
              <span className="text-xs text-slate-500">
                The image is uploaded after the room is saved.
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={loading}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setValue("image", file, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  event.target.value = "";
                }}
              />
            </label>

            {errors.image && (
              <p className="text-xs text-red-600">{errors.image.message}</p>
            )}
          </div>

        </Section>

        {/* 3 — Pricing */}
        <Section step={3} title="Pricing" hint="Prices in USD.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Hourly price ($ / hour)"
              requiredMark
              type="number"
              min={0}
              step="0.01"
              placeholder="10.00"
              error={errors.hourlyPrice?.message}
              {...register("hourlyPrice", {
                setValueAs: (v) => (v === "" ? null : Number(v)),
                min: { value: 0, message: "Price cannot be negative" },
                required: "Hourly price is required",
              })}
            />

            <Input
              label="Daily price ($ / day)"
              requiredMark
              type="number"
              min={0}
              step="0.01"
              placeholder="80.00"
              error={errors.dailyPrice?.message}
              {...register("dailyPrice", {
                setValueAs: (v) => (v === "" ? null : Number(v)),
                min: { value: 0, message: "Price cannot be negative" },
                required: "Daily price is required",
              })}
            />
          </div>
        </Section>

        {/* 4 — Amenities (create only) */}
        {mode === "create" && (
          <Section
            step={4}
            title="Amenities"
            hint="Optional. Taken from the selected location's stock."
          >
            {!locationId ? (
              <p className="rounded-xl border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-400">
                Select a location first to choose amenities.
              </p>
            ) : (
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_110px_auto] sm:items-end">
                  <Select
                    label="Amenity"
                    value={amenityToAdd}
                    disabled={
                      amenitiesLoading || availableAmenities.length === 0
                    }
                    onChange={(event) => {
                      setAmenityToAdd(event.target.value);
                      setAmountToAdd(1);
                    }}
                    options={[
                      {
                        value: "",
                        label: amenitiesLoading
                          ? "Loading amenities..."
                          : availableAmenities.length === 0
                            ? "No available amenities"
                            : "Select amenity",
                      },
                      ...availableAmenities.map((amenity) => ({
                        value: String(amenity.id),
                        label: `${amenity.name} · $${formatMoney(amenity.price)} · stock ${amenity.stockQuantity}`,
                      })),
                    ]}
                  />

                  <Input
                    label="Amount"
                    type="number"
                    min={1}
                    max={amenityBeingAdded?.stockQuantity ?? undefined}
                    value={amountToAdd}
                    onChange={(event) =>
                      setAmountToAdd(
                        Math.max(1, Number(event.target.value) || 1),
                      )
                    }
                  />

                  <Button
                    type="button"
                    variant="secondary"
                    leftIcon={<Plus size={16} />}
                    disabled={
                      !amenityBeingAdded ||
                      amountToAdd > amenityBeingAdded.stockQuantity
                    }
                    onClick={addAmenity}
                  >
                    Add
                  </Button>
                </div>

                {amenityBeingAdded &&
                  amountToAdd > amenityBeingAdded.stockQuantity && (
                    <p className="text-xs text-red-600">
                      Maximum available stock is{" "}
                      {amenityBeingAdded.stockQuantity}.
                    </p>
                  )}

                {fields.length > 0 && (
                  <div className="space-y-2">
                    {fields.map((field, index) => {
                      const amenity = amenities.find(
                        (item) => item.id === Number(field.amenityId),
                      );

                      return (
                        <div
                          key={field.id}
                          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_110px_auto] sm:items-end"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {amenity?.name ?? `Amenity #${field.amenityId}`}
                            </p>

                            {amenity && (
                              <p className="mt-1 text-xs text-slate-500">
                                ${formatMoney(amenity.price)} each · stock{" "}
                                {amenity.stockQuantity}
                              </p>
                            )}
                          </div>

                          <Input
                            label="Amount"
                            placeholder=" "
                            type="number"
                            min={1}
                            max={amenity?.stockQuantity ?? undefined}
                            error={errors.amenities?.[index]?.amount?.message}
                            {...register(`amenities.${index}.amount`, {
                              valueAsNumber: true,
                              required: "Amount is required",
                              min: {
                                value: 1,
                                message: "Amount must be at least 1",
                              },
                              validate: (value) =>
                                !amenity ||
                                value <= amenity.stockQuantity ||
                                `Maximum available stock is ${amenity.stockQuantity}`,
                            })}
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            aria-label={`Remove ${amenity?.name ?? "amenity"}`}
                            onClick={() => remove(index)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      );
                    })}

                    <div className="flex items-center justify-between px-1 pt-1 text-xs text-slate-500">
                      <span>
                        {fields.length}{" "}
                        {fields.length === 1 ? "amenity" : "amenities"} selected
                      </span>
                      <span className="font-semibold text-slate-800">
                        Value ${formatMoney(amenitiesTotal)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Section>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}

          <Button type="submit" loading={loading}>
            {mode === "create"
              ? t("room.button.create", "Create room")
              : t("room.button.save", "Save changes")}
          </Button>
        </div>
      </form>

      {creatingType && (
        <RoomTypeQuickCreate
          locationId={Number(locationId)}
          locationName={locationName || `#${locationId}`}
          onCancel={() => setCreatingType(false)}
          onCreated={handleTypeCreated}
        />
      )}
    </>
  );
}

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white"
        >
          {step}
        </span>

        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>

        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}
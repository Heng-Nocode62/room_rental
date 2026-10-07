import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "../../../components/ui/MaterialIcon.tsx";

import { Button, Input, Select, Textarea } from "../../../components/ui";

import { useLocationAmenities } from "../hooks/useLocationAmenities";

export interface RoomAmenityFormValue {
  amenityId: string;
  amount: number;
}

export interface RoomFormValues {
  locationId: string;
  roomTypeId: string;
  roomNumber: string;
  name: string;
  floor: string;
  hourlyPrice: number;
  dailyPrice: number;
  description: string;
  amenities: RoomAmenityFormValue[];
}

interface Option {
  id: number;
  name: string;
}

interface Props {
  locations: Option[];
  roomTypes: Option[];
  mode?: "create" | "edit";
  initialValues?: Partial<RoomFormValues>;
  loading?: boolean;
  fixedLocationId?: number;
  onSubmit: (values: RoomFormValues) => Promise<void>;
}

export function RoomForm({
  locations,
  roomTypes,
  mode = "create",
  initialValues,
  loading = false,
  fixedLocationId,
  onSubmit,
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
      amenities: initialValues?.amenities ?? [],
    },
  });

  useEffect(() => {
    if (fixedLocationId) {
      setValue("locationId", String(fixedLocationId), { shouldValidate: true });
    }
  }, [fixedLocationId, setValue]);

  useEffect(() => {
    register("locationId", {
      required: "Location is required",
    });

    register("roomTypeId", {
      required: "Room type is required",
    });
  }, [register]);

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "amenities",
  });

  const locationId = watch("locationId");

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

  useEffect(() => {
    if (mode !== "create") return;

    setAmenityToAdd("");
    setAmountToAdd(1);
    replace([]);
  }, [locationId, mode, replace]);

  const addAmenity = () => {
    const amenityId = Number(amenityToAdd);
    const amenity = amenities.find((item) => item.id === amenityId);

    if (!amenity || amountToAdd < 1) return;

    if (amountToAdd > amenity.stockQuantity) return;

    append({
      amenityId: String(amenity.id),
      amount: amountToAdd,
    });

    setAmenityToAdd("");
    setAmountToAdd(1);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {!fixedLocationId ? (
          <Select
            id="room-location"
            label="Location"
            requiredMark
            value={watch("locationId")}
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
              {locations.find((location) => location.id === fixedLocationId)
                ?.name ?? `#${fixedLocationId}`}
            </p>
          </div>
        )}

        <Select
          id="room-type"
          label="Room type"
          requiredMark
          value={watch("roomTypeId")}
          disabled={mode === "edit"}
          onChange={(event) =>
            setValue("roomTypeId", event.target.value, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          error={errors.roomTypeId?.message}
          options={[
            { value: "", label: "Select room type" },
            ...roomTypes.map((type) => ({
              value: String(type.id),
              label: type.name,
            })),
          ]}
        />
      </div>

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
          {...register("name", {
            required: "Room name is required",
          })}
        />
      </div>

      <Input label="Floor" placeholder="2" {...register("floor")} />
      <div className="flex gap-4">
        <Input
          label="Hourly Price"
          type="number"
          min={0}
          step="0.01"
          error={errors.hourlyPrice?.message}
          placeholder="10.00"
          {...register("hourlyPrice", {
            setValueAs: (v) => (v === "" ? null : Number(v)),
            min: { value: 0, message: "Price cannot be negative" },
            required:"Hourly price is required"
          })}
        />
        <Input
          label="Daily Price"
          type="number"
          min={0}
          step={0.1}
          error={errors.dailyPrice?.message}
          placeholder="10.00"
          {...register("dailyPrice", {
            setValueAs: (v) => (v === "" ? null : Number(v)),
            min: { value: 0, message: "Price cannot be negative" },
            required:"DailyPrice is required"
          })}
        />
      </div>

      <Textarea
        label="Description"
        placeholder="Describe this room..."
        {...register("description")}
      />

      {mode === "create" && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Amenities</p>
              <p className="mt-1 text-xs text-slate-500">
                Optional. Amenities must belong to the selected location.
              </p>
            </div>
          </div>

          {!locationId ? (
            <p className="mt-4 text-sm text-slate-400">
              Select a location first to choose amenities.
            </p>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px_auto]">
                <Select
                  label="Amenity"
                  value={amenityToAdd}
                  disabled={amenitiesLoading || availableAmenities.length === 0}
                  onChange={(event) => setAmenityToAdd(event.target.value)}
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
                      label: `${amenity.name} · ${amenity.price.toFixed(2)} · stock ${amenity.stockQuantity}`,
                    })),
                  ]}
                />

                <Input
                  label="Amount"
                  type="number"
                  min={1}
                  max={
                    amenities.find((item) => item.id === Number(amenityToAdd))
                      ?.stockQuantity ?? undefined
                  }
                  value={amountToAdd}
                  onChange={(event) =>
                    setAmountToAdd(Math.max(1, Number(event.target.value) || 1))
                  }
                />

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="secondary"
                    leftIcon={<Plus size={16} />}
                    disabled={!amenityToAdd}
                    onClick={addAmenity}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {fields.length > 0 && (
                <div className="mt-4 space-y-2">
                  {fields.map((field, index) => {
                    const amenity = amenities.find(
                      (item) => item.id === Number(field.amenityId),
                    );

                    return (
                      <div
                        key={field.id}
                        className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_120px_auto] sm:items-end"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {amenity?.name ?? `Amenity #${field.amenityId}`}
                          </p>
                          {amenity && (
                            <p className="mt-1 text-xs text-slate-500">
                              Price {amenity.price.toFixed(2)} · Available stock{" "}
                              {amenity.stockQuantity}
                            </p>
                          )}
                        </div>

                        <Input
                          label="Amount"
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
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {mode === "create" ? t("room.button.create") : t("room.button.save")}
        </Button>
      </div>
    </form>
  );
}

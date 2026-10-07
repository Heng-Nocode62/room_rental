import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button, Input, Textarea } from "../../../components/ui";

export interface LocationOption {
  id: number;
  name: string;
}

export interface AmenityFormValues {
  locationId: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
}

interface AmenityFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<AmenityFormValues>;
  locations: LocationOption[];
  loadingLocations?: boolean;
  loading?: boolean;
  fixedLocationId?: number;
  onSubmit: (values: AmenityFormValues) => Promise<void>;
}

export function AmenityForm({
  mode,
  initialValues,
  locations,
  loadingLocations = false,
  loading = false,
  fixedLocationId,
  onSubmit,
}: AmenityFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AmenityFormValues>({
    defaultValues: {
      locationId: fixedLocationId ?? initialValues?.locationId ?? 0,
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      price: initialValues?.price ?? 0,
      stockQuantity: initialValues?.stockQuantity ?? 0,
    },
  });

  useEffect(() => {
    if (fixedLocationId !== undefined) {
      setValue("locationId", fixedLocationId, {
        shouldValidate: true,
      });
    }
  }, [fixedLocationId, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {!fixedLocationId ? (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Location <span className="text-red-500">*</span>
          </label>

          <select
            disabled={mode === "edit" || loadingLocations}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100"
            {...register("locationId", {
              setValueAs: (value) => Number(value),
              validate: (value) => value > 0 || "Location is required",
            })}
          >
            <option value={0}>
              {loadingLocations ? "Loading locations..." : "Select location"}
            </option>

            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>

          {errors.locationId && (
            <p className="mt-1 text-xs text-red-500">
              {errors.locationId.message}
            </p>
          )}
        </div>
      ) : (
        <input
          type="hidden"
          value={fixedLocationId}
          {...register("locationId", {
            valueAsNumber: true,
          })}
        />
      )}

      <Input
        label="Name"
        requiredMark
        placeholder="Projector"
        error={errors.name?.message}
        {...register("name", {
          required: "Amenity name is required",
          maxLength: {
            value: 100,
            message: "Maximum 100 characters",
          },
        })}
      />

      <Textarea
        label="Description"
        placeholder="HD projector for presentations..."
        {...register("description")}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Price"
          requiredMark
          type="number"
          min={0}
          step="0.01"
          placeholder="10.00"
          error={errors.price?.message}
          {...register("price", {
            setValueAs: (value) => Number(value),
            validate: (value) => value >= 0 || "Price cannot be negative",
          })}
        />

        <Input
          label="Stock quantity"
          requiredMark
          type="number"
          min={0}
          step="1"
          placeholder="20"
          error={errors.stockQuantity?.message}
          {...register("stockQuantity", {
            setValueAs: (value) => Number(value),
            validate: (value) => {
              if (value < 0) {
                return "Stock cannot be negative";
              }

              if (!Number.isInteger(value)) {
                return "Stock must be a whole number";
              }

              return true;
            },
          })}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" loading={loading}>
          {mode === "create" ? "Create Amenity" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

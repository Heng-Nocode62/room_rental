import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Input, Select, Textarea } from "../../../components/ui";

export interface LocationOption {
  id: number;
  name: string;
}

export interface RoomTypeFormValues {
  locationId: number;
  name: string;
  code: string;
  description: string;
  capacity: number | "";
  image: File | null;
}

interface RoomTypeFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<RoomTypeFormValues> & {
    imageUrl?: string;
  };
  locations: LocationOption[];
  loadingLocations?: boolean;
  loading?: boolean;
  fixedLocationId?: number;
  /** Server error message shown above the buttons */
  error?: string | null;
  onSubmit: (values: RoomTypeFormValues) => Promise<void>;
  onCancel?: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DESCRIPTION = 1000;

function toCode(name: string) {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

export function RoomTypeForm({
  mode,
  initialValues,
  locations,
  loadingLocations = false,
  loading = false,
  fixedLocationId,
  error,
  onSubmit,
  onCancel,
}: RoomTypeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomTypeFormValues>({
    defaultValues: {
      locationId: fixedLocationId ?? initialValues?.locationId ?? 0,
      name: initialValues?.name ?? "",
      code: initialValues?.code ?? "",
      description: initialValues?.description ?? "",
      capacity: initialValues?.capacity ?? "",
      image: null,
    },
  });

  const locationId = watch("locationId");
  const name = watch("name");
  const description = watch("description") ?? "";
  const selectedImage = watch("image");

  const [codeEdited, setCodeEdited] = useState(mode === "edit");

  // Registered manually because they are driven by custom controls.
  useEffect(() => {
    register("locationId", {
      validate: (value) => value > 0 || "Please select a location",
    });

    register("image", {
      validate: (file) =>
        !file || file.size <= MAX_IMAGE_SIZE || "Image must be 5 MB or smaller",
    });
  }, [register]);

  useEffect(() => {
    if (fixedLocationId !== undefined) {
      setValue("locationId", fixedLocationId, { shouldValidate: true });
    }
  }, [fixedLocationId, setValue]);

  // Suggest a code from the name until the user edits it (create only).
  useEffect(() => {
    if (mode === "create" && !codeEdited) setValue("code", toCode(name ?? ""));
  }, [name, mode, codeEdited, setValue]);

  const previewUrl = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : null),
    [selectedImage],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const codeField = register("code", {
    required: "Room type code is required",
    maxLength: { value: 50, message: "Maximum 50 characters" },
  });

  const shownImage = previewUrl ?? initialValues?.imageUrl ?? null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Basics */}
      <fieldset className="space-y-4">

        {fixedLocationId === undefined ? (
          <Select
            label="Location"
            requiredMark
            value={locationId ? String(locationId) : ""}
            disabled={mode === "edit" || loadingLocations || loading}
            error={errors.locationId?.message}
            onChange={(event) =>
              setValue("locationId", Number(event.target.value), {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            options={[
              {
                value: "",
                label: loadingLocations
                  ? "Loading locations..."
                  : "Select location",
              },
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            requiredMark
            placeholder="Deluxe Room"
            autoFocus
            error={errors.name?.message}
            {...register("name", {
              required: "Room type name is required",
              maxLength: { value: 100, message: "Maximum 100 characters" },
            })}
          />

          <div>
            <Input
              label="Code"
              requiredMark
              placeholder="DELUXE"
              disabled={mode === "edit"}
              error={errors.code?.message}
              {...codeField}
              onChange={(event) => {
                setCodeEdited(true);
                event.target.value = event.target.value
                  .toUpperCase()
                  .replace(/\s+/g, "_");
                void codeField.onChange(event);
              }}
            />

            <p className="mt-1 text-xs text-slate-400">
              {mode === "edit"
                ? "The code cannot be changed after creation."
                : "Auto-filled from the name. Cannot be changed later."}
            </p>
          </div>
        </div>
      </fieldset>

      {/* Capacity & description */}
      <fieldset className="space-y-4">

        <Input
          label="Capacity"
          requiredMark
          type="number"
          min={1}
          step="1"
          placeholder="2"
          error={errors.capacity?.message}
          {...register("capacity", {
            setValueAs: (value) => (value === "" ? "" : Number(value)),
            validate: (value) => {
              if (value === "") return "Capacity is required";
              if (value < 1) return "Capacity must be at least 1";
              if (!Number.isInteger(value)) return "Capacity must be a whole number";
              return true;
            },
          })}
        />

        <div>
          <Textarea
            label="Description"
            placeholder="Describe this room type..."
            {...register("description", {
              maxLength: {
                value: MAX_DESCRIPTION,
                message: `Maximum ${MAX_DESCRIPTION} characters`,
              },
            })}
          />

          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-red-500">{errors.description?.message}</span>
            <span
              className={
                description.length > MAX_DESCRIPTION
                  ? "text-red-500"
                  : "text-slate-400"
              }
            >
              {description.length}/{MAX_DESCRIPTION}
            </span>
          </div>
        </div>
      </fieldset>

      {/* Image */}
      <fieldset className="space-y-3">
        <Legend>
          Image <span className="font-normal normal-case">(optional)</span>
        </Legend>

        {shownImage && (
          <div className="relative overflow-hidden rounded-xl border border-slate-200">
            <img
              src={shownImage}
              alt={selectedImage ? "New room type" : "Current room type"}
              className="h-44 w-full object-cover"
            />

            <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
              {selectedImage ? "New image" : "Current image"}
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
                Remove
              </button>
            )}
          </div>
        )}

        <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-5 text-center transition hover:border-slate-400 hover:bg-slate-50">
          <span className="text-sm font-medium text-slate-700">
            {shownImage ? "Choose a different image" : "Click to upload an image"}
          </span>
          <span className="text-xs text-slate-500">PNG or JPG, up to 5 MB</span>

          <input
            type="file"
            accept="image/*"
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
          <p className="text-xs text-red-500">{errors.image.message}</p>
        )}
      </fieldset>

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
          {mode === "create" ? "Create room type" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </legend>
  );
}
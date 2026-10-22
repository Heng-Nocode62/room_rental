import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button, Input, Select } from "../../../components/ui";

import type { UserResponse } from "../../users/types/user";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const TELEGRAM_PATTERN =
  /^(@[A-Za-z0-9_]{5,32}|https?:\/\/(t\.me|telegram\.me)\/[A-Za-z0-9_]{5,32})$/;

export interface LocationFormValues {
  name: string;
  code: string;
  address: string;
  phone: string;
  timeZone: string;

  floor: number;
  ownerId?: number;

  locationBakongAccountId: string;
  telegramContact: string;

  image: File | null;
}

/**
 * API responses may contain null for optional fields.
 * Form values use empty strings instead, so allow both
 * while initializing the form.
 */
type LocationFormInitialValues = Partial<
  Omit<
    LocationFormValues,
    | "address"
    | "phone"
    | "ownerId"
    | "locationBakongAccountId"
    | "telegramContact"
    | "image"
  >
> & {
  address?: string | null;
  phone?: string | null;
  ownerId?: number | null;
  locationBakongAccountId?: string | null;
  telegramContact?: string | null;
  imageUrl?: string | null;
};

interface LocationFormProps {
  initialValues?: LocationFormInitialValues;
  mode: "create" | "edit";
  loading?: boolean;
  error?: string | null;
  onSubmit: (values: LocationFormValues) => Promise<void>;
  owners?: UserResponse[];
  ownersLoading?: boolean;
}

const commonTimezones = [
  "Asia/Phnom_Penh",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Kuala_Lumpur",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

export function LocationForm({
  initialValues,
  mode,
  loading = false,
  error,
  onSubmit,
  owners = [],
  ownersLoading = false,
}: LocationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<LocationFormValues>({
    defaultValues: {
      name: initialValues?.name ?? "",
      code: initialValues?.code ?? "",
      address: initialValues?.address ?? "",
      phone: initialValues?.phone ?? "",
      timeZone: initialValues?.timeZone ?? "Asia/Phnom_Penh",
      floor: initialValues?.floor,
      ownerId: initialValues?.ownerId ?? undefined,
      locationBakongAccountId: initialValues?.locationBakongAccountId ?? "",
      telegramContact: initialValues?.telegramContact ?? "",
      image: null,
    },
  });

  useEffect(() => {
    register("image", {
      validate: (file) => {
        if (!file) return true;

        if (file.size > MAX_IMAGE_SIZE) {
          return "Image must be 5 MB or smaller";
        }

        if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
          return "Only JPEG, PNG, and WebP images are allowed";
        }

        return true;
      },
    });
  }, [register]);

  const selectedImage = watch("image");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedImage);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  const shownImage = previewUrl ?? initialValues?.imageUrl ?? null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      {/* Basic info */}
      <div className="space-y-5">
        <Input
          label="Location name"
          requiredMark
          placeholder="Head Office"
          disabled={loading}
          error={errors.name?.message}
          {...register("name", {
            required: "Location name is required",
            maxLength: { value: 100, message: "Maximum 100 characters" },
          })}
        />

        <Input
          label="Code"
          requiredMark
          placeholder="HQ"
          readOnly={mode === "edit"}
          disabled={loading}
          className={
            mode === "edit" ? "cursor-not-allowed bg-slate-100" : undefined
          }
          error={errors.code?.message}
          hint={
            mode === "edit"
              ? "Location code cannot be changed here."
              : undefined
          }
          {...register("code", {
            required: "Location code is required",
            maxLength: { value: 50, message: "Maximum 50 characters" },
          })}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Floor"
            requiredMark
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="1"
            disabled={loading}
            error={errors.floor?.message}
            {...register("floor", {
              required: "Floor is required",
              valueAsNumber: true,
              min: { value: 0, message: "Floor cannot be less than 0" },
              validate: (value) =>
                Number.isInteger(value) || "Floor must be a whole number",
            })}
          />

          {mode === "create" && (
            <div>
  <Controller
    name="ownerId"
    control={control}
    rules={{ required: "Owner is required" }}
    render={({ field }) => (
      <Select
        label="Owner *"
        value={field.value ? String(field.value) : ""}
        disabled={ownersLoading || loading}
        onBlur={field.onBlur}
        onChange={(event) =>
          field.onChange(
            event.target.value === "" ? "" : Number(event.target.value),
          )
        }
        options={[
          {
            value: "",
            label: ownersLoading ? "Loading owners..." : "Select an owner",
          },
          ...owners.map((owner) => ({
            value: String(owner.id),
            label: `${owner.firstName} ${owner.lastName} (@${owner.username})`,
          })),
        ]}
      />
    )}
  />

  {errors.ownerId ? (
    <p className="mt-1.5 text-xs text-rose-600">{errors.ownerId.message}</p>
  ) : !ownersLoading && owners.length === 0 ? (
    <p className="mt-1.5 text-xs text-amber-600">
      No users with the OWNER role are available.
    </p>
  ) : (
    <p className="mt-1.5 text-xs text-slate-500">
      Only users with the OWNER role can be selected.
    </p>
  )}
</div>
          )}
        </div>

        {mode === "edit" && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Owner
            </p>
            <p className="mt-1 text-sm text-slate-700">
              Ownership cannot be changed from this form.
            </p>
          </div>
        )}

        <Input
          label="Address"
          placeholder="123 Main Street"
          disabled={loading}
          {...register("address")}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Phone"
            type="tel"
            inputMode="tel"
            placeholder="012 345 678"
            disabled={loading}
            error={errors.phone?.message}
            {...register("phone", {
              pattern: {
                value: /^[0-9+\-\s()]{6,20}$/,
                message: "Enter a valid phone number",
              },
            })}
          />

          <div>
            <Input
              label="Timezone"
              requiredMark
              list="location-timezones"
              placeholder="Asia/Phnom_Penh"
              autoComplete="off"
              disabled={loading}
              error={errors.timeZone?.message}
              {...register("timeZone", {
                required: "Timezone is required",
                maxLength: { value: 64, message: "Maximum 64 characters" },
              })}
            />

            <datalist id="location-timezones">
              {commonTimezones.map((timezone) => (
                <option key={timezone} value={timezone} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-4 border-t border-slate-200 pt-6">

        <Input
          label="Location Bakong account ID"
          placeholder="example@bank"
          autoCapitalize="none"
          autoCorrect="off"
          disabled={loading}
          error={errors.locationBakongAccountId?.message}
          {...register("locationBakongAccountId", {
            maxLength: { value: 100, message: "Maximum 100 characters" },
          })}
        />

        <Input
          label="Telegram username or link"
          placeholder="@username or https://t.me/username"
          autoCapitalize="none"
          autoCorrect="off"
          disabled={loading}
          error={errors.telegramContact?.message}
          {...register("telegramContact", {
            maxLength: { value: 255, message: "Maximum 255 characters" },
            validate: (value) =>
              !value ||
              TELEGRAM_PATTERN.test(value.trim()) ||
              "Use @username or a https://t.me/username link",
          })}
        />
      </div>

      {/* Image */}
      <div className="border-t border-slate-200 pt-6">
        <SectionHeader
          title="Location image"
          description="Optional. JPEG, PNG, or WebP, up to 5 MB."
        />

        {shownImage && (
          <div className="relative mt-4 overflow-hidden rounded-xl border border-slate-200">
            <img
              src={shownImage}
              alt={
                selectedImage ? "New location image preview" : "Current location"
              }
              className="h-44 w-full object-cover sm:h-56"
            />

            <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
              {selectedImage ? "New image" : "Current image"}
            </span>

            {selectedImage && (
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setValue("image", null, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                className="absolute right-2 top-2 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
        )}

        <label
          className={`mt-4 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center transition focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200 ${
            loading
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:border-slate-400 hover:bg-slate-50"
          }`}
        >
          <span className="text-sm font-medium text-slate-700">
            {shownImage
              ? "Choose a different image"
              : "Click to upload a location image"}
          </span>

          <span className="text-xs text-slate-500">
            JPEG, PNG, or WebP, up to 5 MB
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

              // Allow re-selecting the same file after removing it.
              event.target.value = "";
            }}
          />
        </label>

        {errors.image && (
          <p role="alert" className="mt-1.5 text-xs text-rose-600">
            {errors.image.message}
          </p>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} className="w-full sm:w-auto">
          {mode === "create" ? "Create Location" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
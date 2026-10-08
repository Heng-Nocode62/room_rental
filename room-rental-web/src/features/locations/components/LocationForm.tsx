import { useForm } from "react-hook-form";

import { Button, Input } from "../../../components/ui";

import type { UserResponse } from "../../users/types/user";

export interface LocationFormValues {
  name: string;
  code: string;
  address: string;
  phone: string;
  timeZone: string;

  floor: number;
  ownerId?: number;
}

interface LocationFormProps {
  initialValues?: Partial<LocationFormValues>;

  mode: "create" | "edit";

  loading?: boolean;

  onSubmit: (values: LocationFormValues) => Promise<void>;

  owners?: UserResponse[];
  ownersLoading?: boolean;
}

const commonTimezones = [
  "Asia/Phnom_Penh",
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

export function LocationForm({
  initialValues,
  mode,
  loading = false,
  onSubmit,
  owners = [],
  ownersLoading = false,
}: LocationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormValues>({
    defaultValues: {
      name: initialValues?.name ?? "",

      code: initialValues?.code ?? "",

      address: initialValues?.address ?? "",

      phone: initialValues?.phone ?? "",

      timeZone: initialValues?.timeZone ?? "",

      floor: initialValues?.floor,
      ownerId: initialValues?.ownerId,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Location name"
        requiredMark
        placeholder="Head Office"
        error={errors.name?.message}
        {...register("name", {
          required: "Location name is required",
          maxLength: {
            value: 100,
            message: "Maximum 100 characters",
          },
        })}
      />

      <Input
        label="Code"
        requiredMark
        placeholder="HQ"
        disabled={mode === "edit"}
        error={errors.code?.message}
        hint={
          mode === "edit"
            ? "Location code cannot be changed here."
            : undefined
        }
        {...register("code", {
          required: "Location code is required",
          maxLength: {
            value: 50,
            message: "Maximum 50 characters",
          },
        })}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Floor"
          requiredMark
          type="number"
          min="0"
          step="1"
          placeholder="1"
          error={errors.floor?.message}
          {...register("floor", {
            required: "Floor is required",
            valueAsNumber: true,
            min: {
              value: 0,
              message: "Floor cannot be less than 0",
            },
            validate: (value) =>
              Number.isInteger(value) || "Floor must be a whole number",
          })}
        />

        {mode === "create" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Owner <span className="text-rose-500">*</span>
            </label>

            <select
              disabled={ownersLoading || loading}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${
                errors.ownerId
                  ? "border-rose-400"
                  : "border-slate-300"
              }`}
              defaultValue={initialValues?.ownerId ?? ""}
              {...register("ownerId", {
                required: "Owner is required",
                valueAsNumber: true,
              })}
            >
              <option value="">
                {ownersLoading
                  ? "Loading owners..."
                  : "Select an owner"}
              </option>

              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.firstName} {owner.lastName} (@
                  {owner.username})
                </option>
              ))}
            </select>

            {errors.ownerId && (
              <p className="mt-1.5 text-xs text-rose-600">
                {errors.ownerId.message}
              </p>
            )}

            {!ownersLoading && owners.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600">
                No users with the OWNER role are available.
              </p>
            )}

            <p className="mt-1.5 text-xs text-slate-500">
              Only users with the OWNER role can be selected.
            </p>
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
        {...register("address")}
      />

      <Input
        label="Phone"
        placeholder="012 345 678"
        {...register("phone")}
      />

      <div>
        <Input
          label="Timezone"
          requiredMark
          list="location-timezones"
          placeholder="Asia/Phnom_Penh"
          error={errors.timeZone?.message}
          hint="Use an IANA timezone such as Asia/Phnom_Penh."
          {...register("timeZone", {
            required: "Timezone is required",
            maxLength: {
              value: 64,
              message: "Maximum 64 characters",
            },
          })}
        />

        <datalist id="location-timezones">
          {commonTimezones.map((timezone) => (
            <option key={timezone} value={timezone} />
          ))}
        </datalist>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          {mode === "create"
            ? "Create Location"
            : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
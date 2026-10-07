
import { useForm } from "react-hook-form";

import { Button, Input } from "../../../components/ui";

export interface LocationFormValues {
  name: string;
  code: string;
  address: string;
  phone: string;
  timeZone: string;
}

interface LocationFormProps {
  initialValues?: Partial<LocationFormValues>;

  mode: "create" | "edit";

  loading?: boolean;

  onSubmit: (values: LocationFormValues) => Promise<void>;
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
          mode === "edit" ? "Location code cannot be changed here." : undefined
        }
        {...register("code", {
          required: "Location code is required",
          maxLength: {
            value: 50,
            message: "Maximum 50 characters",
          },
        })}
      />

      <Input
        label="Address"
        placeholder="123 Main Street"
        {...register("address")}
      />

      <Input label="Phone" placeholder="012 345 678" {...register("phone")} />

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
          {mode === "create" ? "Create Location" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

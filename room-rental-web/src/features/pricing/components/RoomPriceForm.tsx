import { Controller, useForm } from "react-hook-form";
import {
  CalendarDays,
  DollarSign,
  DoorOpen,
} from "../../../components/ui/MaterialIcon.tsx";
import { Button, Input, Select } from "../../../components/ui";
import type { PricingUnitOption } from "../config/pricingUnits";
import type { RoomResponse } from "../../rooms/types/room";

export interface RoomPriceFormValues {
  roomId: string;
  pricingUnitId: string;
  price: number | "";
  currencyCode: string;
  effectiveFrom: string;
  effectiveTo: string;
}

interface RoomPriceFormProps {
  mode: "create" | "edit";
  pricingUnits: PricingUnitOption[];
  rooms: RoomResponse[];
  initialValues?: Partial<RoomPriceFormValues>;
  loading?: boolean;
  onCancel?: () => void;
  onSubmit: (values: RoomPriceFormValues) => Promise<void>;
}

export function RoomPriceForm({
  mode,
  pricingUnits,
  rooms,
  initialValues,
  loading = false,
  onCancel,
  onSubmit,
}: RoomPriceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RoomPriceFormValues>({
    defaultValues: {
      roomId: initialValues?.roomId ?? "",
      pricingUnitId: initialValues?.pricingUnitId ?? "",
      price: initialValues?.price ?? "",
      currencyCode: initialValues?.currencyCode ?? "USD",
      effectiveFrom: initialValues?.effectiveFrom ?? "",
      effectiveTo: initialValues?.effectiveTo ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {mode === "create" && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <DoorOpen size={16} className="text-indigo-500" /> Room selection
          </div>
          <Controller
            name="roomId"
            control={control}
            rules={{ required: "Room is required" }}
            render={({ field, fieldState }) => (
              <Select
                id="price-room"
                label="Room"
                requiredMark
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                error={fieldState.error?.message}
                options={[
                  { value: "", label: "Choose a room..." },
                  ...rooms.map((room) => ({
                    value: String(room.id),
                    label: `${room.roomNumber} — ${room.name} · ${room.locationName}`,
                  })),
                ]}
              />
            )}
          />
          <p className="mt-2 text-xs text-slate-500">
            Room options are loaded from your rooms API.
          </p>
        </div>
      )}

      {mode === "create" && (
        <Controller
          name="pricingUnitId"
          control={control}
          rules={{ required: "Pricing unit is required" }}
          render={({ field, fieldState }) => (
            <Select
              label="Pricing unit"
              requiredMark
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              error={fieldState.error?.message}
              options={[
                { value: "", label: "Select pricing unit" },
                ...pricingUnits.map((unit) => ({
                  value: String(unit.id),
                  label: `${unit.name} (${unit.code})`,
                })),
              ]}
            />
          )}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <Input
          label="Price"
          requiredMark
          type="number"
          min={0}
          step="0.01"
          placeholder="10.00"
          error={errors.price?.message}
          {...register("price", {
            required: "Price is required",
            setValueAs: (v) => (v === "" ? "" : Number(v)),
            min: { value: 0, message: "Price cannot be negative" },
          })}
        />
        <Input
          label="Currency"
          requiredMark
          maxLength={3}
          placeholder="USD"
          error={errors.currencyCode?.message}
          {...register("currencyCode", {
            required: "Currency is required",
            minLength: { value: 3, message: "Use a 3-letter currency code" },
            maxLength: { value: 3, message: "Use a 3-letter currency code" },
          })}
        />
      </div>

      {mode === "create" && (
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <CalendarDays size={16} className="text-indigo-500" /> Effective
            period
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
            placeholder=" "
              label="Effective from"
              requiredMark
              type="date"
              error={errors.effectiveFrom?.message}
              {...register("effectiveFrom", {
                required: "Effective date is required",
              })}
            />
            <Input
              label="Effective to"
              placeholder=" "
              type="date"
              hint="Optional — leave blank for no end date."
              {...register("effectiveTo")}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          loading={loading}
          leftIcon={<DollarSign size={16} />}
        >
          {mode === "create" ? "Create price" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

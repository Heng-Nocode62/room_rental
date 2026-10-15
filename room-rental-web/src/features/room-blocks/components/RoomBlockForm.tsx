import { useForm } from "react-hook-form";

import { Button, Input, Select, Textarea } from "../../../components/ui";

import type { RoomBlockType } from "../types/roomBlock";

import type { RoomBlockRoomOption } from "../types/roomBlockForm";

import {
  BLOCK_TYPE_OPTIONS,
  formatBlockDateTime,
  formatDuration,
} from "../utils/roomBlockUtils";

import {
  RoomBlockTimeForm,
  type RoomBlockTimeValues,
} from "./RoomBlockTimeForm";

export interface RoomBlockFormValues {
  roomId: string;

  blockType: RoomBlockType;

  startDate: string;
  startTime: string;

  endDate: string;
  endTime: string;

  reason: string;
  notes: string;
}

interface RoomBlockFormProps {
  rooms: RoomBlockRoomOption[];

  onSubmit: (values: RoomBlockFormValues) => Promise<void>;

  onCancel?: () => void;

  loading?: boolean;

  timeError?: string | undefined;

  /** Server error message */
  error?: string | null;
}

export function RoomBlockForm({
  rooms,
  onSubmit,
  onCancel,
  loading = false,
  timeError,
  error,
}: RoomBlockFormProps) {
  const { register, handleSubmit, watch, setValue } =
    useForm<RoomBlockFormValues>({
      defaultValues: {
        roomId: "",

        blockType: "MAINTENANCE",

        startDate: "",
        startTime: "",

        endDate: "",
        endTime: "",

        reason: "",
        notes: "",
      },
    });

  const roomId = watch("roomId");
  const blockType = watch("blockType");
  const reason = watch("reason") ?? "";

  const selectedRoom = rooms.find((room) => String(room.id) === roomId);

  const timeValues: RoomBlockTimeValues = {
    startDate: watch("startDate"),

    startTime: watch("startTime"),

    endDate: watch("endDate"),

    endTime: watch("endTime"),
  };

  const handleTimeChange = (values: RoomBlockTimeValues) => {
    setValue("startDate", values.startDate);

    setValue("startTime", values.startTime);

    setValue("endDate", values.endDate);

    setValue("endTime", values.endTime);
  };

  const timesComplete =
    Boolean(timeValues.startDate) &&
    Boolean(timeValues.startTime) &&
    Boolean(timeValues.endDate) &&
    Boolean(timeValues.endTime);

  const startIso = `${timeValues.startDate}T${timeValues.startTime}`;
  const endIso = `${timeValues.endDate}T${timeValues.endTime}`;
  const duration = timesComplete ? formatDuration(startIso, endIso) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* 1 — Room */}
      <Section step={1} title="Room">
        <Select
          label="Room"
          requiredMark
          placeholder="Select a room"
          value={roomId}
          disabled={rooms.length === 0}
          onChange={(event) =>
            setValue("roomId", event.target.value, {
              shouldValidate: true,
            })
          }
          options={rooms.map((room) => ({
            value: String(room.id),

            label: `${room.roomNumber} · ${room.name} · ${room.locationName}`,
          }))}
        />

        {rooms.length === 0 && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            No rooms are available to block.
          </p>
        )}

        {selectedRoom && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {selectedRoom.roomNumber} · {selectedRoom.name}
              </p>

              <p className="mt-0.5 text-sm text-slate-500">
                {selectedRoom.locationName}
              </p>
            </div>

            <span className="rounded-md bg-white px-2 py-1 text-xs text-slate-500 ring-1 ring-inset ring-slate-200">
              {selectedRoom.timeZone}
            </span>
          </div>
        )}
      </Section>

      {/* 2 — Type */}
      <Section step={2} title="Block type">
        <div
          role="radiogroup"
          aria-label="Block type"
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {BLOCK_TYPE_OPTIONS.map((option) => {
            const selected = blockType === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setValue("blockType", option.value)}
                className={[
                  "rounded-xl border p-3 text-left transition",
                  selected
                    ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                ].join(" ")}
              >
                <span className="block text-sm font-medium text-slate-900">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* 3 — Period */}
      <Section
        step={3}
        title="Block period"
        hint="Choose when the room should be unavailable."
      >
        <RoomBlockTimeForm
          values={timeValues}
          onChange={handleTimeChange}
          timezone={selectedRoom?.timeZone ?? "Select a room first"}
          error={timeError}
        />

        {selectedRoom && timesComplete && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Room <span className="font-semibold">{selectedRoom.roomNumber}</span>{" "}
            will be unavailable from{" "}
            <span className="font-semibold">
              {formatBlockDateTime(startIso)}
            </span>{" "}
            to{" "}
            <span className="font-semibold">{formatBlockDateTime(endIso)}</span>
            {duration ? ` (${duration})` : ""}.
          </p>
        )}
      </Section>

      {/* 4 — Details */}
      <Section step={4} title="Details" hint="Optional.">
        <div>
          <Input
            label="Reason"
            {...register("reason")}
            placeholder="Why is the room unavailable?"
            maxLength={255}
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {reason.length}/255
          </p>
        </div>

        <Textarea
          label="Notes"
          {...register("notes")}
          placeholder="Additional information..."
        />
      </Section>

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

        <Button type="submit" loading={loading} disabled={!roomId || !timesComplete}>
          Create room block
        </Button>
      </div>
    </form>
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

import { useForm } from "react-hook-form";

import { Button, Input, Select, Textarea } from "../../../components/ui";

import type { RoomBlockType } from "../types/roomBlock";

import type { RoomBlockRoomOption } from "../types/roomBlockForm";

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

  loading?: boolean;

  timeError?: string | undefined;
}

export function RoomBlockForm({
  rooms,
  onSubmit,
  loading = false,
  timeError,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Select
        label="Room"
        requiredMark
        placeholder="Select a room"
        value={roomId}
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

      {selectedRoom && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-900">
            {selectedRoom.name}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {selectedRoom.locationName}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Timezone: {selectedRoom.timeZone}
          </p>
        </div>
      )}

      <Select
        label="Block type"
        requiredMark
        value={watch("blockType")}
        onChange={(event) =>
          setValue("blockType", event.target.value as RoomBlockType)
        }
        options={[
          {
            value: "MAINTENANCE",
            label: "Maintenance",
          },
          {
            value: "CLEANING",
            label: "Cleaning",
          },
          {
            value: "PRIVATE_EVENT",
            label: "Private event",
          },
          {
            value: "RENOVATION",
            label: "Renovation",
          },
          {
            value: "OTHER",
            label: "Other",
          },
        ]}
      />

      <RoomBlockTimeForm
        values={timeValues}
        onChange={handleTimeChange}
        timezone={selectedRoom?.timeZone ?? "Select a room first"}
        error={timeError}
      />

      <Input
        label="Reason"
        value={watch("reason")}
        {...register("reason")}
        placeholder="Why is the room unavailable?"
        maxLength={255}
      />

      <Textarea
        label="Notes"
        value={watch("notes")}
        {...register("notes")}
        placeholder="Additional information..."
      />

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          loading={loading}
          disabled={
            !roomId ||
            !timeValues.startDate ||
            !timeValues.startTime ||
            !timeValues.endDate ||
            !timeValues.endTime
          }
        >
          Create Room Block
        </Button>
      </div>
    </form>
  );
}

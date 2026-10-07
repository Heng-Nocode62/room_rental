// src/features/room-blocks/components/RoomBlockTimeForm.tsx

import { Input } from "../../../components/ui";

export interface RoomBlockTimeValues {
  startDate: string;
  startTime: string;

  endDate: string;
  endTime: string;
}

interface RoomBlockTimeFormProps {
  values: RoomBlockTimeValues;

  onChange: (values: RoomBlockTimeValues) => void;

  timezone: string;

  error?: string;
}

export function RoomBlockTimeForm({
  values,
  onChange,
  timezone,
  error,
}: RoomBlockTimeFormProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Block period</h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose when the room should be unavailable.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Start date"
          placeholder=" "
          required
          type="date"
          value={values.startDate}
          onChange={(event) =>
            onChange({
              ...values,

              startDate: event.target.value,
            })
          }
        />

        <Input
          label="Start time"
          required
          type="time"
          value={values.startTime}
          onChange={(event) =>
            onChange({
              ...values,

              startTime: event.target.value,
            })
          }
        />

        <Input
          label="End date"
          placeholder=" "
          required
          type="date"
          value={values.endDate}
          onChange={(event) =>
            onChange({
              ...values,

              endDate: event.target.value,
            })
          }
        />

        <Input
          label="End time"
          required
          type="time"
          value={values.endTime}
          onChange={(event) =>
            onChange({
              ...values,

              endTime: event.target.value,
            })
          }
        />
      </div>

      <div className="rounded-lg bg-slate-50 px-4 py-3">
        <p className="text-xs text-slate-500">Room timezone</p>

        <p className="mt-1 text-sm font-medium text-slate-700">{timezone}</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

// src/features/room-blocks/components/RoomBlockTimeForm.tsx

import { Input } from "../../../components/ui";

import { addMinutes } from "../utils/roomBlockUtils";

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

const QUICK_DURATIONS = [
  { label: "+1 hour", minutes: 60 },
  { label: "+2 hours", minutes: 120 },
  { label: "+4 hours", minutes: 240 },
  { label: "+1 day", minutes: 1440 },
];

export function RoomBlockTimeForm({
  values,
  onChange,
  timezone,
  error,
}: RoomBlockTimeFormProps) {
  const canQuickSet = Boolean(values.startDate && values.startTime);

  const setEndFromStart = (minutes: number) => {
    const end = addMinutes(values.startDate, values.startTime, minutes);

    if (end) onChange({ ...values, endDate: end.date, endTime: end.time });
  };

  const setEndOfDay = () =>
    onChange({ ...values, endDate: values.startDate, endTime: "23:59" });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Start */}
        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Starts
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start date"
              placeholder=" "
              required
              type="date"
              value={values.startDate}
              onChange={(event) =>
                onChange({ ...values, startDate: event.target.value })
              }
            />

            <Input
              label="Start time"
              required
              type="time"
              value={values.startTime}
              onChange={(event) =>
                onChange({ ...values, startTime: event.target.value })
              }
            />
          </div>
        </div>

        {/* End */}
        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Ends
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="End date"
              placeholder=" "
              required
              type="date"
              value={values.endDate}
              onChange={(event) =>
                onChange({ ...values, endDate: event.target.value })
              }
            />

            <Input
              label="End time"
              required
              type="time"
              value={values.endTime}
              onChange={(event) =>
                onChange({ ...values, endTime: event.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Quick durations */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">Quick end:</span>

        {QUICK_DURATIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            disabled={!canQuickSet}
            onClick={() => setEndFromStart(option.minutes)}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {option.label}
          </button>
        ))}

        <button
          type="button"
          disabled={!values.startDate}
          onClick={setEndOfDay}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          End of day
        </button>

        {!canQuickSet && (
          <span className="text-xs text-slate-400">Set a start first.</span>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
        <div>
          <p className="text-xs text-slate-500">Room timezone</p>
          <p className="mt-0.5 text-sm font-medium text-slate-700">
            {timezone}
          </p>
        </div>

        <p className="max-w-48 text-right text-xs text-slate-400">
          Times are entered in the room's local time.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
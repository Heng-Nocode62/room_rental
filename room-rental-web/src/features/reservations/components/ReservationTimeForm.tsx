import { Input } from "../../../components/ui";

export interface ReservationTimeFormValues {
  startDate: string;
  startTime: string;

  endDate: string;
  endTime: string;
}

interface ReservationTimeFormProps {
  values: ReservationTimeFormValues;

  onChange: (values: ReservationTimeFormValues) => void;

  timezone: string;

  error?: string;
}

export function ReservationTimeForm({
  values,
  onChange,
  timezone,
  error,
}: ReservationTimeFormProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Reservation time
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Adjust the reservation period before creating it.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Start date"
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

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

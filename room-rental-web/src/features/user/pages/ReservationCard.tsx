import { DateTime } from "luxon";
import type { ReservationResponse } from "../../reservations/types/reservation";
import { Card, Icon, StatusBadge, Button } from "../components/UserUI";


export function ReservationCard({
  reservation,
  onView,
  onCancel,
}: {
  reservation: ReservationResponse;
  onView: () => void;
  onCancel: () => void;
}) {
  const start = DateTime.fromISO(
    reservation.startAt,
  );

  const end = DateTime.fromISO(
    reservation.endAt,
  );

  const canCancel =
    reservation.status === "PENDING" ||
    reservation.status === "CONFIRMED";

  return (
    <Card className="overflow-hidden transition hover:shadow-lg">
      <div className="p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Icon name="building" size={24} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-slate-950 dark:text-white">
                  {reservation.roomName}
                </p>

                <StatusBadge status={reservation.status} />
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {reservation.roomNumber}
              </p>

              <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                <p className="inline-flex items-center gap-2">
                  <Icon
                    name="calendar"
                    size={15}
                  />
                  {start.toFormat("EEE, dd MMM yyyy")}
                </p>

                <p className="inline-flex items-center gap-2">
                  <Icon
                    name="clock"
                    size={15}
                  />
                  {start.toFormat("HH:mm")} –{" "}
                  {end.toFormat("HH:mm")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
            <p className="text-lg font-black text-slate-950 dark:text-white">
              {reservation.totalAmount.toFixed(2)}{" "}
              <span className="text-xs font-semibold text-slate-400">
                {reservation.currencyCode}
              </span>
            </p>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onView}
              >
                View details
              </Button>

              {canCancel && (
                <Button
                  variant="danger"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {reservation.purpose && (
          <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Purpose:
            </span>{" "}
            {reservation.purpose}
          </div>
        )}
      </div>
    </Card>
  );
}
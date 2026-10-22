import { DateTime } from "luxon";
import type { ReservationResponse } from "../../reservations/types/reservation";
import { Card, Icon, StatusBadge, Button } from "../components/UserUI";

interface ReservationCardProps {
  reservation: ReservationResponse;
  onView: () => void;
  onCancel: () => void;
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

function formatAmount(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    // Unknown currency code: fall back to a plain number.
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
}

/** Short hint such as "Starts in 2 hours" or "In progress". */
function getTimingHint(start: DateTime, end: DateTime, status: string) {
  if (status === "CANCELLED" || status === "COMPLETED") return null;

  const now = DateTime.now();

  if (now >= start && now <= end) return "In progress";
  if (now < start) return `Starts ${start.toRelative({ base: now })}`;
  return null;
}

export function ReservationCard({
  reservation,
  onView,
  onCancel,
}: ReservationCardProps) {
  const start = DateTime.fromISO(reservation.startAt);
  const end = DateTime.fromISO(reservation.endAt);
  const validDates = start.isValid && end.isValid;

  const spansMultipleDays = validDates && !start.hasSame(end, "day");

  const durationLabel = validDates
    ? formatDuration(Math.round(end.diff(start, "minutes").minutes))
    : "";

  const timingHint = validDates
    ? getTimingHint(start, end, reservation.status)
    : null;

  const canCancel =
    reservation.status === "PENDING" || reservation.status === "CONFIRMED";

  const isInactive =
    reservation.status === "CANCELLED" || reservation.status === "COMPLETED";

  return (
    <Card
      className={`overflow-hidden transition hover:shadow-lg ${
        reservation.status === "CANCELLED" ? "opacity-75" : ""
      }`}
    >
      <article
        className="p-4 sm:p-5"
        aria-label={`Reservation for ${reservation.roomName}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: room + schedule */}
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14 ${
                isInactive
                  ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
              }`}
            >
              <Icon name="building" size={24} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="truncate text-base font-bold text-slate-950 dark:text-white">
                  {reservation.roomName}
                </h3>

                <StatusBadge status={reservation.status} />
              </div>

              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Room {reservation.roomNumber}
              </p>

              {validDates ? (
                <dl className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Date</dt>
                    <Icon name="calendar" size={15} />
                    <dd>
                      {spansMultipleDays
                        ? `${start.toFormat("EEE, dd MMM")} – ${end.toFormat(
                            "EEE, dd MMM yyyy",
                          )}`
                        : start.toFormat("EEE, dd MMM yyyy")}
                    </dd>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <dt className="sr-only">Time</dt>
                    <Icon name="clock" size={15} />
                    <dd>
                      {start.toFormat("HH:mm")} – {end.toFormat("HH:mm")}
                      {durationLabel && (
                        <span className="ml-2 text-slate-400 dark:text-slate-500">
                          ({durationLabel})
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                  Schedule unavailable
                </p>
              )}

              {timingHint && (
                <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                  {timingHint}
                </p>
              )}
            </div>
          </div>

          {/* Right: price + actions */}
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:shrink-0 sm:items-end sm:border-t-0 sm:pt-0">
            <div className="flex items-baseline justify-between gap-3 sm:block sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 sm:hidden">
                Total
              </p>

              <p className="text-lg font-black tabular-nums text-slate-950 dark:text-white">
                {formatAmount(reservation.totalAmount, reservation.currencyCode)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex [&>button]:w-full sm:[&>button]:w-auto">
              <Button variant="secondary" onClick={onView}>
                View details
              </Button>

              {canCancel && (
                <Button variant="danger" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {reservation.purpose && (
          <div className="mt-4 border-t border-slate-200 pt-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Purpose:
            </span>{" "}
            <span className="line-clamp-2 break-words">
              {reservation.purpose}
            </span>
          </div>
        )}
      </article>
    </Card>
  );
}
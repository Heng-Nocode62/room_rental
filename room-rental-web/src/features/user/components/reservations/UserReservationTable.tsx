import {
  CreditCard,
  Eye,
  XCircle,
} from "../../../../components/ui/MaterialIcon.tsx";
import {
  ActionMenu,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../../components/ui";
import type { ReservationResponse } from "../../../reservations/types/reservation";

/* --------------------------------- Helpers --------------------------------- */

/** Parse an API timestamp. Values without a timezone are treated as UTC. */
function parseDate(value: string): Date | null {
  if (!value) return null;
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value);
  const normalized = hasZone ? value : `${value.replace(" ", "T")}Z`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

const dateFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});
const dayMonthFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDuration(start: Date, end: Date) {
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  if (mins <= 0) return "";
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const minutes = mins % 60;
  const parts = [
    days ? `${days}d` : "",
    hours ? `${hours}h` : "",
    minutes ? `${minutes}m` : "",
  ].filter(Boolean);
  return parts.join(" ");
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  PENDING: {
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  COMPLETED: {
    badge: "bg-sky-50 text-sky-700 ring-sky-600/20",
    dot: "bg-sky-500",
  },
  CANCELLED: {
    badge: "bg-rose-50 text-rose-700 ring-rose-600/20",
    dot: "bg-rose-500",
  },
};
const DEFAULT_STATUS = {
  badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
  dot: "bg-slate-400",
};

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? DEFAULT_STATUS;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {titleCase(status.replace(/_/g, " "))}
    </span>
  );
}

function Schedule({ startAt, endAt }: { startAt: string; endAt: string }) {
  const start = parseDate(startAt);
  const end = parseDate(endAt);

  if (!start || !end) {
    return <span className="text-sm text-slate-500">—</span>;
  }

  const duration = formatDuration(start, end);

  if (sameDay(start, end)) {
    return (
      <div className="whitespace-nowrap">
        <p className="text-sm font-medium text-slate-900">{dateFmt.format(start)}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {timeFmt.format(start)} – {timeFmt.format(end)}
          {duration && (
            <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
              {duration}
            </span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="whitespace-nowrap">
      <p className="text-sm text-slate-900">
        <span className="font-medium">{dayMonthFmt.format(start)}</span>
        <span className="ml-1.5 text-xs text-slate-500">{timeFmt.format(start)}</span>
      </p>
      <p className="mt-0.5 text-sm text-slate-900">
        <span className="font-medium">{dayMonthFmt.format(end)}</span>
        <span className="ml-1.5 text-xs text-slate-500">{timeFmt.format(end)}</span>
        {duration && (
          <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
            {duration}
          </span>
        )}
      </p>
    </div>
  );
}

/* ---------------------------------- Table ---------------------------------- */

export function UserReservationTable({
  reservations,
  onView,
  onPayment,
  onCancel,
}: {
  reservations: ReservationResponse[];
  onView: (x: ReservationResponse) => void;
  onPayment: (x: ReservationResponse) => void;
  onCancel: (x: ReservationResponse) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Reference</TableHeaderCell>
            <TableHeaderCell>Room</TableHeaderCell>
            <TableHeaderCell>Schedule</TableHeaderCell>
            <TableHeaderCell className="text-right">Amount</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell className="text-right">Action</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reservations.length === 0 && (
            <TableRow>
              <TableCell className="py-12 text-center text-sm text-slate-500">
                No reservations found.
              </TableCell>
            </TableRow>
          )}

          {reservations.map((r) => (
            <TableRow key={r.id} className="transition-colors hover:bg-slate-50/70">
              <TableCell>
                <p className="font-semibold text-slate-900">{r.referenceNo}</p>
                <p
                  className={`mt-0.5 max-w-[14rem] truncate text-xs ${
                    r.purpose ? "text-slate-500" : "italic text-slate-400"
                  }`}
                  title={r.purpose || undefined}
                >
                  {r.purpose || "No purpose"}
                </p>
              </TableCell>

              <TableCell>
                <p className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {r.roomNumber}
                </p>
                <p className="mt-1 text-xs text-slate-500">{r.roomName}</p>
              </TableCell>

              <TableCell>
                <Schedule startAt={r.startAt} endAt={r.endAt} />
              </TableCell>

              <TableCell className="whitespace-nowrap text-right font-semibold tabular-nums text-slate-900">
                {formatAmount(r.totalAmount, r.currencyCode)}
              </TableCell>

              <TableCell>
                <StatusBadge status={r.status} />
              </TableCell>

              <TableCell className="text-right">
                <ActionMenu
                  items={[
                    {
                      label: "View",
                      icon: <Eye size={15} />,
                      onClick: () => onView(r),
                    },
                    ...(r.status === "PENDING"
                      ? [
                          {
                            label: "Pay",
                            icon: <CreditCard size={15} />,
                            tone: "success" as const,
                            onClick: () => onPayment(r),
                          },
                        ]
                      : []),
                    ...(r.status === "PENDING" || r.status === "CONFIRMED"
                      ? [
                          {
                            label: "Cancel",
                            icon: <XCircle size={15} />,
                            tone: "danger" as const,
                            dividerBefore: true,
                            onClick: () => onCancel(r),
                          },
                        ]
                      : []),
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
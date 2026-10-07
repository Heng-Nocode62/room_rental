import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  DoorOpen,
  Eye,
  LogIn,
  LogOut,
  XCircle,
} from "../../../components/ui/MaterialIcon.tsx";
import { DateTime } from "luxon";
import type { ReactNode } from "react";
import {
  ActionMenu,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../components/ui";
import type { ReservationResponse } from "../types/reservation";
import { ReservationStatusBadge } from "./ReservationStatusBadge";

interface Props {
  reservations: ReservationResponse[];
  onView: (item: ReservationResponse) => void;
  onAction: (
    action: "confirm" | "cancel" | "checkIn" | "checkOut",
    item: ReservationResponse,
  ) => void;
  onPayment?: (item: ReservationResponse) => void;
}

const ZONE = "Asia/Phnom_Penh";

const parse = (value: string) => DateTime.fromISO(value).setZone(ZONE);

const formatDuration = (start: DateTime, end: DateTime) => {
  const { days, hours, minutes } = end
    .diff(start, ["days", "hours", "minutes"])
    .toObject();

  const parts = [
    days ? `${Math.floor(days)}d` : "",
    hours ? `${Math.floor(hours)}h` : "",
    minutes ? `${Math.round(minutes)}m` : "",
  ].filter(Boolean);

  return parts.slice(0, 2).join(" ") || "—";
};

type RowItem = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  tone?: "success" | "danger" | "neutral";
  dividerBefore?: boolean;
};

function ScheduleCell({ startAt, endAt }: { startAt: string; endAt: string }) {
  const start = parse(startAt);
  const end = parse(endAt);
  const sameDay = start.hasSame(end, "day");

  return (
    <div className="flex items-start gap-2.5 whitespace-nowrap">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <CalendarDays size={15} />
      </div>

      <div>
        {sameDay ? (
          <>
            <p className="text-sm font-medium text-slate-800">
              {start.toFormat("ccc, dd MMM")}
            </p>
            <p className="text-xs text-slate-500">
              {start.toFormat("HH:mm")} – {end.toFormat("HH:mm")}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-800">
              {start.toFormat("dd MMM · HH:mm")}
            </p>
            <p className="text-xs text-slate-500">
              → {end.toFormat("dd MMM · HH:mm")}
            </p>
          </>
        )}
      </div>

      <span className="mt-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
        {formatDuration(start, end)}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <CalendarDays size={22} />
      </div>
      <p className="text-sm font-semibold text-slate-800">
        No reservations found
      </p>
      <p className="max-w-xs text-sm text-slate-500">
        Try changing your filters, or create a new reservation.
      </p>
    </div>
  );
}

export function ReservationTable({
  reservations,
  onView,
  onAction,
  onPayment,
}: Props) {
  if (reservations.length === 0) {
    return (
      <div className="rounded-xl border border-[#dadce0] bg-white">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#dadce0] bg-white shadow-sm">
      <Table>
        <TableHead>
          <TableRow className="bg-slate-50/80">
            <TableHeaderCell>Reservation</TableHeaderCell>
            <TableHeaderCell>Room</TableHeaderCell>
            <TableHeaderCell>Contact</TableHeaderCell>
            <TableHeaderCell>Schedule</TableHeaderCell>
            <TableHeaderCell className="text-right">Amount</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {reservations.map((reservation) => {
            /*
             * Build the action list, and pull out the most likely
             * "next step" so it can be shown as an inline button.
             */
            const items: RowItem[] = [
              {
                label: "View",
                icon: <Eye size={15} />,
                onClick: () => onView(reservation),
              },
            ];

            let primary: RowItem | null = null;

            if (reservation.status === "PENDING") {
              if (onPayment) {
                primary = {
                  label: "Pay",
                  icon: <CreditCard size={14} />,
                  tone: "success",
                  onClick: () => onPayment(reservation),
                };
              }

              items.push({
                label: "Confirm manually",
                icon: <CheckCircle2 size={15} />,
                tone: "success",
                onClick: () => onAction("confirm", reservation),
              });
              items.push({
                label: "Cancel",
                icon: <XCircle size={15} />,
                tone: "danger",
                dividerBefore: true,
                onClick: () => onAction("cancel", reservation),
              });

              if (!primary) {
                primary = {
                  label: "Confirm",
                  icon: <CheckCircle2 size={14} />,
                  tone: "success",
                  onClick: () => onAction("confirm", reservation),
                };
              }
            } else if (reservation.status === "CONFIRMED") {
              primary = {
                label: "Check in",
                icon: <LogIn size={14} />,
                tone: "success",
                onClick: () => onAction("checkIn", reservation),
              };
              items.push({
                label: "Cancel",
                icon: <XCircle size={15} />,
                tone: "danger",
                dividerBefore: true,
                onClick: () => onAction("cancel", reservation),
              });
            } else if (reservation.status === "CHECKED_IN") {
              primary = {
                label: "Check out",
                icon: <LogOut size={14} />,
                tone: "success",
                onClick: () => onAction("checkOut", reservation),
              };
            }

            /*
             * Keep the menu free of duplicates: the primary action lives
             * on the inline button, everything else stays in the menu.
             */
            const menuItems = primary
              ? [
                  items[0],
                  ...items
                    .slice(1)
                    .filter((item) => item.label !== primary!.label),
                ]
              : items;

            // Avoid an orphaned divider right after "View".
            if (menuItems.length > 1 && menuItems[1].dividerBefore && menuItems.length === 2) {
              menuItems[1] = { ...menuItems[1], dividerBefore: true };
            }

            const initial =
              reservation.contactName?.trim().charAt(0).toUpperCase() || "?";

            return (
              <TableRow
                key={reservation.id}
                className="transition-colors hover:bg-slate-50/80"
              >
                {/* RESERVATION */}
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onView(reservation)}
                    className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
                  >
                    {reservation.referenceNo}
                  </button>
                  <p
                    className="mt-0.5 max-w-48 truncate text-xs text-slate-500"
                    title={reservation.purpose || undefined}
                  >
                    {reservation.purpose || "No purpose"}
                  </p>
                </TableCell>

                {/* ROOM */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <DoorOpen size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {reservation.roomNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        {reservation.roomName}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* CONTACT */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {reservation.contactName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {reservation.contactPhone ||
                          reservation.companyName ||
                          "—"}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* SCHEDULE */}
                <TableCell>
                  <ScheduleCell
                    startAt={reservation.startAt}
                    endAt={reservation.endAt}
                  />
                </TableCell>

                {/* AMOUNT */}
                <TableCell className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-slate-900">
                    {reservation.totalAmount.toFixed(2)}{" "}
                    <span className="text-xs font-medium text-slate-500">
                      {reservation.currencyCode}
                    </span>
                  </p>
                  <p className="text-xs tabular-nums text-slate-400">
                    {reservation.unitPrice.toFixed(2)} / unit
                  </p>
                </TableCell>

                {/* STATUS */}
                <TableCell>
                  <ReservationStatusBadge status={reservation.status} />
                </TableCell>

                {/* ACTIONS */}
                <TableCell>
                  <div className="flex items-center justify-end gap-1.5">
                    {primary && (
                      <button
                        type="button"
                        onClick={primary.onClick}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        {primary.icon}
                        {primary.label}
                      </button>
                    )}

                    <ActionMenu items={menuItems} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
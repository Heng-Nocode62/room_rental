import { DateTime } from "luxon";
import { MapPin, CalendarDays } from "../../../components/ui/MaterialIcon.tsx";
import { Button, Modal } from "../../../components/ui";
import type { ReservationResponse } from "../types/reservation";
import { ReservationActions } from "./ReservationActions";
import { ReservationStatusBadge } from "./ReservationStatusBadge";

export type ReservationAction = "confirm" | "cancel" | "checkIn" | "checkOut";

interface Props {
  reservation: ReservationResponse | null;
  onClose: () => void;
  onAction?: (action: ReservationAction, reservation: ReservationResponse) => void;
  loadingAction?: ReservationAction | null;
  showWorkflowActions?: boolean;
  showUserCancel?: boolean;
}

const ZONE = "Asia/Phnom_Penh";

function formatDateTime(value: string) {
  const parsed = DateTime.fromISO(value).setZone(ZONE);
  return parsed.isValid ? parsed.toFormat("dd MMM yyyy, HH:mm") : value;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

export function ReservationDetailsDialog({
  reservation,
  onClose,
  onAction,
  loadingAction = null,
  showWorkflowActions = false,
  showUserCancel = false,
}: Props) {
  if (!reservation) return null;

  const canUserCancel =
    showUserCancel &&
    (reservation.status === "PENDING" || reservation.status === "CONFIRMED");

  return (
    <Modal
      open
      onClose={onClose}
      title={reservation.referenceNo}
      description={`${reservation.roomNumber} · ${reservation.roomName}`}
      size="lg"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <div>
            <p className="text-xs font-medium text-slate-500">Reservation status</p>
            <div className="mt-1">
              <ReservationStatusBadge status={reservation.status} />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-900">
            {reservation.totalAmount.toFixed(2)} {reservation.currencyCode}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Room" value={`${reservation.roomNumber} · ${reservation.roomName}`} />
          <Info label="Pricing" value={`${reservation.pricingUnitCode} · ${reservation.unitPrice.toFixed(2)} ${reservation.currencyCode}`} />
          <Info label="Contact" value={reservation.contactName || "—"} />
          <Info label="Phone" value={reservation.contactPhone || "—"} />
          <Info label="Company" value={reservation.companyName || "—"} />
          <Info label="Reserved by" value={reservation.reservedByName || "—"} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <CalendarDays size={17} className="mt-0.5 text-slate-500" />
            <div>
              <p className="text-xs font-medium text-slate-500">Schedule</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {formatDateTime(reservation.startAt)} → {formatDateTime(reservation.endAt)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <MapPin size={17} className="mt-0.5 text-slate-500" />
            <div>
              <p className="text-xs font-medium text-slate-500">Purpose</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {reservation.purpose || "—"}
              </p>
            </div>
          </div>
        </div>

        {reservation.notes && (
          <div className="rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{reservation.notes}</p>
          </div>
        )}

        {showWorkflowActions && onAction && (
          <div className="border-t border-slate-200 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Available actions
            </p>
            <ReservationActions
              reservation={reservation}
              onConfirm={() => onAction("confirm", reservation)}
              onCancel={() => onAction("cancel", reservation)}
              onCheckIn={() => onAction("checkIn", reservation)}
              onCheckOut={() => onAction("checkOut", reservation)}
              loadingAction={loadingAction}
            />
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          {canUserCancel && onAction && (
            <Button
              variant="danger"
              loading={loadingAction === "cancel"}
              onClick={() => onAction("cancel", reservation)}
            >
              Cancel reservation
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

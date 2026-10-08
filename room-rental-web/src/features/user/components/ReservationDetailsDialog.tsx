import { DateTime } from "luxon";

import type { ReservationResponse } from "../../reservations/types/reservation";

import {
  Button,
  Card,
  Icon,
  Modal,
  StatusBadge,
} from "./UserUI";

export function ReservationDetailsDialog({
  reservation,
  open,
  onClose,
  onCancel,
  loading = false,
}: {
  reservation: ReservationResponse | null;
  open: boolean;
  onClose: () => void;
  onCancel?: () => void;
  loading?: boolean;
}) {
  if (!reservation) return null;

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
    <Modal
      open={open}
      onClose={onClose}
      title={reservation.referenceNo}
      description={`${reservation.roomNumber} · ${reservation.roomName}`}
      size="lg"
    >
      <div className="space-y-5">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status
              </p>

              <div className="mt-2">
                <StatusBadge
                  status={reservation.status}
                />
              </div>
            </div>

            <p className="text-2xl font-black text-slate-950 dark:text-white">
              {reservation.totalAmount.toFixed(2)}{" "}
              <span className="text-sm font-semibold text-slate-400">
                {reservation.currencyCode}
              </span>
            </p>
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          <Info
            icon="building"
            label="Room"
            value={`${reservation.roomNumber} · ${reservation.roomName}`}
          />

          <Info
            icon="calendar"
            label="Date"
            value={start.toFormat(
              "dd MMM yyyy",
            )}
          />

          <Info
            icon="clock"
            label="Time"
            value={`${start.toFormat("HH:mm")} – ${end.toFormat("HH:mm")}`}
          />

          <Info
            icon="sparkles"
            label="Pricing"
            value={`${reservation.pricingUnitCode} · ${reservation.unitPrice.toFixed(2)} ${reservation.currencyCode}`}
          />

          <Info
            icon="user"
            label="Contact"
            value={reservation.contactName || "—"}
          />

          <Info
            icon="phone"
            label="Phone"
            value={
              reservation.contactPhone ||
              "—"
            }
          />
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Purpose
          </p>

          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
            {reservation.purpose || "—"}
          </p>
        </div>

        {reservation.companyName && (
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Company
            </p>

            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
              {reservation.companyName}
            </p>
          </div>
        )}

        {reservation.notes && (
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Notes
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
              {reservation.notes}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
          {canCancel && onCancel && (
            <Button
              variant="danger"
              loading={loading}
              onClick={onCancel}
            >
              Cancel reservation
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon:
    | "building"
    | "calendar"
    | "clock"
    | "sparkles"
    | "user"
    | "phone";
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon name={icon} size={15} />
        <p className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </p>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}
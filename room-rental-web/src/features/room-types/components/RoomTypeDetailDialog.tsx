
import {
  Button,
  Modal,
} from "../../../components/ui";

import type { RoomTypeResponse } from "../types/roomType";

interface RoomTypeDetailDialogProps {
  open: boolean;
  onClose: () => void;
  roomType: RoomTypeResponse | null;
}

export function RoomTypeDetailDialog({
  open,
  onClose,
  roomType,
}: RoomTypeDetailDialogProps) {
  if (!roomType) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={roomType.name}
      description={`Room type · ${roomType.code}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Image */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {roomType.imageUrl ? (
            <img
              src={roomType.imageUrl}
              alt={roomType.name}
              className="h-72 w-full object-cover"
            />
          ) : (
            <div className="flex h-72 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                  <span className="text-xl">🖼</span>
                </div>

                <p className="text-sm font-medium text-slate-600">
                  No image available
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  This room type does not have an image yet.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Header */}

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                {roomType.name}
              </h3>

              <p className="mt-1 font-mono text-sm text-slate-400">
                {roomType.code}
              </p>
            </div>

            <StatusBadge status={roomType.status} />
          </div>
        </div>

        {/* Information */}

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard
            label="Capacity"
            value={
              roomType.capacity !== undefined &&
              roomType.capacity !== null
                ? `${roomType.capacity} people`
                : "—"
            }
          />

          <InfoCard
            label="Status"
            value={roomType.status}
          />
        </div>

        {/* Description */}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Description
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm leading-6 text-slate-600">
              {roomType.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Footer */}

        <div className="flex justify-end border-t border-slate-200 pt-4">
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

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized = status.toUpperCase();

  const className =
    normalized === "ACTIVE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : normalized === "INACTIVE"
        ? "border-slate-200 bg-slate-100 text-slate-600"
        : "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

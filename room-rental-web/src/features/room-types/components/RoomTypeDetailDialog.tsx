import { Edit3 } from "../../../components/ui/MaterialIcon.tsx";

import { Button, Modal } from "../../../components/ui";

import type { RoomTypeResponse } from "../types/roomType";

import { RoomTypeStatusBadge } from "./RoomTypeStatusBadge";

interface RoomTypeDetailDialogProps {
  open: boolean;
  onClose: () => void;
  roomType: RoomTypeResponse | null;
  /** Resolved location name; falls back to the id */
  locationName?: string;
  onEdit?: (roomType: RoomTypeResponse) => void;
}

export function RoomTypeDetailDialog({
  open,
  onClose,
  roomType,
  locationName,
  onEdit,
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
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {roomType.imageUrl ? (
            <img
              src={roomType.imageUrl}
              alt={roomType.name}
              className="h-64 w-full object-cover sm:h-72"
            />
          ) : (
            <div className="flex h-64 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 sm:h-72">
              <div className="text-center">
                <p className="text-5xl font-semibold text-slate-300">
                  {roomType.name.slice(0, 1).toUpperCase()}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  No image yet
                </p>
              </div>
            </div>
          )}

          <div className="absolute right-3 top-3 rounded-full bg-white/90 p-1 shadow">
            <RoomTypeStatusBadge status={roomType.status} />
          </div>
        </div>

        {/* Header */}
        <div>
          <h3 className="text-xl font-semibold text-slate-900">
            {roomType.name}
          </h3>

          <p className="mt-1 font-mono text-sm text-slate-400">
            {roomType.code}
          </p>
        </div>

        {/* Information */}
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoCard
            label="Location"
            value={locationName ?? `#${roomType.locationId}`}
          />

          <InfoCard
            label="Capacity"
            value={
              roomType.capacity !== undefined && roomType.capacity !== null
                ? `${roomType.capacity} ${roomType.capacity === 1 ? "person" : "people"}`
                : "—"
            }
          />

          <InfoCard label="Code" value={roomType.code} mono />
        </div>

        {/* Description */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Description
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
              {roomType.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          {onEdit && (
            <Button
              variant="secondary"
              leftIcon={<Edit3 size={16} />}
              onClick={() => onEdit(roomType)}
            >
              Edit
            </Button>
          )}

          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}

function InfoCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 break-words text-sm font-medium text-slate-800 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
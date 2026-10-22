import { Edit3, Tag } from "../../../components/ui/MaterialIcon.tsx";

import { Button, Modal } from "../../../components/ui";

import type { RoomResponse } from "../types/room";
import { formatMoney, formatPrice, priceUnitLabel } from "../utils/roomUtils";
import { RoomStatusBadge } from "./RoomStatusBadge";

interface Props {
  room: RoomResponse | null;
  onClose: () => void;
  onEdit: (room: RoomResponse) => void;
  onAmenities: (room: RoomResponse) => void;
}

export function RoomDetailDialog({
  room,
  onClose,
  onEdit,
  onAmenities,
}: Props) {
  const amenitiesTotal =
    room?.amenities.reduce(
      (total, amenity) => total + amenity.price * amenity.amount,
      0,
    ) ?? 0;

  return (
    <Modal
      open={!!room}
      onClose={onClose}
      title={room ? `${room.roomNumber} · ${room.name}` : ""}
      description={room ? `${room.locationName} · ${room.roomTypeName}` : ""}
      size="lg"
    >
      {room && (
        <div className="space-y-6">
          {room.imageUrl && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img
                src={room.imageUrl}
                alt={room.name}
                className="max-h-72 w-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <RoomStatusBadge status={room.status} />

            <span className="text-sm text-slate-500">
              Floor {room.floor || "—"} · {room.capacity}{" "}
              {room.capacity === 1 ? "person" : "people"}
            </span>
          </div>

          {/* Pricing */}
          <div>
            <SectionTitle>Pricing</SectionTitle>

            {room.prices.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {room.prices.map((price) => (
                  <div
                    key={`${price.pricingUnitCode}-${price.currencyCode}`}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Per {priceUnitLabel(price.pricingUnitCode) ?? "unit"}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">
                      {formatPrice(price)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No prices set.</p>
            )}
          </div>

          {/* Info */}
          <div>
            <SectionTitle>Details</SectionTitle>

            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Location" value={room.locationName} />
              <Detail label="Room type" value={room.roomTypeName} />
              <Detail label="Room number" value={room.roomNumber} />
              <Detail label="Floor" value={room.floor || "—"} />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <SectionTitle>Amenities</SectionTitle>

            {room.amenities.length ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                {room.amenities.map((amenity) => (
                  <div
                    key={amenity.amenityId}
                    className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {amenity.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {amenity.amount} × ${formatMoney(amenity.price)}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-slate-900">
                      ${formatMoney(amenity.amount * amenity.price)}
                    </span>
                  </div>
                ))}

                <div className="flex items-center justify-between bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-slate-500">Total value</span>
                  <span className="font-semibold text-slate-900">
                    ${formatMoney(amenitiesTotal)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No amenities assigned.</p>
            )}
          </div>

          {/* Description */}
          <div>
            <SectionTitle>Description</SectionTitle>
            <p className="text-sm leading-6 text-slate-700">
              {room.description || "No description."}
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              variant="secondary"
              leftIcon={<Tag size={16} />}
              onClick={() => onAmenities(room)}
            >
              Manage amenities
            </Button>

            <Button
              variant="secondary"
              leftIcon={<Edit3 size={16} />}
              onClick={() => onEdit(room)}
            >
              Edit
            </Button>

            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </h3>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}
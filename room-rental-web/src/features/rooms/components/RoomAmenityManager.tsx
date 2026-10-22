import { useMemo, useState } from "react";
import { Plus } from "../../../components/ui/MaterialIcon.tsx";

import { Button, Input, Select } from "../../../components/ui";

import { useLocationAmenities } from "../hooks/useLocationAmenities";
import { useAddRoomAmenity } from "../hooks/useAddRoomAmenity";

import type { AmenityResponse, RoomAmenityResponse } from "../types/room";
import { formatMoney, getErrorMessage } from "../utils/roomUtils";
import { AssignedAmenityRow } from "./AssignedAmenityRow";
import { QuantityStepper } from "./QuantityStepper";

interface Props {
  roomId: number;
  locationId: number;
  currentAmenities: RoomAmenityResponse[];
}

export function RoomAmenityManager({
  roomId,
  locationId,
  currentAmenities,
}: Props) {
  const [search, setSearch] = useState("");
  const [amenityId, setAmenityId] = useState("");
  const [amount, setAmount] = useState(1);

  const { data: locationAmenities = [], isLoading } = useLocationAmenities(
    locationId,
    true,
  );

  const addMutation = useAddRoomAmenity();

  const currentIds = useMemo(
    () => new Set(currentAmenities.map((amenity) => amenity.amenityId)),
    [currentAmenities],
  );

  // Amenities already on the room are edited in the list above,
  // so only amenities not yet assigned are offered here.
  const availableAmenities = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return locationAmenities
      .filter((amenity) => amenity.status === "ACTIVE")
      .filter((amenity) => !currentIds.has(amenity.id))
      .filter(
        (amenity) => !keyword || amenity.name.toLowerCase().includes(keyword),
      );
  }, [currentIds, locationAmenities, search]);

  const selectedAmenity: AmenityResponse | undefined = locationAmenities.find(
    (amenity) => amenity.id === Number(amenityId),
  );

  const add = async () => {
    if (!selectedAmenity || amount < 1 || amount > selectedAmenity.stockQuantity)
      return;

    try {
      await addMutation.mutateAsync({
        roomId,
        amenityId: selectedAmenity.id,
        amount,
      });

      setAmenityId("");
      setAmount(1);
    } catch {
      // shown through addMutation.error below
    }
  };

  const assignedTotal = currentAmenities.reduce(
    (total, amenity) => total + amenity.price * amenity.amount,
    0,
  );

  const stockLeftFor = (id: number) =>
    locationAmenities.find((amenity) => amenity.id === id)?.stockQuantity ?? 0;

  return (
    <div className="space-y-6">
      {/* Assigned */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Assigned amenities
            </h3>
          </div>

          {currentAmenities.length > 0 && (
            <p className="text-right text-xs text-slate-500">
              Total value
              <span className="block text-base font-semibold text-slate-900">
                ${formatMoney(assignedTotal)}
              </span>
            </p>
          )}
        </div>

        {currentAmenities.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-400">
            No amenities assigned yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {currentAmenities.map((amenity) => (
              <AssignedAmenityRow
                key={amenity.amenityId}
                roomId={roomId}
                amenity={amenity}
                stockLeft={stockLeftFor(amenity.amenityId)}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Add new amenity */}
      <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Add amenity</h3>
        <p className="mt-1 text-xs text-slate-500">
          Amenities not yet on this room. To change an existing one, use the
          amount controls above.
        </p>

        <div className="mt-4 space-y-3">
          <Input
            label="Search"
            placeholder="Search amenities..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Select
              label="Amenity"
              value={amenityId}
              disabled={isLoading || availableAmenities.length === 0}
              onChange={(event) => {
                setAmenityId(event.target.value);
                setAmount(1);
              }}
              options={[
                {
                  value: "",
                  label: isLoading
                    ? "Loading amenities..."
                    : availableAmenities.length === 0
                      ? "No available amenities"
                      : "Select amenity",
                },
                ...availableAmenities.map((amenity) => ({
                  value: String(amenity.id),
                  label: `${amenity.name} · $${formatMoney(amenity.price)} · stock ${amenity.stockQuantity}`,
                })),
              ]}
            />

            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">
                Amount
              </p>
              <QuantityStepper
                label="amount"
                value={amount}
                min={1}
                max={selectedAmenity?.stockQuantity}
                disabled={!selectedAmenity}
                onChange={setAmount}
              />
            </div>
          </div>

          {selectedAmenity && (
            <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-slate-500">
              <span>
                In stock: {selectedAmenity.stockQuantity} · $
                {formatMoney(selectedAmenity.price)} each
              </span>

              <span className="font-semibold text-slate-800">
                Subtotal ${formatMoney(selectedAmenity.price * amount)}
              </span>
            </div>
          )}

          {addMutation.isError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {getErrorMessage(addMutation.error, "Unable to add amenity.")}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              leftIcon={<Plus size={16} />}
              disabled={!selectedAmenity || amount < 1}
              loading={addMutation.isPending}
              onClick={() => void add()}
            >
              Add amenity
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
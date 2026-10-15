import { useMemo, useState } from "react";
import { Plus, Trash2 } from "../../../components/ui/MaterialIcon.tsx";

import { Button, Input, Select } from "../../../components/ui";

import { useLocationAmenities } from "../hooks/useLocationAmenities";
import { useAddRoomAmenity } from "../hooks/useAddRoomAmenity";
import { useRemoveRoomAmenity } from "../hooks/useRemoveRoomAmenity";

import type { AmenityResponse, RoomAmenityResponse } from "../types/room";
import { formatMoney, getErrorMessage } from "../utils/roomUtils";

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
  const removeMutation = useRemoveRoomAmenity();

  const currentIds = useMemo(
    () => new Set(currentAmenities.map((amenity) => amenity.amenityId)),
    [currentAmenities],
  );

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

  const overStock = Boolean(
    selectedAmenity && amount > selectedAmenity.stockQuantity,
  );

  const add = async () => {
    if (!selectedAmenity || amount < 1 || overStock) return;

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

  const remove = async (amenity: RoomAmenityResponse) => {
    try {
      await removeMutation.mutateAsync({
        roomId,
        amenityId: amenity.amenityId,
      });
    } catch {
      // shown through removeMutation.error below
    }
  };

  const assignedTotal = currentAmenities.reduce(
    (total, amenity) => total + amenity.price * amenity.amount,
    0,
  );

  const clampAmount = (value: number) => {
    const max = selectedAmenity?.stockQuantity ?? Infinity;
    return Math.min(Math.max(1, value), max);
  };

  return (
    <div className="space-y-6">
      {/* Assigned */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Assigned amenities
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Quantities are allocated from this location's stock.
            </p>
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
              <li
                key={amenity.amenityId}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {amenity.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {amenity.amount} × ${formatMoney(amenity.price)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    ${formatMoney(amenity.price * amenity.amount)}
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    title="Remove amenity"
                    aria-label={`Remove ${amenity.name}`}
                    loading={
                      removeMutation.isPending &&
                      removeMutation.variables?.amenityId === amenity.amenityId
                    }
                    onClick={() => void remove(amenity)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {removeMutation.isError && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {getErrorMessage(removeMutation.error, "Unable to remove amenity.")}
          </p>
        )}
      </section>

      {/* Add */}
      <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Add amenity</h3>
        <p className="mt-1 text-xs text-slate-500">
          Only active amenities from this room's location are listed.
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

              <div className="flex items-center overflow-hidden rounded-lg border border-slate-300 bg-white">
                <button
                  type="button"
                  aria-label="Decrease amount"
                  disabled={!selectedAmenity || amount <= 1}
                  onClick={() => setAmount((current) => clampAmount(current - 1))}
                  className="h-10 w-10 text-lg text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  −
                </button>

                <input
                  type="number"
                  min={1}
                  max={selectedAmenity?.stockQuantity ?? undefined}
                  value={amount}
                  disabled={!selectedAmenity}
                  onChange={(event) =>
                    setAmount(Math.max(1, Number(event.target.value) || 1))
                  }
                  className="h-10 w-16 border-x border-slate-200 text-center text-sm outline-none disabled:bg-slate-50"
                />

                <button
                  type="button"
                  aria-label="Increase amount"
                  disabled={
                    !selectedAmenity || amount >= selectedAmenity.stockQuantity
                  }
                  onClick={() => setAmount((current) => clampAmount(current + 1))}
                  className="h-10 w-10 text-lg text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  +
                </button>
              </div>
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

          {overStock && selectedAmenity && (
            <p className="text-xs text-red-600">
              Maximum available stock is {selectedAmenity.stockQuantity}.
            </p>
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
              disabled={!selectedAmenity || amount < 1 || overStock}
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
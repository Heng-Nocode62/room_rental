import { useMemo, useState } from "react";
import { Plus, Trash2 } from "../../../components/ui/MaterialIcon.tsx";

import { Button, Input, Select } from "../../../components/ui";

import { useLocationAmenities } from "../hooks/useLocationAmenities";
import { useAddRoomAmenity } from "../hooks/useAddRoomAmenity";
import { useRemoveRoomAmenity } from "../hooks/useRemoveRoomAmenity";

import type {
  AmenityResponse,
  RoomAmenityResponse,
} from "../types/room";

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

  const {
    data: locationAmenities = [],
    isLoading,
  } = useLocationAmenities(locationId, true);

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
        (amenity) =>
          !keyword || amenity.name.toLowerCase().includes(keyword),
      );
  }, [currentIds, locationAmenities, search]);

  const selectedAmenity: AmenityResponse | undefined =
    locationAmenities.find((amenity) => amenity.id === Number(amenityId));

  const add = async () => {
    if (!selectedAmenity || amount < 1) return;

    if (amount > selectedAmenity.stockQuantity) return;

    await addMutation.mutateAsync({
      roomId,
      amenityId: selectedAmenity.id,
      amount,
    });

    setAmenityId("");
    setAmount(1);
  };

  const remove = async (amenity: RoomAmenityResponse) => {
    await removeMutation.mutateAsync({
      roomId,
      amenityId: amenity.amenityId,
    });
  };

  const assignedTotal = currentAmenities.reduce(
    (total, amenity) => total + amenity.price * amenity.amount,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Assigned amenities
          </p>
          <p className="mt-1 text-xs text-slate-500">
            These quantities are allocated from the selected location's stock.
          </p>
        </div>

        {currentAmenities.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            No amenities assigned.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {currentAmenities.map((amenity) => (
              <div
                key={amenity.amenityId}
                className="flex items-center justify-between gap-4 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {amenity.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {amenity.amount} × {amenity.price.toFixed(2)}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
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
            ))}
          </div>
        )}

        {currentAmenities.length > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-xs text-slate-500">Assigned value</span>
            <span className="text-sm font-semibold text-slate-900">
              {assignedTotal.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-900">
          Add amenity
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Only active amenities configured for this room's location are shown.
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_120px_auto] lg:items-end">
          <Input
            label="Search"
            placeholder="Search amenities..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

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
                label: `${amenity.name} · ${amenity.price.toFixed(2)} · stock ${amenity.stockQuantity}`,
              })),
            ]}
          />

          <Input
            label="Amount"
            type="number"
            min={1}
            max={selectedAmenity?.stockQuantity ?? undefined}
            value={amount}
            onChange={(event) =>
              setAmount(Math.max(1, Number(event.target.value) || 1))
            }
          />

          <Button
            type="button"
            leftIcon={<Plus size={16} />}
            disabled={
              !selectedAmenity ||
              amount < 1 ||
              amount > selectedAmenity.stockQuantity
            }
            loading={addMutation.isPending}
            onClick={() => void add()}
          >
            Add
          </Button>
        </div>

        {selectedAmenity && amount > selectedAmenity.stockQuantity && (
          <p className="mt-2 text-xs text-red-600">
            Maximum available stock is {selectedAmenity.stockQuantity}.
          </p>
        )}
      </div>
    </div>
  );
}

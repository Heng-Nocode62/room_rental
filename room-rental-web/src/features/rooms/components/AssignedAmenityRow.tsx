import { useEffect, useState } from "react";
import { Trash2 } from "../../../components/ui/MaterialIcon.tsx";

import { Button } from "../../../components/ui/index.ts";

import { useAddRoomAmenity } from "../hooks/useAddRoomAmenity.ts";
import { useRemoveRoomAmenity } from "../hooks/useRemoveRoomAmenity.ts";

import type { RoomAmenityResponse } from "../types/room.ts";
import { formatMoney, getErrorMessage } from "../utils/roomUtils.ts";
import { QuantityStepper } from "./QuantityStepper.tsx";

interface Props {
  roomId: number;
  amenity: RoomAmenityResponse;
  /** Stock still unallocated at the location for this amenity. */
  stockLeft: number;
}

export function AssignedAmenityRow({ roomId, amenity, stockLeft }: Props) {
  const [draft, setDraft] = useState(amenity.amount);

  const addMutation = useAddRoomAmenity();
  const removeMutation = useRemoveRoomAmenity();

  // Re-sync after a save/refetch changes the server value.
  useEffect(() => {
    setDraft(amenity.amount);
  }, [amenity.amount]);

  const max = amenity.amount + stockLeft;
  const diff = draft - amenity.amount;
  const dirty = diff !== 0;
  const busy = addMutation.isPending || removeMutation.isPending;
  const error = addMutation.error ?? removeMutation.error;

  const save = async () => {
    if (!dirty) return;

    try {
      if (diff > 0) {
        await addMutation.mutateAsync({
          roomId,
          amenityId: amenity.amenityId,
          amount: diff,
        });
      } else {
        await removeMutation.mutateAsync({
          roomId,
          amenityId: amenity.amenityId,
          amount: -diff,
        });
      }
    } catch {
      // shown below
    }
  };

  const removeAll = async () => {
    try {
      await removeMutation.mutateAsync({
        roomId,
        amenityId: amenity.amenityId,
        amount: amenity.amount,
      });
    } catch {
      // shown below
    }
  };

  const hint =
    draft === 0
      ? `Remove all ${amenity.amount}`
      : diff > 0
        ? `Add ${diff} more`
        : `Remove ${-diff}`;

  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">
            {amenity.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            ${formatMoney(amenity.price)} each · max {max}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <QuantityStepper
            label={`${amenity.name} amount`}
            value={draft}
            min={0}
            max={max}
            disabled={busy}
            onChange={setDraft}
          />

          <span className="w-16 text-right text-sm font-semibold text-slate-900">
            ${formatMoney(amenity.price * draft)}
          </span>

          <Button
            type="button"
            variant="ghost"
            title="Remove all"
            aria-label={`Remove all ${amenity.name}`}
            loading={removeMutation.isPending && !dirty}
            disabled={busy}
            onClick={() => void removeAll()}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {dirty && (
        <div className="mt-2 flex items-center justify-end gap-2">
          <span className="mr-auto text-xs text-slate-500">{hint}</span>

          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => setDraft(amenity.amount)}
          >
            Reset
          </Button>

          <Button
            type="button"
            loading={busy}
            className={draft === 0 ? "bg-red-600 hover:bg-red-700" : undefined}
            onClick={() => void save()}
          >
            {draft === 0 ? "Remove all" : "Save"}
          </Button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {getErrorMessage(error, "Unable to update amenity amount.")}
        </p>
      )}
    </li>
  );
}
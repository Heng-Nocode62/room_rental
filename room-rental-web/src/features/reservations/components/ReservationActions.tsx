import { Button } from "../../../components/ui";

import type { ReservationResponse } from "../types/reservation";

interface ReservationActionsProps {
  reservation: ReservationResponse;

  onConfirm: () => void;
  onCancel: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;

  loadingAction?: string | null;
}

export function ReservationActions({
  reservation,
  onConfirm,
  onCancel,
  onCheckIn,
  onCheckOut,
  loadingAction,
}: ReservationActionsProps) {
  const isLoading = (action: string) => loadingAction === action;

  return (
    <div className="flex flex-wrap gap-2">
      {reservation.status === "PENDING" && (
        <>
          <Button onClick={onConfirm} loading={isLoading("confirm")}>
            Confirm
          </Button>

          <Button
            variant="danger"
            onClick={onCancel}
            loading={isLoading("cancel")}
          >
            Cancel
          </Button>
        </>
      )}

      {reservation.status === "CONFIRMED" && (
        <>
          <Button onClick={onCheckIn} loading={isLoading("checkIn")}>
            Check in
          </Button>

          <Button
            variant="danger"
            onClick={onCancel}
            loading={isLoading("cancel")}
          >
            Cancel
          </Button>
        </>
      )}

      {reservation.status === "CHECKED_IN" && (
        <Button onClick={onCheckOut} loading={isLoading("checkOut")}>
          Check out
        </Button>
      )}
    </div>
  );
}

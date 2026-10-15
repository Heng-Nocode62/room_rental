import { Button } from "../../../components/ui";

import type { RoomBlockResponse } from "../types/roomBlock";

interface RoomBlockActionsProps {
  roomBlock: RoomBlockResponse;

  onComplete: () => void;
  onCancel: () => void;

  loadingAction: "complete" | "cancel" | null;
}

export function RoomBlockActions({
  roomBlock,
  onComplete,
  onCancel,
  loadingAction,
}: RoomBlockActionsProps) {
  if (roomBlock.status !== "ACTIVE") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={onCancel}
        loading={loadingAction === "cancel"}
        disabled={loadingAction !== null}
        className="text-red-600 hover:bg-red-50"
      >
        Cancel block
      </Button>

      <Button
        onClick={onComplete}
        loading={loadingAction === "complete"}
        disabled={loadingAction !== null}
      >
        Mark complete
      </Button>
    </div>
  );
}
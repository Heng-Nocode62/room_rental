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
      <Button onClick={onComplete} loading={loadingAction === "complete"}>
        Mark Complete
      </Button>

      <Button
        variant="danger"
        onClick={onCancel}
        loading={loadingAction === "cancel"}
      >
        Cancel Block
      </Button>
    </div>
  );
}

import type { RoomBlockType } from "../types/roomBlock";

import { BLOCK_TYPE_LABELS, BLOCK_TYPE_STYLES } from "../utils/roomBlockUtils";

interface RoomBlockTypeBadgeProps {
  type: RoomBlockType;
}

export function RoomBlockTypeBadge({ type }: RoomBlockTypeBadgeProps) {
  const key = String(type);

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        BLOCK_TYPE_STYLES[key] ?? BLOCK_TYPE_STYLES.OTHER,
      ].join(" ")}
    >
      {BLOCK_TYPE_LABELS[key] ?? key.replaceAll("_", " ")}
    </span>
  );
}
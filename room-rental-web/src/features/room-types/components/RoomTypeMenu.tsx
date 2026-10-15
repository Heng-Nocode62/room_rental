import { Edit3, Eye, Power } from "../../../components/ui/MaterialIcon.tsx";

import type { RoomTypeResponse } from "../types/roomType.ts";

export interface RoomTypeActions {
  onView: (item: RoomTypeResponse) => void;
  onEdit: (item: RoomTypeResponse) => void;
  onToggle: (item: RoomTypeResponse) => void;
}

/** Shared by the table rows and the grid cards so both show the same actions. */
export function getRoomTypeMenuItems(
  item: RoomTypeResponse,
  { onView, onEdit, onToggle }: RoomTypeActions,
) {
  return [
    {
      label: "View details",
      icon: <Eye size={15} />,
      onClick: () => onView(item),
    },
    {
      label: "Edit",
      icon: <Edit3 size={15} />,
      onClick: () => onEdit(item),
    },
    // The page only supports deactivating, so "Activate" is not offered.
    ...(String(item.status) === "ACTIVE"
      ? [
          {
            label: "Deactivate",
            icon: <Power size={15} />,
            tone: "danger" as const,
            dividerBefore: true,
            onClick: () => onToggle(item),
          },
        ]
      : []),
  ];
}
import { RoomBlockCreateDialog } from "../../../room-blocks/components/RoomBlockCreateDialog";
import type { ComponentProps } from "react";

export type StaffRoomBlockCreateDialogProps = ComponentProps<typeof RoomBlockCreateDialog>;

export function StaffRoomBlockCreateDialog(props: StaffRoomBlockCreateDialogProps) {
  return <RoomBlockCreateDialog {...props} />;
}

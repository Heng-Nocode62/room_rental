import { RoomBlockCreateDialog } from "../../../room-blocks/components/RoomBlockCreateDialog";
import type { ComponentProps } from "react";

export type AdminRoomBlockCreateDialogProps = ComponentProps<typeof RoomBlockCreateDialog>;

export function AdminRoomBlockCreateDialog(props: AdminRoomBlockCreateDialogProps) {
  return <RoomBlockCreateDialog {...props} />;
}

import { RoomBlockCreateDialog } from "../../../room-blocks/components/RoomBlockCreateDialog";
import type { ComponentProps } from "react";

export type OwnerRoomBlockCreateDialogProps = ComponentProps<typeof RoomBlockCreateDialog>;

export function OwnerRoomBlockCreateDialog(props: OwnerRoomBlockCreateDialogProps) {
  return <RoomBlockCreateDialog {...props} />;
}

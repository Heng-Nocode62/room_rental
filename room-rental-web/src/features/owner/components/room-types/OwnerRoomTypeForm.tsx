import { RoomTypeForm } from "../../../room-types/components/RoomTypeForm";
import type { ComponentProps } from "react";

export type OwnerRoomTypeFormValues = import("../../../room-types/components/RoomTypeForm").RoomTypeFormValues;

export type OwnerRoomTypeFormProps = ComponentProps<typeof RoomTypeForm>;

export function OwnerRoomTypeForm(props: OwnerRoomTypeFormProps) {
  return <RoomTypeForm {...props} />;
}

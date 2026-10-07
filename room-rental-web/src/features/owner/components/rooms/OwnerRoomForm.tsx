import { RoomForm } from "../../../rooms/components/RoomForm";
import type { ComponentProps } from "react";

export type OwnerRoomFormValues = import("../../../rooms/components/RoomForm").RoomFormValues;
export type RoomOwnerAmenityFormValue = import("../../../rooms/components/RoomForm").RoomAmenityFormValue;

export type OwnerRoomFormProps = ComponentProps<typeof RoomForm>;

export function OwnerRoomForm(props: OwnerRoomFormProps) {
  return <RoomForm {...props} />;
}

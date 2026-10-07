import { RoomTypeForm } from "../../../room-types/components/RoomTypeForm";
import type { ComponentProps } from "react";

export type StaffRoomTypeFormValues = import("../../../room-types/components/RoomTypeForm").RoomTypeFormValues;

export type StaffRoomTypeFormProps = ComponentProps<typeof RoomTypeForm>;

export function StaffRoomTypeForm(props: StaffRoomTypeFormProps) {
  return <RoomTypeForm {...props} />;
}

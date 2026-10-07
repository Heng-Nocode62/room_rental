import { RoomForm } from "../../../rooms/components/RoomForm";
import type { ComponentProps } from "react";

export type StaffRoomFormValues = import("../../../rooms/components/RoomForm").RoomFormValues;
export type RoomStaffAmenityFormValue = import("../../../rooms/components/RoomForm").RoomAmenityFormValue;

export type StaffRoomFormProps = ComponentProps<typeof RoomForm>;

export function StaffRoomForm(props: StaffRoomFormProps) {
  return <RoomForm {...props} />;
}

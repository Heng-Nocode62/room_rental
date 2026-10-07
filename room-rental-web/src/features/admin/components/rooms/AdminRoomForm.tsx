import { RoomForm } from "../../../rooms/components/RoomForm";
import type { ComponentProps } from "react";

export type AdminRoomFormValues = import("../../../rooms/components/RoomForm").RoomFormValues;
export type RoomAdminAmenityFormValue = import("../../../rooms/components/RoomForm").RoomAmenityFormValue;

export type AdminRoomFormProps = ComponentProps<typeof RoomForm>;

export function AdminRoomForm(props: AdminRoomFormProps) {
  return <RoomForm {...props} />;
}

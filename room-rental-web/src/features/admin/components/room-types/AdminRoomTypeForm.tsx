import { RoomTypeForm } from "../../../room-types/components/RoomTypeForm";
import type { ComponentProps } from "react";

export type AdminRoomTypeFormValues = import("../../../room-types/components/RoomTypeForm").RoomTypeFormValues;

export type AdminRoomTypeFormProps = ComponentProps<typeof RoomTypeForm>;

export function AdminRoomTypeForm(props: AdminRoomTypeFormProps) {
  return <RoomTypeForm {...props} />;
}

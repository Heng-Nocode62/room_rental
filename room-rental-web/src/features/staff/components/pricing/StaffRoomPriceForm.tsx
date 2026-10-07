import { RoomPriceForm } from "../../../pricing/components/RoomPriceForm";
import type { ComponentProps } from "react";

export type StaffRoomPriceFormValues = import("../../../pricing/components/RoomPriceForm").RoomPriceFormValues;

export type StaffRoomPriceFormProps = ComponentProps<typeof RoomPriceForm>;

export function StaffRoomPriceForm(props: StaffRoomPriceFormProps) {
  return <RoomPriceForm {...props} />;
}

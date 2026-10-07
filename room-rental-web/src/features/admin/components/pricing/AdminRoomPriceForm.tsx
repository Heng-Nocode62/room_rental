import { RoomPriceForm } from "../../../pricing/components/RoomPriceForm";
import type { ComponentProps } from "react";

export type AdminRoomPriceFormValues = import("../../../pricing/components/RoomPriceForm").RoomPriceFormValues;

export type AdminRoomPriceFormProps = ComponentProps<typeof RoomPriceForm>;

export function AdminRoomPriceForm(props: AdminRoomPriceFormProps) {
  return <RoomPriceForm {...props} />;
}

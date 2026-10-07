import { RoomPriceForm } from "../../../pricing/components/RoomPriceForm";
import type { ComponentProps } from "react";

export type OwnerRoomPriceFormValues = import("../../../pricing/components/RoomPriceForm").RoomPriceFormValues;

export type OwnerRoomPriceFormProps = ComponentProps<typeof RoomPriceForm>;

export function OwnerRoomPriceForm(props: OwnerRoomPriceFormProps) {
  return <RoomPriceForm {...props} />;
}

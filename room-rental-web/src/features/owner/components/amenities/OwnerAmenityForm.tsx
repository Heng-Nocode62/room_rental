import { AmenityForm } from "../../../amenities/components/AmenityForm";
import type { ComponentProps } from "react";

export type OwnerAmenityFormValues =
  import("../../../amenities/components/AmenityForm").AmenityFormValues;
export type LocationOption =
  import("../../../amenities/components/AmenityForm").LocationOption;

export type OwnerAmenityFormProps = ComponentProps<typeof AmenityForm>;

export function OwnerAmenityForm(props: OwnerAmenityFormProps) {
  return <AmenityForm {...props} />;
}

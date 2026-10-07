import { AmenityForm } from "../../../amenities/components/AmenityForm";
import type { ComponentProps } from "react";

export type AdminAmenityFormValues =
  import("../../../amenities/components/AmenityForm").AmenityFormValues;
export type LocationOption =
  import("../../../amenities/components/AmenityForm").LocationOption;

export type AdminAmenityFormProps = ComponentProps<typeof AmenityForm>;

export function AdminAmenityForm(props: AdminAmenityFormProps) {
  return <AmenityForm {...props} />;
}

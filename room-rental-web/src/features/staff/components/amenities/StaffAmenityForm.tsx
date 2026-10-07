import { AmenityForm } from "../../../amenities/components/AmenityForm";
import type { ComponentProps } from "react";

export type StaffAmenityFormValues = import("../../../amenities/components/AmenityForm").AmenityFormValues;
export type LocationOption = import("../../../amenities/components/AmenityForm").LocationOption;

export type StaffAmenityFormProps = ComponentProps<typeof AmenityForm>;

export function StaffAmenityForm(props: StaffAmenityFormProps) {
  return <AmenityForm {...props} />;
}

import { LocationForm } from "../../../locations/components/LocationForm";
import type { ComponentProps } from "react";

export type OwnerLocationFormValues = import("../../../locations/components/LocationForm").LocationFormValues;

export type OwnerLocationFormProps = ComponentProps<typeof LocationForm>;

export function OwnerLocationForm(props: OwnerLocationFormProps) {
  return <LocationForm {...props} />;
}

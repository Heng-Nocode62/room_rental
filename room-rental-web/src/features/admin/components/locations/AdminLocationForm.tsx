import { LocationForm } from "../../../locations/components/LocationForm";
import type { ComponentProps } from "react";

export type AdminLocationFormValues = import("../../../locations/components/LocationForm").LocationFormValues;

export type AdminLocationFormProps = ComponentProps<typeof LocationForm>;

export function AdminLocationForm(props: AdminLocationFormProps) {
  return <LocationForm {...props} />;
}

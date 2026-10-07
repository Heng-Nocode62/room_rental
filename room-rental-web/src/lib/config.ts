import { DateTime } from "luxon";
import type { AppDatetimeConfig } from "../features/settings/types/config";

export function getConfiguredDateTimeFormat(config: AppDatetimeConfig | undefined): string {
  const configured = config?.formats?.find((format) => format.id === config.active);

  if (configured?.format) {
    return configured.format
      .replace(/yyyy/g, "yyyy")
      .replace(/dd/g, "dd")
      .replace(/HH/g, "HH")
      .replace(/MM/g, "MM")
      .replace(/mm/g, "mm");
  }

  switch (config?.active) {
    case 2:
      return "dd/MM/yyyy HH:mm";
    case 3:
      return "yyyy-MM-dd HH:mm";
    case 1:
    default:
      return "dd-MM-yyyy HH:mm";
  }
}

export function formatConfiguredDateTime(
  value: string | Date,
  config: AppDatetimeConfig | undefined,
): string {
  const dateTime = value instanceof Date
    ? DateTime.fromJSDate(value)
    : DateTime.fromISO(value);

  if (!dateTime.isValid) {
    return "-";
  }

  return dateTime.toFormat(getConfiguredDateTimeFormat(config));
}

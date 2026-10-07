import {
  DateTime,
} from "luxon";

export function combineLocalDateAndTime(
  date: string,
  time: string,
  timezone: string
): string {

  const value =
    DateTime.fromISO(
      `${date}T${time}`,
      {
        zone: timezone,
      }
    );

  if (!value.isValid) {
    throw new Error(
      value.invalidExplanation ??
      "Invalid date/time"
    );
  }

  const result =
    value.toISO({
      suppressMilliseconds: true,
    });

  if (!result) {
    throw new Error(
      "Unable to convert date/time"
    );
  }

  return result;
}


export function validateReservationTime(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
  timezone: string
): string | null {

  const start =
    DateTime.fromISO(
      `${startDate}T${startTime}`,
      {
        zone: timezone,
      }
    );

  const end =
    DateTime.fromISO(
      `${endDate}T${endTime}`,
      {
        zone: timezone,
      }
    );

  if (!start.isValid) {
    return "Start date or time is invalid.";
  }

  if (!end.isValid) {
    return "End date or time is invalid.";
  }

  if (end <= start) {
    return "End time must be after start time.";
  }

  return null;
}
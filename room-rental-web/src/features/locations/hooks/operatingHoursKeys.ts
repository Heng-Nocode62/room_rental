export const operatingHoursKeys = {
  all: ["operating-hours"] as const,

  byLocation: (locationId: number) =>
    [...operatingHoursKeys.all, "location", locationId] as const,
};

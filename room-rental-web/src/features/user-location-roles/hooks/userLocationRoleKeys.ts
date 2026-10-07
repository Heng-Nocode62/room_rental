export const userLocationRoleKeys = {
  all: ["user-location-roles"] as const,
  byUser: (userId: number) => [...userLocationRoleKeys.all, "user", userId] as const,
  byLocation: (locationId: number) => [...userLocationRoleKeys.all, "location", locationId] as const,
};

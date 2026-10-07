import type { RoomSearchParams } from "../types/room";

export const roomKeys = {
  all: ["rooms"] as const,

  lists: () => [...roomKeys.all, "list"] as const,

  list: (params: RoomSearchParams) =>
    [...roomKeys.lists(), params] as const,

  details: () => [...roomKeys.all, "detail"] as const,

  detail: (id: number) => [...roomKeys.details(), id] as const,

  amenities: (roomId: number) =>
    [...roomKeys.all, "amenities", roomId] as const,

  locationAmenitiesRoot: () =>
    [...roomKeys.all, "location-amenities"] as const,

  locationAmenities: (locationId?: number) =>
    [...roomKeys.locationAmenitiesRoot(), locationId ?? null] as const,
};

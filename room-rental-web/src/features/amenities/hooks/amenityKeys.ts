import type { AmenityListParams } from "../types/amenity";

export const amenityKeys = {
  all: ["amenities"] as const,

  lists: () => [...amenityKeys.all, "list"] as const,

  list: (params: AmenityListParams = {}) =>
    [...amenityKeys.lists(), params] as const,

  details: () => [...amenityKeys.all, "detail"] as const,

  detail: (id: number) => [...amenityKeys.details(), id] as const,
};

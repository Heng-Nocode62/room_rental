export const roomTypeKeys = {
  all: ["room-types"] as const,

  lists: () => [...roomTypeKeys.all, "list"] as const,

  details: () => [...roomTypeKeys.all, "detail"] as const,

  detail: (id: number) => [...roomTypeKeys.details(), id] as const,
};

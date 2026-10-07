

export const roomPriceKeys = {
  all: ["room-prices"] as const,

  lists: () => [...roomPriceKeys.all, "list"] as const,

  list: (params: object) => [...roomPriceKeys.lists(), params] as const,

  details: () => [...roomPriceKeys.all, "detail"] as const,

  detail: (id: number) => [...roomPriceKeys.details(), id] as const,

  history: (roomId: number) =>
    [...roomPriceKeys.all, "history", roomId] as const,
};

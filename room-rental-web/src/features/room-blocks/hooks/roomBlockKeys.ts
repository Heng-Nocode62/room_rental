
export const roomBlockKeys = {
  all: ["room-blocks"] as const,

  lists: () => [...roomBlockKeys.all, "list"] as const,

  list: (params: object) => [...roomBlockKeys.lists(), params] as const,

  details: () => [...roomBlockKeys.all, "detail"] as const,

  detail: (id: number) => [...roomBlockKeys.details(), id] as const,

  byRoom: (roomId: number) => [...roomBlockKeys.all, "room", roomId] as const,
};

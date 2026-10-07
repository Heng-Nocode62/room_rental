export const locationKeys = {
  all: ["locations"] as const,

  lists: () => [...locationKeys.all, "list"] as const,

  detail: (id: number) => [...locationKeys.all, "detail", id] as const,
};

// src/features/reservations/hooks/reservationKeys.ts

export const reservationKeys = {
  all: ["reservations"] as const,

  lists: () => [...reservationKeys.all, "list"] as const,

  list: (params: object) => [...reservationKeys.lists(), params] as const,

  details: () => [...reservationKeys.all, "detail"] as const,

  detail: (id: number) => [...reservationKeys.details(), id] as const,
};

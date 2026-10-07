export const paymentKeys = {
  all: ["payments"] as const,
  byId: (paymentId: number) => [...paymentKeys.all, "by-id", paymentId] as const,
  status: (paymentId: number) => [...paymentKeys.all, "status", paymentId] as const,
};

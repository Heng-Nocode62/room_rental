import { useQuery } from "@tanstack/react-query";
import { paymentApi } from "../api/paymentApi";
import { paymentKeys } from "./paymentKeys";
import type { PaymentStatus } from "../types/payment";

const terminalStatuses = new Set<PaymentStatus>([
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
]);

export function usePaymentStatus(paymentId?: number) {
  return useQuery({
    queryKey: paymentKeys.status(paymentId ?? 0),
    queryFn: () => paymentApi.getStatus(paymentId!),
    enabled: paymentId != null,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (status && terminalStatuses.has(status)) {
        return false;
      }

      return 3000;
    },
  });
}

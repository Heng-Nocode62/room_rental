import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "../api/paymentApi";
import { paymentKeys } from "./paymentKeys";

export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: number) => paymentApi.cancel(paymentId),
    onSuccess: (payment) => {
      queryClient.setQueryData(
        paymentKeys.status(payment.paymentId),
        payment,
      );

      queryClient.setQueryData(
        paymentKeys.byId(payment.paymentId),
        payment,
      );
    },
  });
}

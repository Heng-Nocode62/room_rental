import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "../api/paymentApi";
import { paymentKeys } from "./paymentKeys";
import type {
  InitiatePaymentRequest,
  PaymentInitiateResponse,
} from "../types/payment";

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation<PaymentInitiateResponse, Error, InitiatePaymentRequest>({
    mutationFn: (request) => paymentApi.create(request),
    onSuccess: (payment) => {
      queryClient.setQueryData(
        paymentKeys.status(payment.paymentId),
        payment,
      );
      queryClient.invalidateQueries({
        queryKey: paymentKeys.all,
      });
    },
  });
}

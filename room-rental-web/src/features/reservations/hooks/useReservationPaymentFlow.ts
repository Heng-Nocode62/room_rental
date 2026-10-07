import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useCreatePayment } from "../../payment/hooks/useCreatePayment";
import type {
  PaymentInitiateResponse,
  PaymentStatusResponse,
} from "../../payment/types/payment";
import type { ReservationResponse } from "../types/reservation";
import { useReservationStatusMutation } from "./useReservationStatusMutation";
import { reservationKeys } from "./reservationKeys";

export function useReservationPaymentFlow() {
  const queryClient = useQueryClient();

  const [payment, setPayment] = useState<
    PaymentInitiateResponse | PaymentStatusResponse | null
  >(null);
  const [paymentReservation, setPaymentReservation] =
    useState<ReservationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCreatePayment();
  const confirmReservation = useReservationStatusMutation("confirm");

  const clearPaymentState = () => {
    setPayment(null);
    setPaymentReservation(null);
  };

  const refreshReservation = (reservationId: number) => {
    queryClient.invalidateQueries({
      queryKey: reservationKeys.detail(reservationId),
    });

    queryClient.invalidateQueries({
      queryKey: reservationKeys.lists(),
    });
  };

  const openPayment = async (reservation: ReservationResponse) => {
    setError(null);
    setPaymentReservation(reservation);

    try {
      const created = await createPayment.mutateAsync({
        reservationId: reservation.id,
        amount: reservation.totalAmount,
        currency: reservation.currencyCode,
        description: `Room reservation ${reservation.referenceNo}`,
      });

      setPayment(created);
    } catch (cause: unknown) {
      setPaymentReservation(null);
      setError(
        cause instanceof Error ? cause.message : "Unable to create payment.",
      );
      throw cause;
    }
  };

  const handleCreated = (reservation: ReservationResponse) => {
    void openPayment(reservation).catch(() => undefined);
  };

  const handlePaymentSucceeded = async (
    verifiedPayment: PaymentStatusResponse,
  ) => {
    if (verifiedPayment.status !== "SUCCESS" || !paymentReservation) {
      return;
    }

    try {
      await confirmReservation.mutateAsync(paymentReservation.id);
      clearPaymentState();
      setError(null);
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Payment succeeded, but the reservation could not be confirmed.",
      );
    }
  };

  const handlePaymentCancelled = (cancelledPayment: PaymentStatusResponse) => {
    if (cancelledPayment.status !== "CANCELLED") {
      return;
    }

    refreshReservation(cancelledPayment.reservationId);
    clearPaymentState();
    setError(null);
  };

  const closePayment = () => {
    clearPaymentState();
  };

  return {
    payment,
    paymentReservation,
    error,
    clearError: () => setError(null),
    openPayment,
    handleCreated,
    handlePaymentSucceeded,
    handlePaymentCancelled,
    closePayment,
    paymentCreating: createPayment.isPending,
    confirmingReservation: confirmReservation.isPending,
  };
}

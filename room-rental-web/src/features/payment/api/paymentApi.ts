import { api } from "../../../lib/axios";
import type {
  InitiatePaymentRequest,
  PaymentInitiateResponse,
  PaymentStatusResponse,
} from "../types/payment";

export const paymentApi = {
  async create(
    request: InitiatePaymentRequest,
  ): Promise<PaymentInitiateResponse> {
    const response = await api.post<PaymentInitiateResponse>(
      "/payments",
      request,
    );

    return response.data;
  },

  async getById(paymentId: number): Promise<PaymentStatusResponse> {
    const response = await api.get<PaymentStatusResponse>(
      `/payments/${paymentId}`,
    );

    return response.data;
  },

  async getStatus(paymentId: number): Promise<PaymentStatusResponse> {
    const response = await api.get<PaymentStatusResponse>(
      `/payments/${paymentId}/status`,
    );

    return response.data;
  },

  async cancel(paymentId: number): Promise<PaymentStatusResponse> {
    const response = await api.post<PaymentStatusResponse>(
      `/payments/${paymentId}/cancel`,
    );

    return response.data;
  },
};

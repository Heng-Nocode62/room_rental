export const PAYMENT_METHODS = [
  "CARD",
  "BANK_TRANSFER",
  "KHQR",
  "CASH",
  "OTHER",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface InitiatePaymentRequest {
  reservationId: number;
  amount: number;
  currency?: string | null;
  description?: string | null;
}

export interface PaymentInitiateResponse {
  paymentId: number;
  reservationId: number;
  billNumber: string;
  gatewayName: string;
  paymentMethod: PaymentMethod;
  khqrString?: string | null;
  khqrDeeplink?: string | null;
  checkoutUrl?: string | null;
  amount: number;
  currency: string;
  expiresAt?: string | null;
  status: PaymentStatus;
}

export interface PaymentStatusResponse {
  paymentId: number;
  reservationId: number;
  billNumber: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayName: string;
  payerAccountId?: string | null;
  createdAt: string;
  paidAt?: string | null;
  expiresAt?: string | null;
  errorMessage?: string | null;
}

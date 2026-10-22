export interface ReservationQrResponse {
  reservationId: number;
  reservationReference: string;
  locationName: string;
  amount: number;
  currency: string;
  qrString: string;
  deeplink?: string | null;
  expiresAt: string;
  telegramContact?: string | null;
}
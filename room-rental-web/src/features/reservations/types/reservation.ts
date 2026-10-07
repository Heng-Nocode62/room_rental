export interface ReservationAmenityRequest {
  amenityId: number;
  quantity: number;
}

export interface CreateReservationRequest {
  roomId: number;

  pricingUnitId: number;

  startAt: string;
  endAt: string;

  purpose: string;
  contactName: string;

  contactPhone?: string;
  companyName?: string;
  notes?: string;

  amenities: ReservationAmenityRequest[];
}

export interface ReservationResponse {
  id: number;

  referenceNo: string;

  roomId: number;
  roomNumber: string;
  roomName: string;

  reservedById: number;
  reservedByName: string;

  status: string;

  startAt: string;
  endAt: string;

  pricingUnitId: number;
  pricingUnitCode: string;

  unitPrice: number;
  totalAmount: number;
  currencyCode: string;

  purpose: string;

  contactName: string;
  contactPhone?: string;

  companyName?: string;
  notes?: string;
}

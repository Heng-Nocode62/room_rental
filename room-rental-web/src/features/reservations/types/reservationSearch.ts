export interface ReservationSearchParams {
  keyword?: string;

  roomId?: number;

  locationId?: number;

  status?: string;

  pricingUnitId?: number;

  date?: string;

  fromDate?: string;

  toDate?: string;

  page?: number;

  size?: number;

  sort?: string;
}

export type RoomPriceStatus =
  | "ACTIVE"
  | "INACTIVE"
  | string;

export interface RoomPriceResponse {
  id: number;

  roomId: number;

  roomNumber: string;

  pricingUnitId: number;

  pricingUnitCode: string;

  pricingUnitName: string;

  price: number;

  currencyCode: string;

  effectiveFrom: string;

  effectiveTo?: string;

  status: RoomPriceStatus;
}

export interface CreateRoomPriceRequest {
  roomId: number;

  pricingUnitId: number;

  price: number;

  currencyCode: string;

  effectiveFrom: string;

  effectiveTo?: string;
}

export interface UpdateRoomPriceRequest {
  price: number;

  currencyCode: string;
}

export interface RoomPriceSearchParams {
  roomId?: number;

  pricingUnitId?: number;

  status?: RoomPriceStatus;

  effectiveDate?: string;

  fromDate?: string;

  toDate?: string;

  page?: number;

  size?: number;

  sort?: string;
}


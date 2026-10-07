import type { RoomPriceResponse } from "../../pricing/types/roomPrice";

export type RoomStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "MAINTENANCE";

export interface AmenityResponse {
  id: number;
  locationId: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  status: string;
}

export interface RoomAmenityResponse {
  amenityId: number;
  name: string;
  description?: string;
  price: number;
  amount: number;
}

export interface RoomAmenityRequest {
  amenityId: number;
  amount: number;
}

export interface RoomResponse {
  id: number;
  locationId: number;
  locationName: string;
  roomTypeId: number;
  roomTypeName: string;
  roomNumber: string;
  name: string;
  floor?: string;
  description?: string;
  capacity: number;
  status: RoomStatus | string;
  prices: RoomPriceResponse[]
  amenities: RoomAmenityResponse[];
}

export interface CreateRoomRequest {
  locationId: number;
  roomTypeId: number;
  roomNumber: string;
  name: string;
  floor?: string;
  hourlyPrice:number;
  dailyPrice: number;
  description?: string;
  amenities?: RoomAmenityRequest[];
}

export interface UpdateRoomRequest {
  name: string;
  floor?: string;
  description?: string;
  dailyPrice: number;
  hourlyPrice: number;
}
export interface UpdateRoomPriceRequest{
  id:number;
  price:number;
}

export interface RoomSearchParams {
  keyword?: string;
  locationId?: number;
  roomTypeId?: number;
  status?: RoomStatus;
  minCapacity?: number;
  maxCapacity?: number;
  amenityId?: number;
  page?: number;
  size?: number;
  sort?: string;

}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type AmenityStatus = "ACTIVE" | "INACTIVE" | string;

export interface AmenityResponse {
  id: number;
  locationId: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  status: AmenityStatus;
}

export interface CreateAmenityRequest {
  locationId: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
}

export interface UpdateAmenityRequest {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
}

export interface AmenitySearchParams {
  name?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AmenityListParams extends AmenitySearchParams {
  locationId?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

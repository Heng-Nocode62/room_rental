export type LocationStatus =
  | "ACTIVE"
  | "INACTIVE"
  | string;

export interface LocationResponse {
  id: number;

  name: string;
  code: string;

  address?: string;
  phone?: string;

  timeZone: string;

  floor: number;
  ownerId: number;

  status: LocationStatus;
  totalRooms: number;
}

export interface CreateLocationRequest {
  name: string;
  code: string;

  address?: string;
  phone?: string;

  timeZone: string;

  floor: number;
  ownerId: number;
}

export interface UpdateLocationRequest {
  name: string;

  address?: string;
  phone?: string;

  timeZone: string;

  floor: number;
}
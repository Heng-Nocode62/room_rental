
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

  status: LocationStatus;
  totalRooms: number;
}

export interface CreateLocationRequest {
  name: string;
  code: string;

  address?: string;
  phone?: string;

  timeZone: string;
}

export interface UpdateLocationRequest {
  name: string;

  address?: string;
  phone?: string;

  timeZone: string;
}
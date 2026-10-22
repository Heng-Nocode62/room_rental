export type LocationStatus =
  | "ACTIVE"
  | "INACTIVE"
  | string;

export interface LocationResponse {
  id: number;

  name: string;
  code: string;

  address?: string | null;
  phone?: string | null;

  timeZone: string;

  floor: number;
  ownerId: number;

  status: LocationStatus;
  totalRooms: number;

  imageUrl?: string | null;
  locationBakongAccountId?: string | null;
  telegramContact?: string | null;
}

export interface CreateLocationRequest {
  name: string;
  code: string;

  address?: string;
  phone?: string;

  timeZone: string;

  floor: number;
  ownerId: number;

  locationBakongAccountId?: string;
  telegramContact?: string;
}

export interface UpdateLocationRequest {
  name: string;

  address?: string;
  phone?: string;

  timeZone: string;

  floor: number;

  locationBakongAccountId?: string;
  telegramContact?: string;
}
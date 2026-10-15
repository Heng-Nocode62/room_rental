export type RoomTypeStatus =
  | "ACTIVE"
  | "INACTIVE"
  | string;

export interface RoomTypeResponse {
  id: number;
  locationId: number;

  name: string;
  code: string;
  description?: string;
  capacity?: number;
  imageUrl?: string;
  status: RoomTypeStatus;
}

export interface CreateRoomTypeRequest {
  locationId: number; 

  name: string;
  code: string;
  description?: string;
  capacity?: number;
}

export interface UpdateRoomTypeRequest {
  name: string;
  description?: string;
  capacity?: number;
}
export type RoomTypeStatus =
  | "ACTIVE"
  | "INACTIVE"
  | string;

export interface RoomTypeResponse {
  id: number;

  name: string;
  code: string;

  description?: string;

  capacity?: number;

  imageUrl?: string;

  status: RoomTypeStatus;
}

export interface CreateRoomTypeRequest {
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
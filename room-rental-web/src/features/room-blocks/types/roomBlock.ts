// src/features/room-blocks/types/roomBlock.ts

export type RoomBlockType =
  | "MAINTENANCE"
  | "CLEANING"
  | "PRIVATE_EVENT"
  | "RENOVATION"
  | "OTHER";

export type RoomBlockStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "COMPLETED";

export interface CreateRoomBlockRequest {
  roomId: number;

  blockType: RoomBlockType;

  startAt: string;
  endAt: string;

  reason?: string;
  notes?: string;
}

export interface RoomBlockResponse {
  id: number;

  roomId: number;
  roomNumber: string;
  roomName: string;

  blockType: RoomBlockType;
  status: RoomBlockStatus;

  startAt: string;
  endAt: string;

  reason?: string;
  notes?: string;

  createdById: number;
  createdByName: string;
}

export interface RoomBlockSearchParams {
  keyword?: string;

  roomId?: number;
  locationId?: number;

  blockType?: RoomBlockType;
  status?: RoomBlockStatus;

  date?: string;

  fromDate?: string;
  toDate?: string;

  page?: number;
  size?: number;
  sort?: string;
}
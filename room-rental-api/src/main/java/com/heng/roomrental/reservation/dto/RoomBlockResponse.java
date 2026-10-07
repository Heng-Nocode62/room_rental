package com.heng.roomrental.reservation.dto;

import com.heng.roomrental.reservation.entity.RoomBlockStatus;
import com.heng.roomrental.reservation.entity.RoomBlockType;

import java.time.OffsetDateTime;

public record RoomBlockResponse(

        Long id,

        Long roomId,
        String roomNumber,
        String roomName,

        RoomBlockType blockType,
        RoomBlockStatus status,

        OffsetDateTime startAt,
        OffsetDateTime endAt,

        String reason,
        String notes,

        Long createdById,
        String createdByName
) {
}
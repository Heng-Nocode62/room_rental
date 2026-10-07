package com.heng.roomrental.reservation.dto;

import com.heng.roomrental.reservation.entity.RoomBlockType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

public record CreateRoomBlockRequest(

        @NotNull
        Long roomId,

        @NotNull
        RoomBlockType blockType,

        @NotNull
        @Future
        OffsetDateTime startAt,

        @NotNull
        @Future
        OffsetDateTime endAt,

        @Size(max = 255)
        String reason,

        String notes
) {
}
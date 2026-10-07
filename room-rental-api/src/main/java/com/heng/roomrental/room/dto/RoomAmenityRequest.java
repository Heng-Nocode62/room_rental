package com.heng.roomrental.room.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RoomAmenityRequest(

        @NotNull
        Long amenityId,

        @NotNull
        @Positive
        Integer amount
) {
}

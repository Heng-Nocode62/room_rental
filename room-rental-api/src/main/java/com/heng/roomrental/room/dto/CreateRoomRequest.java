package com.heng.roomrental.room.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record CreateRoomRequest(

        @NotNull
        Long locationId,

        @NotNull
        Long roomTypeId,

        @NotBlank
        @Size(max = 50)
        String roomNumber,

        @NotBlank
        @Size(max = 100)
        String name,

        @Size(max = 50)
        String floor,

        String description,

        BigDecimal hourlyPrice,
        BigDecimal dailyPrice,
        @Valid
        List<RoomAmenityRequest> amenities
) {
}

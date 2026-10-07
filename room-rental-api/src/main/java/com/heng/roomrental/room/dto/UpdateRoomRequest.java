package com.heng.roomrental.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateRoomRequest(

        @NotBlank
        @Size(max = 100)
        String name,

        @Size(max = 50)
        String floor,
        String description,
        @NotNull
        BigDecimal dailyPrice,
        @NotNull
        BigDecimal hourlyPrice

) {
}
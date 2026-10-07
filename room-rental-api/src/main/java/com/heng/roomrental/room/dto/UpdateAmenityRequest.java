package com.heng.roomrental.room.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateAmenityRequest(

        @NotBlank
        @Size(max = 100)
        String name,

        @Size(max = 255)
        String description,

        @NotNull
        @DecimalMin(value = "0.0")
        BigDecimal price,

        @NotNull
        @PositiveOrZero
        Integer stockQuantity
) {
}

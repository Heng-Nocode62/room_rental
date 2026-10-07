package com.heng.roomrental.pricing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateRoomPriceRequest(

        @NotNull
        @DecimalMin("0.00")
        BigDecimal price,

        @NotNull
        @Size(min = 3, max = 3)
        String currencyCode
) {
}
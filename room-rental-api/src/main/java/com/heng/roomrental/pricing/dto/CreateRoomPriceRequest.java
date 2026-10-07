package com.heng.roomrental.pricing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateRoomPriceRequest(

        @NotNull
        Long roomId,

        @NotNull
        Short pricingUnitId,

        @NotNull
        @DecimalMin("0.00")
        BigDecimal price,

        @NotNull
        @Size(min = 3, max = 3)
        String currencyCode,

        @NotNull
        LocalDate effectiveFrom,

        LocalDate effectiveTo
) {
}
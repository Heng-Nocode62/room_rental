package com.heng.roomrental.pricing.dto;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record PriceCalculationRequest(

        @NotNull
        Long roomId,

        @NotNull
        Short pricingUnitId,

        @NotNull
        OffsetDateTime startAt,

        @NotNull
        OffsetDateTime endAt

) {
}
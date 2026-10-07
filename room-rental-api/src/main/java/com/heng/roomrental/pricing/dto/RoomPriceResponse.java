package com.heng.roomrental.pricing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RoomPriceResponse(
        Long id,

        Long roomId,
        String roomNumber,

        Short pricingUnitId,
        String pricingUnitCode,
        String pricingUnitName,

        BigDecimal price,
        String currencyCode,

        LocalDate effectiveFrom,
        LocalDate effectiveTo,

        String status
) {
}
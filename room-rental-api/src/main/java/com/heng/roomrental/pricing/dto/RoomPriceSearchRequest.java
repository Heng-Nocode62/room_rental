package com.heng.roomrental.pricing.dto;

import com.heng.roomrental.pricing.entity.RoomPriceStatus;

import java.time.LocalDate;

public record RoomPriceSearchRequest(

        Long roomId,

        Long pricingUnitId,

        RoomPriceStatus status,

        LocalDate effectiveDate,

        LocalDate fromDate,

        LocalDate toDate
) {
}
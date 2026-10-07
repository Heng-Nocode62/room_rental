package com.heng.roomrental.reservation.dto;

import com.heng.roomrental.reservation.entity.ReservationStatus;

import java.time.LocalDate;

public record ReservationSearchRequest(

        String keyword,

        Long roomId,

        Long locationId,

        String status,

        Short pricingUnitId,

        LocalDate date,

        LocalDate fromDate,

        LocalDate toDate
) {
}
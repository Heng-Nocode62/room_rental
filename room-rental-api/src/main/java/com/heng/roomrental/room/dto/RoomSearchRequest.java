package com.heng.roomrental.room.dto;

import com.heng.roomrental.room.entity.RoomStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RoomSearchRequest(
        String keyword,

        Long locationId,

        Long roomTypeId,

        RoomStatus status,

        Integer minCapacity,

        Integer maxCapacity,

        Long amenityId,

        List<Long> amenityIds,

        List<String> floors,

        BigDecimal minHourlyPrice,

        BigDecimal maxHourlyPrice,

        LocalDate effectiveDate
) {
}
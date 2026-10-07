package com.heng.roomrental.location.dto;

import java.time.LocalTime;

public record OperatingHoursResponse(
        Long id,
        Long locationId,
        Short dayOfWeek,
        LocalTime openTime,
        LocalTime closeTime,
        boolean closed
) {
}
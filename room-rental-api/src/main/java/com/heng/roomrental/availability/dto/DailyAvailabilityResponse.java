package com.heng.roomrental.availability.dto;

import java.time.LocalDate;

public record DailyAvailabilityResponse(
        LocalDate date,
        DailyAvailabilityStatus status
) {
}
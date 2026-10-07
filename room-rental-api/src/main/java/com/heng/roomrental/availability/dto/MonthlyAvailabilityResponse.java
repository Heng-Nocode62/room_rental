package com.heng.roomrental.availability.dto;

import java.time.LocalDate;
import java.util.List;

public record MonthlyAvailabilityResponse(
        Long roomId,
        String roomNumber,
        String roomName,
        int year,
        int month,
        List<DailyAvailabilityResponse> days
) {
}
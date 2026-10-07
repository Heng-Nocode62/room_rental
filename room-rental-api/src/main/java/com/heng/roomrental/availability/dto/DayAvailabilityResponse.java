package com.heng.roomrental.availability.dto;

import java.time.LocalDate;
import java.util.List;

public record DayAvailabilityResponse(
        Long roomId,
        String roomNumber,
        String roomName,

        LocalDate date,

        String timezone,

        List<TimeSlotResponse> slots
) {
}
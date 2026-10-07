package com.heng.roomrental.availability.dto;

import java.time.LocalDate;
import java.util.List;

public record DayAvailabilityOverviewResponse(
        LocalDate date,
        List<RoomAvailabilityResponse> rooms
) {
}
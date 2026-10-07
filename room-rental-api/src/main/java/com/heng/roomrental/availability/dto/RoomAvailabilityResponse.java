package com.heng.roomrental.availability.dto;

import java.time.LocalTime;
import java.util.List;

public record RoomAvailabilityResponse(
        Long roomId,
        Long locationId,
        String roomNumber,
        String roomName,

        Long roomTypeId,
        String roomTypeName,

        Integer capacity,

        String timezone,

        LocalTime operatingStart,
        LocalTime operatingEnd,

        List<TimeSlotResponse> slots
) {
}
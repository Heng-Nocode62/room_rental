package com.heng.roomrental.availability.dto;

import java.time.LocalTime;

public record TimeSlotResponse(
        LocalTime start,
        LocalTime end,
        SlotStatus status,
        Long reservationId,
        String referenceNo,
        String reason
) {
}
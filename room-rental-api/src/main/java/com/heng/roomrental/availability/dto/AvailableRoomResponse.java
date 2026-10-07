package com.heng.roomrental.availability.dto;

import java.math.BigDecimal;
import java.util.List;

public record AvailableRoomResponse(
        Long roomId,
        String roomNumber,
        String roomName,

        Long roomTypeId,
        String roomTypeName,

        Integer capacity,

        String status,

        List<String> amenities,

        BigDecimal hourlyPrice,
        BigDecimal dailyPrice
) {
}
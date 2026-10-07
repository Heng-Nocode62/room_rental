package com.heng.roomrental.room.dto;

import java.math.BigDecimal;

public record RoomAmenityResponse(
        Long amenityId,
        String name,
        String description,
        BigDecimal price,
        Integer amount
) {
}

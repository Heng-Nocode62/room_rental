package com.heng.roomrental.room.dto;

import java.math.BigDecimal;

public record AmenityResponse(
        Long id,
        Long locationId,
        String name,
        String description,
        BigDecimal price,
        Integer stockQuantity,
        String status
) {
}

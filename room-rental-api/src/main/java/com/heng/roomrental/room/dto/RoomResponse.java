package com.heng.roomrental.room.dto;

import com.heng.roomrental.pricing.dto.RoomPriceResponse;

import java.util.List;

public record RoomResponse(
        Long id,
        Long locationId,
        String locationName,
        Long roomTypeId,
        String roomTypeName,
        String roomNumber,
        String name,
        String floor,
        String description,
        Integer capacity,
        String status,
        List<RoomPriceResponse> prices,
        List<RoomAmenityResponse> amenities
) {
}

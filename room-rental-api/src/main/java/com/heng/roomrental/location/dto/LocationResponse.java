package com.heng.roomrental.location.dto;

public record LocationResponse(
        Long id,
        String name,
        String code,
        String address,
        String phone,
        String timeZone,
        Integer floor,
        Long ownerId,
        String status,
        long totalRooms,
        String imageUrl,
        String locationBakongAccountId,
        String telegramContact
) {
}
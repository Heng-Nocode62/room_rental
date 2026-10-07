package com.heng.roomrental.location.dto;

public record LocationResponse(
        Long id,
        String name,
        String code,
        String address,
        String phone,
        String timeZone,
        String status,
        long totalRooms
) {
}
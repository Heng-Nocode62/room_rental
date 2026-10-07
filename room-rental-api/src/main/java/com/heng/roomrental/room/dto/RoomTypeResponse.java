package com.heng.roomrental.room.dto;

public record RoomTypeResponse(
        Long id,
        String name,
        String code,
        String description,
        Integer capacity,
        String status
) {
}
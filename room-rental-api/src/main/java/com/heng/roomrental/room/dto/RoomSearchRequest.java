package com.heng.roomrental.room.dto;

import com.heng.roomrental.room.entity.RoomStatus;

public record RoomSearchRequest(

        String keyword,

        Long locationId,

        Long roomTypeId,

        RoomStatus status,

        Integer minCapacity,

        Integer maxCapacity,

        Long amenityId

) {
}
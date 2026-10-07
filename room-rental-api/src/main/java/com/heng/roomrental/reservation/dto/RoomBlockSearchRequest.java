package com.heng.roomrental.reservation.dto;

import com.heng.roomrental.reservation.entity.RoomBlockStatus;
import com.heng.roomrental.reservation.entity.RoomBlockType;

import java.time.LocalDate;

public record RoomBlockSearchRequest(

        String keyword,

        Long roomId,

        Long locationId,

        RoomBlockType blockType,

        RoomBlockStatus status,

        LocalDate date,

        LocalDate fromDate,

        LocalDate toDate
) {
}
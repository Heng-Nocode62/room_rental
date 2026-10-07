package com.heng.roomrental.location.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record OperatingHoursRequest(

        @NotNull
        Short dayOfWeek,

        LocalTime openTime,

        LocalTime closeTime,

        boolean closed
) {
}
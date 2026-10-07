package com.heng.roomrental.availability.dto;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record AvailabilityRequest(

        @NotNull
        Long locationId,

        @NotNull
        OffsetDateTime startAt,

        @NotNull
        OffsetDateTime endAt,

        Integer capacity
) {
}
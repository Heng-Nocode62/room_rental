package com.heng.roomrental.reservation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReservationAmenityRequest(

        @NotNull
        Long amenityId,

        @NotNull
        @Min(1)
        Integer quantity

) {
}
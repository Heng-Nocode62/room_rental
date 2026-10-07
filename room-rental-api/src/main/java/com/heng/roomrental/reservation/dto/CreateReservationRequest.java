package com.heng.roomrental.reservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.List;

public record CreateReservationRequest(

        @NotNull
        Long roomId,

        @NotNull
        Short pricingUnitId,

        @NotNull
        OffsetDateTime startAt,

        @NotNull
        OffsetDateTime endAt,

        @NotBlank
        @Size(max = 255)
        String purpose,

        @NotBlank
        @Size(max = 150)
        String contactName,

        @Size(max = 30)
        String contactPhone,

        @Size(max = 150)
        String companyName,

        @Size(max = 1000)
        String notes,
        List<ReservationAmenityRequest> amenities
) {
}
package com.heng.roomrental.reservation.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ReservationResponse(

        Long id,

        String referenceNo,

        Long roomId,
        String roomNumber,
        String roomName,

        Long reservedById,
        String reservedByName,

        String status,

        OffsetDateTime startAt,
        OffsetDateTime endAt,

        short pricingUnitId,
        String pricingUnitCode,

        BigDecimal unitPrice,
        BigDecimal totalAmount,

        String currencyCode,

        String purpose,

        String contactName,
        String contactPhone,
        String companyName,

        String notes
) {
}
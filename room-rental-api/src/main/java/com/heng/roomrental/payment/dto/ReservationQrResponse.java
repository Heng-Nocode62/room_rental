package com.heng.roomrental.payment.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ReservationQrResponse(
        Long reservationId,
        String reservationReference,
        String locationName,
        BigDecimal amount,
        String currency,
        String qrString,
        String deeplink,
        Instant expiresAt,
        String telegramContact
) {
}
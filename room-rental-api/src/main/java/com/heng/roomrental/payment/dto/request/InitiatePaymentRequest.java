package com.heng.roomrental.payment.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record InitiatePaymentRequest(
        @NotNull Long reservationId,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        String currency,
        String description
) {
}

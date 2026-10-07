package com.heng.roomrental.payment.dto;

import java.math.BigDecimal;

public record GatewayRefundResult(
        boolean success,
        String message,
        BigDecimal amount
) {
}

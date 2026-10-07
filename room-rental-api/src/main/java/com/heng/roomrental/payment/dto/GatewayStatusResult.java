package com.heng.roomrental.payment.dto;

import java.math.BigDecimal;

public record GatewayStatusResult(
        GatewayPaymentStatus status,
        String gatewayReference,
        String payerAccountId,
        BigDecimal paidAmount,
        String paidCurrency,
        String rawMessage
) {
}

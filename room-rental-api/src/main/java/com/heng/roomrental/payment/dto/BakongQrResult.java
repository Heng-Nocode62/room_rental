package com.heng.roomrental.payment.dto;

import java.time.Instant;

public record BakongQrResult(
        String qrString,
        String deeplink,
        Instant expiresAt
) {
}
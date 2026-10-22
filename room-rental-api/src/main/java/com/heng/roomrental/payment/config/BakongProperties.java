package com.heng.roomrental.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "bakong")
public record BakongProperties(
        String baseUrl,
        String token,
        String merchantId,
        String acquiringBank,
        String merchantName,
        String merchantCity,
        String storeLabel,
        String terminalLabel,
        Integer qrExpiryMinutes,
        String appName,
        String appIconUrl,
        String appDeepLinkCallback
) {
}
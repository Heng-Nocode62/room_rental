package com.heng.roomrental.payment.gateway;

import com.heng.roomrental.payment.config.BakongProperties;
import com.heng.roomrental.payment.dto.BakongQrResult;
import kh.gov.nbc.bakong_khqr.BakongKHQR;
import kh.gov.nbc.bakong_khqr.model.KHQRCurrency;
import kh.gov.nbc.bakong_khqr.model.KHQRData;
import kh.gov.nbc.bakong_khqr.model.KHQRResponse;
import kh.gov.nbc.bakong_khqr.model.MerchantInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class BakongGateway {

    private static final String DEFAULT_BASE_URL =
            "https://api-bakong.nbc.gov.kh";

    private final BakongProperties properties;

    public BakongQrResult generateQr(
            String locationBakongAccountId,
            BigDecimal amount,
            String currency,
            String billNumber,
            String locationName
    ) {
        if (!hasText(locationBakongAccountId)) {
            throw new IllegalArgumentException(
                    "The location's Bakong account ID is not configured."
            );
        }

        if (amount == null ||
                amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Reservation amount must be greater than zero."
            );
        }

        if (!hasText(billNumber)) {
            throw new IllegalArgumentException(
                    "Reservation reference is required for KHQR generation."
            );
        }

        if (!hasText(properties.merchantId())) {
            throw new IllegalStateException(
                    "BAKONG_MERCHANT_ID is not configured."
            );
        }

        KHQRCurrency khqrCurrency = toKhqrCurrency(currency);

        int expiryMinutes =
                properties.qrExpiryMinutes() == null ||
                        properties.qrExpiryMinutes() < 1
                        ? 10
                        : properties.qrExpiryMinutes();

        Instant expiresAt = Instant.now().plus(
                expiryMinutes,
                ChronoUnit.MINUTES
        );

        MerchantInfo merchantInfo = new MerchantInfo();

        merchantInfo.setExpirationTimestamp(expiresAt.toEpochMilli());

        // The receiving account comes from the reservation's location.
        merchantInfo.setBakongAccountId(
                locationBakongAccountId.trim()
        );

        merchantInfo.setMerchantId(properties.merchantId());

        merchantInfo.setAcquiringBank(
                hasText(properties.acquiringBank())
                        ? properties.acquiringBank()
                        : "BAKONG"
        );

        merchantInfo.setCurrency(khqrCurrency);
        merchantInfo.setAmount(amount.doubleValue());

        merchantInfo.setMerchantName(
                hasText(locationName)
                        ? locationName.trim()
                        : properties.merchantName()
        );

        merchantInfo.setMerchantCity(
                hasText(properties.merchantCity())
                        ? properties.merchantCity()
                        : "PHNOM PENH"
        );

        merchantInfo.setBillNumber(billNumber);

        if (hasText(properties.storeLabel())) {
            merchantInfo.setStoreLabel(properties.storeLabel());
        }

        if (hasText(properties.terminalLabel())) {
            merchantInfo.setTerminalLabel(
                    properties.terminalLabel()
            );
        }

        KHQRResponse<KHQRData> response =
                BakongKHQR.generateMerchant(merchantInfo);

        if (response == null ||
                response.getData() == null ||
                !hasText(response.getData().getQr()) ||
                !hasText(response.getData().getMd5())) {
            throw new IllegalStateException(
                    "Bakong could not generate a KHQR for this reservation."
            );
        }

        String qrString = response.getData().getQr();
        String deeplink = generateDeeplink(qrString);

        return new BakongQrResult(
                qrString,
                deeplink,
                expiresAt
        );
    }

    private KHQRCurrency toKhqrCurrency(String currency) {
        if (!hasText(currency)) {
            throw new IllegalArgumentException(
                    "Reservation currency is not configured."
            );
        }

        return switch (currency.trim().toUpperCase(Locale.ROOT)) {
            case "USD" -> KHQRCurrency.USD;
            case "KHR" -> KHQRCurrency.KHR;
            default -> throw new IllegalArgumentException(
                    "Bakong KHQR only supports USD or KHR for this flow."
            );
        };
    }

    private String generateDeeplink(String qrString) {
        // The deeplink is optional. The QR itself still works without it.
        if (!hasText(properties.token())) {
            return null;
        }

        String baseUrl = hasText(properties.baseUrl())
                ? properties.baseUrl().replaceAll("/+$", "")
                : DEFAULT_BASE_URL;

        try {
            RestClient client = RestClient.builder()
                    .baseUrl(baseUrl)
                    .build();

            Map<String, Object> request = new HashMap<>();
            request.put("qr", qrString);

            if (hasText(properties.appIconUrl()) &&
                    hasText(properties.appDeepLinkCallback())) {
                request.put("sourceInfo", Map.of(
                        "appName",
                        hasText(properties.appName())
                                ? properties.appName()
                                : "ROOM RENTAL",
                        "appIconUrl",
                        properties.appIconUrl(),
                        "appDeepLinkCallback",
                        properties.appDeepLinkCallback()
                ));
            }

            Map<?, ?> response = client.post()
                    .uri("/v1/generate_deeplink_by_qr")
                    .header(
                            HttpHeaders.AUTHORIZATION,
                            "Bearer " + properties.token()
                    )
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(Map.class);

            if (response != null &&
                    toInt(response.get("responseCode")) == 0 &&
                    response.get("data") instanceof Map<?, ?> data &&
                    data.get("shortLink") instanceof String shortLink) {
                return shortLink;
            }

        } catch (Exception exception) {
            log.warn(
                    "Bakong deeplink generation failed: {}",
                    exception.getMessage()
            );
        }

        return null;
    }

    private int toInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }

        if (value instanceof String string) {
            try {
                return Integer.parseInt(string);
            } catch (NumberFormatException ignored) {
                return -1;
            }
        }

        return -1;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
package com.heng.roomrental.payment.gateway;
import com.heng.roomrental.payment.config.BakongProperties;
import com.heng.roomrental.payment.dto.*;
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
import java.util.Map;

@Component("bakongGateway")
@RequiredArgsConstructor
@Slf4j
public class BakongGateway implements PaymentGateway {
    private final RestClient bakongRestClient;
    private final BakongProperties properties;

    @Override
    public GatewayInitResult initiatePayment(PaymentInitCommand command) {


        Instant expiresAt = Instant.now().plus(properties.qrExpiryMinutes(),ChronoUnit.MINUTES);
        MerchantInfo merchantInfo = new MerchantInfo();

        merchantInfo.setExpirationTimestamp(System.currentTimeMillis() + properties.qrExpiryMinutes()* 60 * 1000);

        merchantInfo.setBakongAccountId(properties.accountId());
        merchantInfo.setMerchantId(properties.merchantId());
        merchantInfo.setAcquiringBank("BAKONG");
        merchantInfo.setCurrency(KHQRCurrency.USD);
        merchantInfo.setAmount(command.amount().doubleValue());
        merchantInfo.setMerchantName(properties.merchantName());
        merchantInfo.setMerchantCity(properties.merchantCity());
        merchantInfo.setBillNumber(command.transactionId());
        merchantInfo.setStoreLabel(properties.storeLabel());
        merchantInfo.setTerminalLabel(properties.terminalLabel());
        KHQRResponse<KHQRData> khqrDataKHQRResponse = BakongKHQR.generateMerchant(merchantInfo);
        String deeplink = generateDeeplink(khqrDataKHQRResponse.getData().getQr());
        return new GatewayInitResult(
                khqrDataKHQRResponse.getData().getMd5(),
                khqrDataKHQRResponse.getData().getQr(),
                null,
                null,
                deeplink,
               expiresAt
        );
    }

    @Override
    public GatewayStatusResult checkStatus(String gatewayReference) {
        String url = properties.baseUrl().replaceAll("/+$", "") + "/v1/check_transaction_by_md5";
        RestClient restClient = RestClient.create();
        Map<?,?> responseBody = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.token())
                .body(Map.of("md5", gatewayReference))
                .retrieve()
                .body(Map.class);
        log.info("Data response from Bakong API: {}", responseBody);
        return parseStatusResponse(responseBody);
    }


    @Override
    public GatewayRefundResult refund(String gatewayRef, BigDecimal amount, String reason) {
        log.warn("[Bakong] Refund requested for ref={} amount={} — must be processed manually via bank", gatewayRef, amount);
        return new GatewayRefundResult(
                true,
                "Bakong does not support API refunds. Process manually via your bank portal.",
                amount
        );
    }

    @Override
    public String gatewayName() {
        return "Bakong NBC";
    }

    public String generateDeeplink(String khqrString) {
        try{
            Map response = bakongRestClient
                    .post()
                    .uri("/v1/generate_deeplink_by_qr")
                    .body(
                            Map.of(
                                    "qr",khqrString,
                                    "sourceInfo",Map.of(
                                            "appName", "ROOM RENTAL",
                                            "appIconUrl", "room icon",
                                            "appDeepLinkCallback", "change later"
                                    )
                            )
                    )
                    .retrieve()
                    .body(Map.class);
            if(response != null && Integer.valueOf(0).equals(response.get("responseCode"))){
                Map data = (Map) response.get("data");
                return data != null ? (String) data.get("shortLink"):null;
            }
        }catch(Exception e){
            log.warn("Deeplink generation failed (non-fetal): {}",e.getMessage());
        }
        return null;
    }

    private GatewayStatusResult parseStatusResponse(Map response) {
        if(response == null){ return pendingStatusResult("Empty Response");}
        int responseCode = toInt(response.get("responseCode"));
        int errorCode = toInt(response.getOrDefault("errorCode",-1));
        String message = (String) response.getOrDefault("responseMessage","");

        if (responseCode != 0) {
            GatewayPaymentStatus status = (errorCode==3)? GatewayPaymentStatus.FAILED : GatewayPaymentStatus.PENDING;
            return new GatewayStatusResult(status,null,null,null,null,message);
        }

        Map data =  (Map) response.get("data");
        if (data == null) {
            return pendingStatusResult("No data");
        }

        return new GatewayStatusResult(
                GatewayPaymentStatus.SUCCESS,
                (String) data.get("hash"),
                (String) data.get("fromAccountId"),
                data.get("amount") != null? new BigDecimal(data.get("amount").toString()):null,
                (String) data.get("currency"),
                message
        );
    }
    private GatewayStatusResult pendingStatusResult(String message){
        return new GatewayStatusResult(GatewayPaymentStatus.PENDING,null,null,null,null, message);
    }

    private int toInt(Object value){
        if (value==null){
            return -1;
        }
        return ((Number)value).intValue();
    }
}

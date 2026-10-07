package com.heng.roomrental.payment.dto.response;

import com.heng.roomrental.payment.enums.PaymentMethod;
import com.heng.roomrental.payment.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentInitiateResponse {
    private Long paymentId;
    private Long reservationId;
    private String billNumber;
    private String gatewayName;
    private PaymentMethod paymentMethod;
    private String khqrString;
    private String khqrDeeplink;
    private String checkoutUrl;
    private BigDecimal amount;
    private String currency;
    private Instant expiresAt;
    private PaymentStatus status;
}

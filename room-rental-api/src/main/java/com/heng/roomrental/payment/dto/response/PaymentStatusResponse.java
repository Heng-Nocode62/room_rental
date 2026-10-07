package com.heng.roomrental.payment.dto.response;

import com.heng.roomrental.payment.enums.PaymentMethod;
import com.heng.roomrental.payment.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentStatusResponse {
    private Long paymentId;
    private Long reservationId;
    private String billNumber;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private BigDecimal amount;
    private String currency;
    private String gatewayName;
    private String payerAccountId;
    private OffsetDateTime createdAt;
    private OffsetDateTime paidAt;
    private Instant expiresAt;
    private String errorMessage;
}

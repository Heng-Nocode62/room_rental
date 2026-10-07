package com.heng.roomrental.payment.entity;

import com.heng.roomrental.common.entity.BaseEntity;
import com.heng.roomrental.payment.enums.PaymentMethod;
import com.heng.roomrental.payment.enums.PaymentStatus;
import com.heng.roomrental.reservation.entity.Reservation;
import com.heng.roomrental.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "payments")
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentMethod method = PaymentMethod.KHQR;

    @Column(name = "gateway_name", length = 30)
    private String gatewayName;

    @Column(name = "gateway_reference", length = 100, unique = true)
    private String gatewayReference;

    @Column(name = "bill_number", unique = true, length = 25)
    private String billNumber;

    @Column(name = "qr_string", columnDefinition = "TEXT")
    private String qrString;

    @Column(name = "qr_image_b64", columnDefinition = "TEXT")
    private String qrImageBase64;

    @Column(name = "deeplink", columnDefinition = "TEXT")
    private String deeplink;

    @Column(name = "checkout_url", columnDefinition = "TEXT")
    private String checkoutUrl;

    @Column(name = "qr_expires_at")
    private Instant qrExpiresAt;

    @Column(name = "payer_account_id", length = 100)
    private String payerAccountId;

    @Column(name = "confirmed_amount", precision = 19, scale = 4)
    private BigDecimal confirmedAmount;

    @Column(name = "confirmed_currency", length = 3)
    private String confirmedCurrency;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "expires_at")
    private Instant expiresAt;
}

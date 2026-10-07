package com.heng.roomrental.payment.service;

import com.heng.roomrental.payment.config.BakongProperties;
import com.heng.roomrental.payment.dto.GatewayStatusResult;
import com.heng.roomrental.payment.dto.PaymentInitCommand;
import com.heng.roomrental.payment.dto.request.InitiatePaymentRequest;
import com.heng.roomrental.payment.dto.response.PaymentInitiateResponse;
import com.heng.roomrental.payment.dto.response.PaymentStatusResponse;
import com.heng.roomrental.payment.entity.Payment;
import com.heng.roomrental.payment.enums.PaymentMethod;
import com.heng.roomrental.payment.enums.PaymentStatus;
import com.heng.roomrental.payment.exception.PaymentException;
import com.heng.roomrental.payment.gateway.PaymentGateway;
import com.heng.roomrental.payment.repository.PaymentRepository;
import com.heng.roomrental.reservation.entity.Reservation;
import com.heng.roomrental.reservation.entity.enums.ReservationStatus;
import com.heng.roomrental.reservation.repository.ReservationRepository;
import com.heng.roomrental.reservation.repository.ReservationStatusRepository;
import com.heng.roomrental.reservation.service.ReservationService;
import com.heng.roomrental.reservation.service.ReservationStatusService;
import com.heng.roomrental.security.CurrentUserService;
import com.heng.roomrental.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;
    private final CurrentUserService currentUser;
    private final PaymentGateway paymentGateway;
    private final BakongProperties bakongProperties;
    private final ReservationStatusRepository reservationStatusRepository;

    @Transactional
    public PaymentInitiateResponse initiatePayment(InitiatePaymentRequest request) {
        Reservation reservation = reservationRepository.findById(request.reservationId())
                .orElseThrow(() -> new PaymentException("Reservation not found id: " + request.reservationId()));

        if (!reservation.getStatus().getCode().equals(ReservationStatus.PENDING.name()) ) {
            throw new PaymentException("Reservation is not waiting for payment");
        }

        Payment existingPayment = paymentRepository.findFirstByReservation_IdOrderByCreatedAtDesc(request.reservationId())
                .orElse(null);

        if (existingPayment != null) {
            if (existingPayment.getStatus() == PaymentStatus.PENDING) {
                throw new PaymentException("A pending KHQR payment already exists for reservation " + request.reservationId());
            }
            if (existingPayment.getStatus() == PaymentStatus.SUCCESS) {
                throw new PaymentException("Reservation " + request.reservationId() + " is already paid");
            }
        }

        if (request.amount().compareTo(reservation.getTotalAmount()) != 0) {
            throw new PaymentException("Payment amount does not match reservation total");
        }


        String billNumber = "PAY-" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);

        PaymentInitCommand command = new PaymentInitCommand(
                billNumber,
                request.amount(),
                "USD",
                request.description()
        );

        User user = currentUser.getCurrentUser();

        var gatewayResult = paymentGateway.initiatePayment(command);

        Payment payment = Payment.builder()
                .reservation(reservation)
                .user(user)
                .amount(request.amount())
                .currency("USD")
                .status(PaymentStatus.PENDING)
                .method(PaymentMethod.KHQR)
                .gatewayName(paymentGateway.gatewayName())
                .gatewayReference(gatewayResult.gatewayReference())
                .billNumber(billNumber)
                .checkoutUrl(gatewayResult.checkoutUrl())
                .qrString(gatewayResult.qrString())
                .qrImageBase64(gatewayResult.qrImageB64())
                .deeplink(gatewayResult.deeplink())
                .expiresAt(gatewayResult.expiresAt())
                .qrExpiresAt(gatewayResult.expiresAt())
                .build();

        paymentRepository.save(payment);

        log.info("KHQR payment initiated: paymentId={} reservationId={} amount={} {}",
                payment.getId(), reservation.getId(), payment.getAmount(), payment.getCurrency());

        return PaymentInitiateResponse.builder()
                .paymentId(payment.getId())
                .reservationId(reservation.getId())
                .billNumber(billNumber)
                .gatewayName(payment.getGatewayName())
                .paymentMethod(payment.getMethod())
                .khqrString(payment.getQrString())
                .khqrDeeplink(payment.getDeeplink())
                .checkoutUrl(payment.getCheckoutUrl())
                .amount(payment.getAmount())
                .currency("USD")
                .expiresAt(payment.getExpiresAt())
                .status(PaymentStatus.PENDING)
                .build();
    }

    @Transactional
    public PaymentStatusResponse checkPaymentStatus(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException("Payment with id: " + paymentId + " not found"));

        if (payment.getStatus() == PaymentStatus.PENDING && payment.getGatewayReference() != null) {
            pollBakongAndUpdate(payment);
        }

        return toPaymentStatusResponse(payment);
    }

    @Transactional
    public PaymentStatusResponse getById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException("Payment with id: " + paymentId + " not found"));
        return toPaymentStatusResponse(payment);
    }

    @Transactional
    public PaymentStatusResponse cancelPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException("Payment with id: " + paymentId + " not found"));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            return toPaymentStatusResponse(payment);
        }

        if (payment.getQrExpiresAt() != null && Instant.now().isAfter(payment.getQrExpiresAt())) {
            payment.setStatus(PaymentStatus.EXPIRED);
            paymentRepository.save(payment);
            return toPaymentStatusResponse(payment);
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        paymentRepository.save(payment);

        reservationService.cancelAfterPaymentFailure(payment.getReservation());

        log.info("Payment cancelled: paymentId={} reservationId={}",
                payment.getId(), payment.getReservation().getId());

        return toPaymentStatusResponse(payment);
    }

    @Scheduled(fixedDelayString = "${bakong.poll-interval-seconds:30}000")
    @Transactional
    public void pollPendingPayments() {
        List<Payment> pendingPayments = paymentRepository.findActivePendingPayment(PaymentStatus.PENDING, Instant.now());
        if (!pendingPayments.isEmpty()) {
            pendingPayments.forEach(this::pollBakongAndUpdate);
        }
    }

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void expiredStaleQrPayments() {
        int count = paymentRepository.expireStalePayments(Instant.now());
        if (count > 0) {
            log.info("Marked {} QR payments as EXPIRED", count);
        }
    }

    @Transactional
    private void pollBakongAndUpdate(Payment payment) {
        if (payment.getStatus() != PaymentStatus.PENDING) return;

        if (payment.getQrExpiresAt() != null && Instant.now().isAfter(payment.getQrExpiresAt())) {
            payment.setStatus(PaymentStatus.EXPIRED);
            paymentRepository.save(payment);
            return;
        }

        try {
            GatewayStatusResult result = paymentGateway.checkStatus(payment.getGatewayReference());
            switch (result.status()) {
                case SUCCESS -> {
                    payment.setStatus(PaymentStatus.SUCCESS);
                    payment.setPayerAccountId(result.payerAccountId());
                    payment.setConfirmedAmount(result.paidAmount());
                    payment.setConfirmedCurrency(result.paidCurrency());
                    payment.setPaidAt(Instant.now());
                    paymentRepository.save(payment);
                    reservationService.confirmAfterPayment(payment.getReservation());
                }
                case FAILED -> {
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setErrorMessage(result.rawMessage());
                    paymentRepository.save(payment);
                    reservationService.cancelAfterPaymentFailure(payment.getReservation());
                }
                case EXPIRED -> {
                    payment.setStatus(PaymentStatus.EXPIRED);
                    paymentRepository.save(payment);
                }
                case PENDING -> log.debug("Still pending payment {}", payment.getId());
            }
        } catch (Exception e) {
            log.error("Error polling payment {}: {}", payment.getId(), e.getMessage());
        }
    }

    private PaymentStatusResponse toPaymentStatusResponse(Payment payment) {
        return PaymentStatusResponse.builder()
                .paymentId(payment.getId())
                .reservationId(payment.getReservation().getId())
                .billNumber(payment.getBillNumber())
                .paymentMethod(payment.getMethod())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .gatewayName(payment.getGatewayName())
                .payerAccountId(payment.getPayerAccountId())
                .createdAt(payment.getCreatedAt())
                .expiresAt(payment.getExpiresAt())
                .errorMessage(payment.getErrorMessage())
                .paidAt(payment.getPaidAt() != null? OffsetDateTime.ofInstant(payment.getPaidAt(), ZoneId.of("Asia/Phnom_Penh")): null)
                .build();
    }
}

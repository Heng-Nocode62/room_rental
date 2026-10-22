package com.heng.roomrental.payment.service;

import com.heng.roomrental.common.exception.InvalidOperationException;
import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.location.entity.Location;
import com.heng.roomrental.payment.dto.BakongQrResult;
import com.heng.roomrental.payment.dto.ReservationQrResponse;
import com.heng.roomrental.payment.gateway.BakongGateway;
import com.heng.roomrental.reservation.entity.Reservation;
import com.heng.roomrental.reservation.repository.ReservationRepository;
import com.heng.roomrental.security.CurrentUserService;
import com.heng.roomrental.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ReservationQrService {

    private final ReservationRepository reservationRepository;
    private final CurrentUserService currentUserService;
    private final BakongGateway bakongGateway;

    @Transactional(readOnly = true)
    public ReservationQrResponse generateForReservation(
            Long reservationId
    ) {
        User currentUser = currentUserService.getCurrentUser();

        Reservation reservation = reservationRepository
                .findById(reservationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Reservation not found: " + reservationId
                        )
                );

        if (!reservation.getReservedBy().getId()
                .equals(currentUser.getId())) {
            throw new AccessDeniedException(
                    "You are not allowed to generate a QR for this reservation."
            );
        }

        // A newly created customer reservation starts in PENDING status.
        if (!"PENDING".equalsIgnoreCase(
                reservation.getStatus().getCode()
        )) {
            throw new InvalidOperationException(
                    "RESERVATION_NOT_PENDING",
                    "A KHQR can only be generated for a pending reservation."
            );
        }

        Location location = reservation.getRoom().getLocation();

        String accountId = location.getLocationBakongAccountId();

        if (accountId == null || accountId.isBlank()) {
            throw new InvalidOperationException(
                    "LOCATION_BAKONG_ACCOUNT_NOT_CONFIGURED",
                    "The location owner must configure a Bakong account ID first."
            );
        }

        BigDecimal amount = reservation.getTotalAmount();

        if (amount == null ||
                amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOperationException(
                    "INVALID_RESERVATION_AMOUNT",
                    "This reservation has no valid amount to pay."
            );
        }

        BakongQrResult qr = bakongGateway.generateQr(
                accountId,
                amount,
                reservation.getCurrencyCode(),
                reservation.getReferenceNo(),
                location.getName()
        );

        return new ReservationQrResponse(
                reservation.getId(),
                reservation.getReferenceNo(),
                location.getName(),
                amount,
                reservation.getCurrencyCode(),
                qr.qrString(),
                qr.deeplink(),
                qr.expiresAt(),
                location.getTelegramContact()
        );
    }
}
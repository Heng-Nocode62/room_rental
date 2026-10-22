package com.heng.roomrental.reservation.service.impl;

import com.heng.roomrental.common.exception.InvalidOperationException;
import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.location.security.LocationSecurity;
import com.heng.roomrental.reservation.dto.ReservationResponse;
import com.heng.roomrental.reservation.entity.Reservation;
import com.heng.roomrental.reservation.entity.ReservationStatus;
import com.heng.roomrental.reservation.repository.ReservationRepository;
import com.heng.roomrental.reservation.repository.ReservationStatusRepository;
import com.heng.roomrental.reservation.service.ReservationService;
import com.heng.roomrental.reservation.service.ReservationStatusService;
import com.heng.roomrental.security.CurrentUserService;
import com.heng.roomrental.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ReservationStatusServiceImpl implements ReservationStatusService {

    private final ReservationRepository reservationRepository;

    private final ReservationStatusRepository reservationStatusRepository;

    private final ReservationService reservationService;
    private final CurrentUserService currentUserService;
    private final LocationSecurity locationSecurity;



    @Override
    @PreAuthorize("hasAuthority('RESERVATION_CREATE')")
    @Transactional
    public ReservationResponse confirm(
            Long reservationId
    ) {
        Reservation reservation =
                getReservation(reservationId);
        locationSecurity.validateOwner(reservation.getRoom().getLocation().getId());

        validateTransition(
                reservation,
                "PENDING",
                "CONFIRMED"
        );

        ReservationStatus confirmedStatus =
                getStatus("CONFIRMED");

        reservation.setStatus(
                confirmedStatus
        );
        reservation.setConfirmedBy(currentUserService.getCurrentUser());

        Reservation saved =
                reservationRepository.save(
                        reservation
                );

        return reservationService.toResponse(
                saved
        );
    }




    @Override
    @PreAuthorize("hasAuthority('RESERVATION_CANCEL')")
    @Transactional
    public ReservationResponse cancel(
            Long reservationId
    ) {

        Reservation reservation =
                getReservation(reservationId);
        User currentUser = currentUserService.getCurrentUser();
        if(!reservation.getReservedBy().getId().equals(currentUser.getId())){
            locationSecurity.validateOwner(reservation.getRoom().getLocation().getId());
        }
        String currentStatus =
                reservation.getStatus().getCode();

        if (!currentStatus.equals("PENDING")
                && !currentStatus.equals("CONFIRMED")) {

            throw new InvalidOperationException(
                    "INVALID_RESERVATION_CANCELLATION",
                    "Reservation with status "
                            + currentStatus
                            + " cannot be cancelled."
            );
        }

        ReservationStatus cancelledStatus =
                getStatus("CANCELLED");

        reservation.setStatus(
                cancelledStatus
        );
        reservation.setCancelledBy(currentUser);
        reservation.setCancelledAt(OffsetDateTime.now());

        Reservation saved =
                reservationRepository.save(
                        reservation
                );

        return reservationService.toResponse(
                saved
        );
    }



    @Override
    @PreAuthorize("hasAuthority('RESERVATION_CHECK_IN')")
    @Transactional
    public ReservationResponse checkIn(
            Long reservationId
    ) {

        Reservation reservation =
                getReservation(reservationId);

        validateTransition(
                reservation,
                "CONFIRMED",
                "CHECKED_IN"
        );

        ReservationStatus checkedInStatus =
                getStatus("CHECKED_IN");

        reservation.setStatus(
                checkedInStatus
        );

        Reservation saved =
                reservationRepository.save(
                        reservation
                );

        return reservationService.toResponse(
                saved
        );
    }



    @Override
    @PreAuthorize("hasAuthority('RESERVATION_CHECK_OUT')")
    @Transactional
    public ReservationResponse checkOut(
            Long reservationId
    ) {

        Reservation reservation =
                getReservation(reservationId);

        validateTransition(
                reservation,
                "CHECKED_IN",
                "COMPLETED"
        );

        ReservationStatus completedStatus =
                getStatus("COMPLETED");

        reservation.setStatus(
                completedStatus
        );

        Reservation saved =
                reservationRepository.save(
                        reservation
                );

        return reservationService.toResponse(
                saved
        );
    }


    private Reservation getReservation(
            Long reservationId
    ) {

        return reservationRepository
                .findById(reservationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Reservation with id "
                                        + reservationId
                                        + " not found."
                        )
                );
    }



    private ReservationStatus getStatus(
            String code
    ) {

        return reservationStatusRepository
                .findByCode(code)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Reservation status '"
                                        + code
                                        + "' not found."
                        )
                );
    }



    private void validateTransition(
            Reservation reservation,
            String expectedCurrentStatus,
            String targetStatus
    ) {

        String currentStatus =
                reservation
                        .getStatus()
                        .getCode();

        if (!currentStatus.equals(
                expectedCurrentStatus
        )) {

            throw new InvalidOperationException(
                    "INVALID_RESERVATION_TRANSITION",

                    "Cannot change reservation "
                            + reservation.getId()
                            + " from "
                            + currentStatus
                            + " to "
                            + targetStatus
                            + "."
            );
        }
    }


}
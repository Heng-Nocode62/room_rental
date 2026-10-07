package com.heng.roomrental.availability.service.impl;

import com.heng.roomrental.availability.service.AvailabilityValidationService;
import com.heng.roomrental.common.exception.RoomNotAvailableException;
import com.heng.roomrental.reservation.repository.ReservationRepository;
import com.heng.roomrental.reservation.repository.RoomBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class AvailabilityValidatorImpl implements AvailabilityValidationService {
    private final ReservationRepository reservationRepository;
    private final RoomBlockRepository roomBlockRepository;
    @Override
    @PreAuthorize("hasAuthority('AVAILABILITY_VIEW')")
    public boolean isAvailable(
            Long roomId,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {

        validateTimeRange(startAt, endAt);

        boolean reservationConflict =
                reservationRepository
                        .existsOverlappingReservation(
                                roomId,
                                startAt,
                                endAt
                        );

        if (reservationConflict) {
            return false;
        }

        boolean blockConflict =
                roomBlockRepository
                        .existsOverlappingBlock(
                                roomId,
                                startAt,
                                endAt
                        );

        return !blockConflict;
    }
    @Override
    @PreAuthorize("hasAuthority('AVAILABILITY_VIEW')")
    public void validateAvailable(
            Long roomId,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {

        if (!isAvailable(
                roomId,
                startAt,
                endAt
        )) {
            throw new RoomNotAvailableException(
                    "Room is not available for the selected time"
            );
        }
    }

    private void validateTimeRange(
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {

        if (startAt == null || endAt == null) {

            throw new IllegalArgumentException(
                    "Start time and end time are required."
            );
        }

        if (!endAt.isAfter(startAt)) {

            throw new IllegalArgumentException(
                    "End time must be after start time."
            );
        }
    }
}

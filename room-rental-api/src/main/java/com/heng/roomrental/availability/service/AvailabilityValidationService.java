package com.heng.roomrental.availability.service;

import java.time.OffsetDateTime;

public interface AvailabilityValidationService {
    boolean isAvailable(
            Long roomId,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    );

    void validateAvailable(
            Long roomId,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    );
}

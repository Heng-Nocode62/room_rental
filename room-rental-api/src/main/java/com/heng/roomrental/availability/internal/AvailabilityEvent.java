package com.heng.roomrental.availability.internal;

import java.time.ZonedDateTime;

public record AvailabilityEvent(
        ZonedDateTime start,
        ZonedDateTime end,

        EventType type,

        Long reservationId,
        String referenceNo,

        String reason
) {

    public static AvailabilityEvent reservation(
            ZonedDateTime start,
            ZonedDateTime end,
            Long reservationId,
            String referenceNo
    ) {
        return new AvailabilityEvent(
                start,
                end,
                EventType.RESERVATION,
                reservationId,
                referenceNo,
                null
        );
    }

    public static AvailabilityEvent block(
            ZonedDateTime start,
            ZonedDateTime end,
            String reason
    ) {
        return new AvailabilityEvent(
                start,
                end,
                EventType.BLOCK,
                null,
                null,
                reason
        );
    }
}
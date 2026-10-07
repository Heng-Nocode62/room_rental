package com.heng.roomrental.availability.internal;

import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.function.Function;

public record RoomOperatingWindow(
        Long roomId,
        ZonedDateTime operatingStart,
        ZonedDateTime operatingEnd
) {

    public OffsetDateTime start() {
        return operatingStart.toOffsetDateTime();
    }

    public OffsetDateTime end() {
        return operatingEnd.toOffsetDateTime();
    }
}
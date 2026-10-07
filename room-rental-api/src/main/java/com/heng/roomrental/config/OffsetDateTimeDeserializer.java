package com.heng.roomrental.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class OffsetDateTimeDeserializer extends JsonDeserializer<OffsetDateTime> {

    private final ZoneId defaultZone;

    public OffsetDateTimeDeserializer(ZoneId defaultZone) {
        this.defaultZone = defaultZone;
    }

    @Override
    public OffsetDateTime deserialize(JsonParser p, DeserializationContext ctx) throws IOException {
        String source = p.getText();
        if (source == null) {
            return null;
        }
        String s = source.trim();
        if (s.isEmpty()) {
            return null;
        }

        // 1) Full offset date-time: 2026-01-14T10:20:30+07:00
        try {
            return OffsetDateTime.parse(s);
        } catch (DateTimeParseException ignored) {
            // try next
        }

        // 2) Instant / UTC "Z": 2026-01-14T10:20:30Z
        try {
            return Instant.parse(s).atOffset(defaultZone.getRules().getOffset(Instant.now()));
        } catch (DateTimeParseException ignored) {
            // try next
        }

        // 3) Local date-time, seconds optional: 2026-08-24T09:00 or 2026-08-24T09:00:00
        try {
            LocalDateTime ldt = LocalDateTime.parse(s, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            return ldt.atZone(defaultZone).toOffsetDateTime();
        } catch (DateTimeParseException ignored) {
            // try next
        }

        // 4) Date only: 2026-08-24 (assume start of day in default zone)
        try {
            LocalDate d = LocalDate.parse(s, DateTimeFormatter.ISO_LOCAL_DATE);
            return d.atStartOfDay(defaultZone).toOffsetDateTime();
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date/time value: " + source);
        }
    }
}
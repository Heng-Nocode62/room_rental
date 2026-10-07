package com.heng.roomrental.availability.service.impl;

import com.heng.roomrental.availability.dto.SlotStatus;
import com.heng.roomrental.availability.dto.TimeSlotResponse;
import com.heng.roomrental.availability.internal.AvailabilityEvent;
import com.heng.roomrental.availability.internal.EventType;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class BuildTimeLineService {

    private static final int SLOT_HOURS = 1;

    public List<TimeSlotResponse> buildTimeline(
            ZonedDateTime operatingStart,
            ZonedDateTime operatingEnd,
            List<AvailabilityEvent> events
    ) {

        List<TimeSlotResponse> result = new ArrayList<>();

        ZonedDateTime cursor = operatingStart;

        for (AvailabilityEvent event : events) {

            ZonedDateTime eventStart = event.start();
            ZonedDateTime eventEnd = event.end();

            // Ignore events completely outside the operating period.
            if (!eventEnd.isAfter(operatingStart)) {
                continue;
            }
            if (!eventStart.isBefore(operatingEnd)) {
                continue;
            }

            // Clamp event to operating hours.
            if (eventStart.isBefore(operatingStart)) {
                eventStart = operatingStart;
            }
            if (eventEnd.isAfter(operatingEnd)) {
                eventEnd = operatingEnd;
            }

            // Available gap before this event.
            if (cursor.isBefore(eventStart)) {
                addHourlySlots(result, cursor, eventStart, SlotStatus.AVAILABLE, null, null, null);
            }

            // Occupied period.
            ZonedDateTime occupiedStart = eventStart.isBefore(cursor) ? cursor : eventStart;
            ZonedDateTime occupiedEnd = eventEnd.isAfter(cursor) ? eventEnd : cursor;

            if (occupiedStart.isBefore(occupiedEnd)) {

                SlotStatus status = event.type() == EventType.RESERVATION
                        ? SlotStatus.RESERVED
                        : SlotStatus.BLOCKED;

                addHourlySlots(
                        result,
                        occupiedStart,
                        occupiedEnd,
                        status,
                        event.reservationId(),
                        event.referenceNo(),
                        event.reason()
                );

                // Move the cursor forward.
                if (cursor.isBefore(occupiedEnd)) {
                    cursor = occupiedEnd;
                }
            }
        }

        // Remaining available period.
        if (cursor.isBefore(operatingEnd)) {
            addHourlySlots(result, cursor, operatingEnd, SlotStatus.AVAILABLE, null, null, null);
        }

        return result;
    }
    private void addHourlySlots(
            List<TimeSlotResponse> result,
            ZonedDateTime start,
            ZonedDateTime end,
            SlotStatus status,
            Long reservationId,
            String referenceNo,
            String reason
    ) {
        ZonedDateTime slotStart = start;

        while (slotStart.isBefore(end)) {

            ZonedDateTime slotEnd = slotStart.plusHours(SLOT_HOURS);
            if (slotEnd.isAfter(end)) {
                slotEnd = end;
            }

            result.add(
                    new TimeSlotResponse(
                            slotStart.toLocalTime(),
                            slotEnd.toLocalTime(),
                            status,
                            reservationId,
                            referenceNo,
                            reason
                    )
            );

            slotStart = slotEnd;
        }
    }
}
package com.heng.roomrental.availability.service.impl;

import com.heng.roomrental.availability.dto.*;
import com.heng.roomrental.availability.internal.AvailabilityEvent;
import com.heng.roomrental.availability.internal.RoomOperatingWindow;
import com.heng.roomrental.availability.service.AvailabilityService;
import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.common.exception.RoomNotAvailableException;
import com.heng.roomrental.location.entity.Location;
import com.heng.roomrental.location.entity.LocationOperatingHours;
import com.heng.roomrental.location.entity.LocationStatus;
import com.heng.roomrental.location.repository.LocationOperatingHoursRepository;
import com.heng.roomrental.location.repository.LocationRepository;
import com.heng.roomrental.reservation.entity.Reservation;
import com.heng.roomrental.reservation.entity.RoomBlock;
import com.heng.roomrental.reservation.repository.ReservationRepository;
import com.heng.roomrental.reservation.repository.RoomBlockRepository;
import com.heng.roomrental.room.entity.Room;

import com.heng.roomrental.room.entity.RoomStatus;
import com.heng.roomrental.room.repository.RoomRepository;
import com.heng.roomrental.room.service.RoomService;
import com.heng.roomrental.room.specification.RoomSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final ReservationRepository reservationRepository;
    private final RoomBlockRepository roomBlockRepository;
    private final RoomService roomService;
    private final RoomRepository roomRepository;
    private final BuildTimeLineService buildTimeLineService;
    private final LocationOperatingHoursRepository  operatingHoursRepository;
    private final LocationRepository locationRepository;

    @Override
    @Transactional(readOnly = true)
    public DayAvailabilityResponse getDayAvailability(
            Long roomId,
            LocalDate date
    ) {

        Room room = roomService.getEntityById(roomId);

        ZoneId zone = ZoneId.of(room.getLocation().getTimeZone());
        LocationOperatingHours operatingHours = operatingHoursRepository
                        .findByLocationIdAndDayOfWeek(
                                room.getLocation().getId(),
                                (short) date.getDayOfWeek().getValue()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Operating hours not configured for " +
                                                date.getDayOfWeek()
                                )
                        );


        if (operatingHours.isClosed()) {

            return new DayAvailabilityResponse(
                    room.getId(),
                    room.getRoomNumber(),
                    room.getName(),
                    date,
                    zone.getId(),
                    List.of()
            );
        }


        ZonedDateTime operatingStart = date.atTime(operatingHours.getOpenTime()).atZone(zone);

        ZonedDateTime operatingEnd = date.atTime(
                                            operatingHours.getCloseTime()
                                    ).atZone(zone);


        OffsetDateTime dayStart = operatingStart.toOffsetDateTime();

        OffsetDateTime dayEnd = operatingEnd.toOffsetDateTime();


        List<Reservation> reservations = reservationRepository
                        .findOverlappingReservations(
                                roomId,
                                dayStart,
                                dayEnd
                        );


        List<RoomBlock> blocks = roomBlockRepository
                        .findOverlappingBlocks(
                                roomId,
                                dayStart,
                                dayEnd
                        );


        List<AvailabilityEvent> events =
                new ArrayList<>();

        for (Reservation reservation : reservations) {

            ZonedDateTime start = reservation.getStartAt()
                            .atZoneSameInstant(zone);

            ZonedDateTime end = reservation.getEndAt()
                            .atZoneSameInstant(zone);

            events.add(
                    AvailabilityEvent.reservation(
                            start,
                            end,
                            reservation.getId(),
                            reservation.getReferenceNo()
                    )
            );
        }


        for (RoomBlock block : blocks) {

            ZonedDateTime start = block.getStartAt()
                            .atZoneSameInstant(zone);

            ZonedDateTime end = block.getEndAt()
                            .atZoneSameInstant(zone);

            events.add(
                    AvailabilityEvent.block(
                            start,
                            end,
                            block.getReason()
                    )
            );
        }
        events.sort(
                Comparator.comparing(
                        AvailabilityEvent::start
                )
        );
        List<TimeSlotResponse> slots = buildTimeLineService.buildTimeline(
                                            operatingStart,
                                            operatingEnd,
                                            events
                                    );
        return new DayAvailabilityResponse(
                room.getId(),
                room.getRoomNumber(),
                room.getName(),
                date,
                zone.getId(),
                slots
        );
    }

    @Override

    @Transactional(readOnly = true)
    public DayAvailabilityOverviewResponse
    getDayAvailabilityOverview(
            LocalDate date,
            Long roomTypeId,
            Long locationId
    ) {

        if(locationId != null){
            Location location = locationRepository.findById(locationId).orElseThrow(() -> new ResourceNotFoundException("Location not found"));
            if(location.getStatus().equals(LocationStatus.INACTIVE)){
                throw new ResourceNotFoundException("Location is not inactive");
            }
        }
        Specification<Room> specification = Specification.allOf(
                                    RoomSpecifications.status(RoomStatus.ACTIVE),
                                    RoomSpecifications.roomType(roomTypeId),

                                    RoomSpecifications.location(locationId)
                            );

        List<Room> rooms = roomRepository.findAll(specification);

        if (rooms.isEmpty()) {
            return new DayAvailabilityOverviewResponse(date, List.of());
        }

        List<Long> locationIds = rooms.stream()
                        .map(room ->
                                room.getLocation().getId()
                        )
                        .distinct()
                        .toList();
        short dayOfWeek = (short) date
                        .getDayOfWeek()
                        .getValue();

        List<LocationOperatingHours> operatingHoursList = operatingHoursRepository
                                        .findByLocationIdInAndDayOfWeek(
                                                locationIds,
                                                dayOfWeek
                                        );

        Map<Long, LocationOperatingHours> operatingHoursByLocation = operatingHoursList.stream()
                                                    .collect(
                                                            Collectors.toMap(
                                                                    hours ->
                                                                                    hours
                                                                                    .getLocation()
                                                                                    .getId(),
                                                                    Function.identity()
                                                            )
                                                    );


        Map<Long, RoomOperatingWindow> operatingWindows = rooms.stream().map(room ->
                                createOperatingWindow(
                                        room,
                                        date,
                                        operatingHoursByLocation.get(room.getLocation().getId())
                                )
                        )
                                .filter(Objects::nonNull)
                                .collect(
                                        Collectors.toMap(
                                                RoomOperatingWindow::roomId,
                                                Function.identity()
                                        )
                                );

        if (operatingWindows.isEmpty()) {

            return new DayAvailabilityOverviewResponse(
                    date,
                    List.of()
            );
        }

        OffsetDateTime batchStart = operatingWindows.values()
                            .stream()
                            .map(
                                    RoomOperatingWindow
                                            ::start
                            )
                            .min(
                                    OffsetDateTime::compareTo
                            )
                            .orElseThrow();


        OffsetDateTime batchEnd =
                operatingWindows.values()
                        .stream()
                        .map(
                                RoomOperatingWindow
                                        ::end
                        )
                        .max(
                                OffsetDateTime::compareTo
                        )
                        .orElseThrow();


        List<Long> roomIds =
                rooms.stream()
                        .map(Room::getId)
                        .toList();


        List<Reservation> reservations = reservationRepository
                        .findOverlappingReservationsForRooms(
                                roomIds,
                                batchStart,
                                batchEnd
                        );


        List<RoomBlock> blocks = roomBlockRepository
                        .findOverlappingBlocksForRooms(
                                roomIds,
                                batchStart,
                                batchEnd
                        );

        Map<Long, List<Reservation>> reservationsByRoom = reservations.stream()
                        .collect(Collectors.groupingBy(reservation ->
                                                reservation
                                                        .getRoom()
                                                        .getId())
                        );


        Map<Long, List<RoomBlock>> blocksByRoom = blocks.stream()
                        .collect(
                                Collectors.groupingBy(
                                        block ->
                                                block
                                                        .getRoom()
                                                        .getId()
                                )
                        );

        List<RoomAvailabilityResponse> result = rooms.stream()
                        .map(room -> {
                            RoomOperatingWindow window = operatingWindows.get(room.getId());
                            if (window == null) {
                                return new RoomAvailabilityResponse(
                                        room.getId(),
                                        room.getLocation().getId(),
                                        room.getRoomNumber(),

                                        room.getName(),

                                        room.getRoomType()
                                                .getId(),

                                        room.getRoomType()
                                                .getName(),

                                        room.getRoomType()
                                                .getCapacity(),

                                        room.getLocation()
                                                .getTimeZone(),
                                        null,
                                        null,

                                        List.of()
                                );
                            }
                            List<AvailabilityEvent> events = new ArrayList<>();
                            ZoneId zone = ZoneId.of(room.getLocation().getTimeZone());

                            for (Reservation reservation : reservationsByRoom.getOrDefault(room.getId(), List.of())
                            ) {
                                ZonedDateTime start = reservation
                                                .getStartAt()
                                                .atZoneSameInstant(zone);

                                ZonedDateTime end = reservation
                                                .getEndAt()
                                                .atZoneSameInstant(zone);

                                events.add(
                                        AvailabilityEvent
                                                .reservation(
                                                        start,
                                                        end,
                                                        reservation.getId(),
                                                        reservation.getReferenceNo()
                                                )
                                );
                            }


                            for (RoomBlock block : blocksByRoom.getOrDefault(room.getId(), List.of())) {
                                ZonedDateTime start = block
                                                .getStartAt()
                                                .atZoneSameInstant(
                                                        zone
                                                );

                                ZonedDateTime end = block
                                                .getEndAt()
                                                .atZoneSameInstant(
                                                        zone
                                                );

                                events.add(AvailabilityEvent
                                                .block(
                                                        start,
                                                        end,
                                                        block.getReason()
                                                )
                                );
                            }

                            events.sort(
                                    Comparator.comparing(
                                            AvailabilityEvent
                                                    ::start
                                    )
                            );

                            List<TimeSlotResponse> slots = buildTimeLineService.buildTimeline(
                                                                window.operatingStart(),
                                                                window.operatingEnd(),
                                                                events
                                                        );
                            return new RoomAvailabilityResponse(
                                    room.getId(),
                                    room.getLocation().getId(),
                                    room.getRoomNumber(),
                                    room.getName(),
                                    room.getRoomType().getId(),
                                    room.getRoomType().getName(),
                                    room.getRoomType().getCapacity(),
                                    zone.getId(),
                                    window.operatingStart().toLocalTime(),
                                    window.operatingEnd().toLocalTime(),
                                    slots
                            );

                        })
                        .toList();
        return new DayAvailabilityOverviewResponse(
                date,
                result
        );
    }

    @Override
    @Transactional(readOnly = true)
    public MonthlyAvailabilityResponse getMonthAvailability(
            Long roomId,
            int year,
            int month
    ) {

        YearMonth yearMonth = YearMonth.of(year, month);

        Room room = roomService.getEntityById(roomId);

        List<DailyAvailabilityResponse> days = new ArrayList<>();

        LocalDate date = yearMonth.atDay(1);

        LocalDate lastDate =                         yearMonth.atEndOfMonth();

        while (!date.isAfter(lastDate)) {
            DayAvailabilityResponse dayAvailability = getDayAvailability(roomId, date);

            DailyAvailabilityStatus status = resolveDailyStatus(dayAvailability);

            days.add(new DailyAvailabilityResponse(date, status));

            date = date.plusDays(1);
        }

        return new MonthlyAvailabilityResponse(
                room.getId(),
                room.getRoomNumber(),
                room.getName(),
                year,
                month,
                days
        );
    }


    private RoomOperatingWindow createOperatingWindow(
            Room room,
            LocalDate date,
            LocationOperatingHours operatingHours
    ) {

        ZoneId zone = ZoneId.of(room.getLocation().getTimeZone());
        if (operatingHours == null) {
            throw new ResourceNotFoundException(
                    "Operating hours not configured for "
                            + date.getDayOfWeek()
                            + " at location "
                            + room.getLocation().getName()
            );
        }
        if (operatingHours.isClosed()) {
            return null;
        }
        ZonedDateTime operatingStart = date.atTime(operatingHours.getOpenTime()).atZone(zone);

        ZonedDateTime operatingEnd =
                date.atTime(
                        operatingHours.getCloseTime()
                ).atZone(zone);

        return new RoomOperatingWindow(
                room.getId(),
                operatingStart,
                operatingEnd
        );
    }

    private DailyAvailabilityStatus resolveDailyStatus(
            DayAvailabilityResponse day
    ) {

        if (day.slots() == null || day.slots().isEmpty()) {
            return DailyAvailabilityStatus.CLOSED;
        }

        boolean hasAvailable = day.slots()
                        .stream()
                        .anyMatch(slot ->
                                slot.status() == SlotStatus.AVAILABLE
                        );

        boolean hasReserved = day.slots()
                        .stream()
                        .anyMatch(slot ->
                                slot.status() == SlotStatus.RESERVED
                        );

        boolean hasBlocked = day.slots()
                        .stream()
                        .anyMatch(slot ->
                                slot.status() == SlotStatus.BLOCKED
                        );

        if (hasBlocked && !hasAvailable && !hasReserved) {
            return DailyAvailabilityStatus.BLOCKED;
        }

        if (hasReserved && !hasAvailable) {
            return DailyAvailabilityStatus.FULLY_RESERVED;
        }

        if (hasReserved && hasAvailable) {
            return DailyAvailabilityStatus.PARTIALLY_RESERVED;
        }
        return DailyAvailabilityStatus.AVAILABLE;
    }
}
package com.heng.roomrental.location.service;

import com.heng.roomrental.location.dto.OperatingHoursRequest;
import com.heng.roomrental.location.dto.OperatingHoursResponse;
import com.heng.roomrental.location.entity.Location;
import com.heng.roomrental.location.entity.LocationOperatingHours;
import com.heng.roomrental.location.repository.LocationOperatingHoursRepository;
import com.heng.roomrental.location.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LocationOperatingHoursService {

    private final LocationRepository locationRepository;
    private final LocationOperatingHoursRepository operatingHoursRepository;

    @Transactional(readOnly = true)
    public List<OperatingHoursResponse> getByLocation(Long locationId) {

        getLocation(locationId);

        return operatingHoursRepository
                .findAllByLocationIdOrderByDayOfWeek(locationId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OperatingHoursResponse upsert(
            Long locationId,
            Short dayOfWeek,
            OperatingHoursRequest request
    ) {

        Location location = getLocation(locationId);

        validateDay(dayOfWeek);

        validateTimes(
                request.closed(),
                request.openTime(),
                request.closeTime()
        );

        LocationOperatingHours operatingHours =
                operatingHoursRepository
                        .findByLocationIdAndDayOfWeek(
                                locationId,
                                dayOfWeek
                        )
                        .orElseGet(() ->
                                new LocationOperatingHours(
                                        location,
                                        dayOfWeek,
                                        request.openTime(),
                                        request.closeTime(),
                                        request.closed()
                                )
                        );

        if (operatingHours.getId() != null) {
            operatingHours.update(
                    request.openTime(),
                    request.closeTime(),
                    request.closed()
            );
        }

        operatingHours = operatingHoursRepository.save(operatingHours);

        return toResponse(operatingHours);
    }

    public void delete(
            Long locationId,
            Short dayOfWeek
    ) {

        getLocation(locationId);

        LocationOperatingHours operatingHours =
                operatingHoursRepository
                        .findByLocationIdAndDayOfWeek(
                                locationId,
                                dayOfWeek
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Operating hours not found"
                                )
                        );

        operatingHoursRepository.delete(operatingHours);
    }

    private Location getLocation(Long locationId) {

        return locationRepository
                .findById(locationId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Location not found: " + locationId
                        )
                );
    }

    private void validateDay(Short dayOfWeek) {

        if (dayOfWeek == null
                || dayOfWeek < 1
                || dayOfWeek > 7) {

            throw new IllegalArgumentException(
                    "dayOfWeek must be between 1 and 7"
            );
        }
    }

    private void validateTimes(
            boolean closed,
            java.time.LocalTime openTime,
            java.time.LocalTime closeTime
    ) {

        if (closed) {

            if (openTime != null || closeTime != null) {
                throw new IllegalArgumentException(
                        "Closed day must not have openTime or closeTime"
                );
            }

            return;
        }

        if (openTime == null || closeTime == null) {
            throw new IllegalArgumentException(
                    "Open and close time are required"
            );
        }

        if (!openTime.isBefore(closeTime)) {
            throw new IllegalArgumentException(
                    "openTime must be before closeTime"
            );
        }
    }

    private OperatingHoursResponse toResponse(
            LocationOperatingHours entity
    ) {

        return new OperatingHoursResponse(
                entity.getId(),
                entity.getLocation().getId(),
                entity.getDayOfWeek(),
                entity.getOpenTime(),
                entity.getCloseTime(),
                entity.isClosed()
        );
    }
}
package com.heng.roomrental.location.repository;

import com.heng.roomrental.location.entity.LocationOperatingHours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LocationOperatingHoursRepository
        extends JpaRepository<LocationOperatingHours, Long> {

    Optional<LocationOperatingHours>
    findByLocationIdAndDayOfWeek(
            Long locationId,
            Short dayOfWeek
    );
    List<LocationOperatingHours>
    findByLocationIdInAndDayOfWeek(
            List<Long> locationIds,
            short dayOfWeek
    );

    List<LocationOperatingHours> findAllByLocationIdOrderByDayOfWeek(
            Long locationId
    );


    boolean existsByLocationIdAndDayOfWeek(
            Long locationId,
            Short dayOfWeek
    );

    void deleteAllByLocationId(Long locationId);
}
package com.heng.roomrental.room.repository;

import com.heng.roomrental.room.entity.Amenity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AmenityRepository extends JpaRepository<Amenity, Long>, JpaSpecificationExecutor<Amenity> {

    boolean existsByLocationIdAndName(
            Long locationId,
            String name
    );

    List<Amenity> findAllByLocationId(Long locationId);

    Optional<Amenity> findByIdAndLocationId(
            Long id,
            Long locationId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select a
            from Amenity a
            where a.location.id = :locationId
              and a.id in :amenityIds
            """)
    List<Amenity> findAllForUpdate(
            @Param("locationId") Long locationId,
            @Param("amenityIds") List<Long> amenityIds
    );
    boolean existsByLocationIdAndNameIgnoreCase(Long locationId, String name);

    boolean existsByLocationIdAndNameIgnoreCaseAndIdNot(
            Long locationId,
            String name,
            Long id
    );
}

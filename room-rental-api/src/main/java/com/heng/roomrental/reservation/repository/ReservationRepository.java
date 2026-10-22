package com.heng.roomrental.reservation.repository;

import com.heng.roomrental.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository
        extends JpaRepository<Reservation, Long>, JpaSpecificationExecutor<Reservation> {


    @Query("""
    SELECT r
    FROM Reservation r
    WHERE r.room.id = :roomId
      AND r.status.code IN (
          'PENDING',
          'CONFIRMED',
          'CHECKED_IN'
      )
      AND r.startAt < :dayEnd
      AND r.endAt > :dayStart
    ORDER BY r.startAt
    """)
    List<Reservation> findOverlappingReservations(
            @Param("roomId") Long roomId,
            @Param("dayStart") OffsetDateTime dayStart,
            @Param("dayEnd") OffsetDateTime dayEnd
    );

    @Query("""
    SELECT r
    FROM Reservation r
    WHERE r.room.id IN :roomIds
      AND r.status.code IN (
          'PENDING',
          'CONFIRMED',
          'CHECKED_IN'
      )
      AND r.startAt < :dayEnd
      AND r.endAt > :dayStart
    ORDER BY r.room.id, r.startAt
    """)
    List<Reservation> findOverlappingReservationsForRooms(
            @Param("roomIds")
            List<Long> roomIds,

            @Param("dayStart")
            OffsetDateTime dayStart,

            @Param("dayEnd")
            OffsetDateTime dayEnd
    );

    @Query("""
        SELECT CASE WHEN COUNT(r) > 0
                    THEN true
                    ELSE false
               END
        FROM Reservation r
        WHERE r.room.id = :roomId
          AND r.status.code IN (
              'PENDING',
              'CONFIRMED',
              'CHECKED_IN'
          )
          AND r.startAt < :endAt
          AND r.endAt > :startAt
        """)
    boolean existsOverlappingReservation(
            @Param("roomId")
            Long roomId,

            @Param("startAt")
            OffsetDateTime startAt,

            @Param("endAt")
            OffsetDateTime endAt
    );


    Optional<Reservation> findByReferenceNo(String referenceNo);
    @Query("""
        select r
        from Reservation r
        where r.reservedBy.id = :userId
""")
    List<Reservation> findByReservedBy_Id(Long userId);
}
package com.heng.roomrental.reservation.repository;

import com.heng.roomrental.reservation.entity.RoomBlock;
import com.heng.roomrental.reservation.entity.RoomBlockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface RoomBlockRepository
        extends JpaRepository<RoomBlock, Long>, JpaSpecificationExecutor<RoomBlock> {

    List<RoomBlock> findByRoomId(Long roomId);
    List<RoomBlock> findByRoomIdOrderByStartAtAsc(
            Long roomId
    );

    List<RoomBlock> findByRoomIdAndStatus(
            Long roomId,
            RoomBlockStatus status
    );


    @Query("""
    SELECT b
    FROM RoomBlock b
    WHERE b.room.id = :roomId
      AND b.status = 'ACTIVE'
      AND b.startAt < :dayEnd
      AND b.endAt > :dayStart
    ORDER BY b.startAt
    """)
    List<RoomBlock> findOverlappingBlocks(
            @Param("roomId") Long roomId,
            @Param("dayStart") OffsetDateTime dayStart,
            @Param("dayEnd") OffsetDateTime dayEnd
    );
    @Query("""
    SELECT b
    FROM RoomBlock b
    WHERE b.room.id IN :roomIds
      AND b.status = 'ACTIVE'
      AND b.startAt < :dayEnd
      AND b.endAt > :dayStart
    ORDER BY b.room.id, b.startAt
    """)
    List<RoomBlock> findOverlappingBlocksForRooms(
            @Param("roomIds")
            List<Long> roomIds,

            @Param("dayStart")
            OffsetDateTime dayStart,

            @Param("dayEnd")
            OffsetDateTime dayEnd
    );


    @Query("""
        SELECT b
        FROM RoomBlock b
        WHERE b.room.id = :roomId
          AND b.status = :status
          AND b.startAt < :endAt
          AND b.endAt > :startAt
        ORDER BY b.startAt
        """)
    List<RoomBlock> findOverlappingBlocks(
            @Param("roomId")
            Long roomId,

            @Param("status")
            RoomBlockStatus status,

            @Param("startAt")
            OffsetDateTime startAt,

            @Param("endAt")
            OffsetDateTime endAt
    );

    @Query("""
        SELECT CASE WHEN COUNT(b) > 0
                    THEN true
                    ELSE false
               END
        FROM RoomBlock b
        WHERE b.room.id = :roomId
          AND b.status = 'ACTIVE'
          AND b.startAt < :endAt
          AND b.endAt > :startAt
        """)
    boolean existsOverlappingBlock(
            @Param("roomId")
            Long roomId,

            @Param("startAt")
            OffsetDateTime startAt,

            @Param("endAt")
            OffsetDateTime endAt
    );
}
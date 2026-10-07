package com.heng.roomrental.room.repository;

import com.heng.roomrental.room.entity.Room;
import com.heng.roomrental.room.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface RoomRepository
        extends JpaRepository<Room, Long>, JpaSpecificationExecutor<Room> {

    List<Room> findByLocationId(Long locationId);

    List<Room> findByRoomTypeId(Long roomTypeId);

    List<Room> findByLocationIdAndRoomTypeId(
            Long locationId,
            Long roomTypeId
    );

    List<Room> findByLocationIdAndStatus(
            Long locationId,
            RoomStatus status
    );
    long countByLocationId(Long locationId);
}
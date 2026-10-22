package com.heng.roomrental.room.repository;

import com.heng.roomrental.room.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomTypeRepository
        extends JpaRepository<RoomType, Long> {

    Optional<RoomType> findByCode(String code);

    boolean existsByCode(String code);
    boolean existsByCodeAndLocation_Id(String code,Long locationId);

    List<RoomType> findAllByLocation_Id(Long locationId);
}
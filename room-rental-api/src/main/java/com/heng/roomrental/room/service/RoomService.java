package com.heng.roomrental.room.service;

import com.heng.roomrental.room.dto.CreateRoomRequest;
import com.heng.roomrental.room.dto.RoomResponse;
import com.heng.roomrental.room.dto.RoomSearchRequest;
import com.heng.roomrental.room.dto.UpdateRoomRequest;
import com.heng.roomrental.room.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoomService {

    RoomResponse create(CreateRoomRequest request);

    RoomResponse getById(Long id);

    List<RoomResponse> getAll();

    RoomResponse update(
            Long id,
            UpdateRoomRequest request
    );

    Page<RoomResponse> search(
            RoomSearchRequest request,
            Pageable pageable
    );

    void deactivate(Long id);

    Room getEntityById(Long id);
}
package com.heng.roomrental.room.service;

import com.heng.roomrental.room.dto.*;

import java.util.List;

public interface RoomTypeService {

    RoomTypeResponse create(CreateRoomTypeRequest request);

    RoomTypeResponse getById(Long id);

    List<RoomTypeResponse> getAll();

    RoomTypeResponse update(
            Long id,
            UpdateRoomTypeRequest request
    );

    void deactivate(Long id);
}
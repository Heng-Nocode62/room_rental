package com.heng.roomrental.room.service;

import com.heng.roomrental.room.dto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RoomTypeService {

    RoomTypeResponse create(CreateRoomTypeRequest request);

    RoomTypeResponse getById(Long id);

    List<RoomTypeResponse> getAll();

    RoomTypeResponse update(
            Long id,
            UpdateRoomTypeRequest request
    );
    RoomTypeResponse updateImage(
            Long id,
            MultipartFile image
    );

    void deactivate(Long id);

    List<RoomTypeResponse> getByLocationId(Long locationId);
}
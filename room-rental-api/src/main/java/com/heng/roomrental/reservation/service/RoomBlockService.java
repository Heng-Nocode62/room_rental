package com.heng.roomrental.reservation.service;

import com.heng.roomrental.reservation.dto.CreateRoomBlockRequest;
import com.heng.roomrental.reservation.dto.RoomBlockResponse;
import com.heng.roomrental.reservation.dto.RoomBlockSearchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoomBlockService {

    RoomBlockResponse create(
            CreateRoomBlockRequest request
    );

    RoomBlockResponse getById(
            Long id
    );

    List<RoomBlockResponse> getByRoom(
            Long roomId
    );
    Page<RoomBlockResponse> search(
            RoomBlockSearchRequest request,
            Pageable pageable
    );

    RoomBlockResponse cancel(
            Long id
    );

    RoomBlockResponse complete(
            Long id
    );
}
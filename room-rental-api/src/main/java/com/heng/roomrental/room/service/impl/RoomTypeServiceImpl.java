package com.heng.roomrental.room.service.impl;

import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.room.dto.CreateRoomTypeRequest;
import com.heng.roomrental.room.dto.RoomTypeResponse;
import com.heng.roomrental.room.dto.UpdateRoomTypeRequest;
import com.heng.roomrental.room.entity.RoomType;
import com.heng.roomrental.room.entity.RoomTypeStatus;
import com.heng.roomrental.room.repository.RoomTypeRepository;
import com.heng.roomrental.room.service.RoomTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomTypeServiceImpl implements RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;

    @Override
    @Transactional
    public RoomTypeResponse create(
            CreateRoomTypeRequest request
    ) {

        if (roomTypeRepository.existsByCode(request.code())) {
            throw new IllegalArgumentException(
                    "Room type code already exists: "
                            + request.code()
            );
        }

        RoomType roomType = new RoomType();

        roomType.setName(request.name());
        roomType.setCode(request.code());
        roomType.setDescription(request.description());
        roomType.setCapacity(request.capacity());
        roomType.setStatus(RoomTypeStatus.ACTIVE);

        return toResponse(
                roomTypeRepository.save(roomType)
        );
    }

    @Override
    public RoomTypeResponse getById(Long id) {

        return toResponse(findEntity(id));
    }

    @Override
    @PreAuthorize("hasAuthority('ROOM_TYPE_VIEW')")
    public List<RoomTypeResponse> getAll() {

        return roomTypeRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public RoomTypeResponse update(
            Long id,
            UpdateRoomTypeRequest request
    ) {

        RoomType roomType = findEntity(id);

        roomType.setName(request.name());
        roomType.setDescription(request.description());
        roomType.setCapacity(request.capacity());

        return toResponse(roomType);
    }

    @Override
    @Transactional

    public void deactivate(Long id) {

        RoomType roomType = findEntity(id);

        roomType.setStatus(RoomTypeStatus.INACTIVE);
    }

    private RoomType findEntity(Long id) {

        return roomTypeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room type not found: " + id
                        )
                );
    }

    private RoomTypeResponse toResponse(RoomType roomType) {

        return new RoomTypeResponse(
                roomType.getId(),
                roomType.getName(),
                roomType.getCode(),
                roomType.getDescription(),
                roomType.getCapacity(),
                roomType.getStatus().name()
        );
    }
}
package com.heng.roomrental.room.service.impl;

import com.heng.roomrental.common.exception.ConflictException;
import com.heng.roomrental.common.exception.ResourceNotFoundException;
import com.heng.roomrental.location.entity.Location;
import com.heng.roomrental.location.entity.UserLocationRole;
import com.heng.roomrental.location.repository.UserLocationRoleRepository;
import com.heng.roomrental.location.security.LocationSecurity;
import com.heng.roomrental.room.dto.RoomAmenityRequest;
import com.heng.roomrental.room.dto.RoomAmenityResponse;
import com.heng.roomrental.room.entity.Amenity;
import com.heng.roomrental.room.entity.Room;
import com.heng.roomrental.room.entity.RoomAmenity;
import com.heng.roomrental.room.repository.AmenityRepository;
import com.heng.roomrental.room.service.RoomAmenityService;
import com.heng.roomrental.room.service.RoomService;
import com.heng.roomrental.security.CurrentUserService;
import com.heng.roomrental.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomAmenityServiceImpl implements RoomAmenityService {
    private final RoomService roomService;
    private final AmenityRepository amenityRepository;
    private final LocationSecurity locationSecurity;

    @Override
    @Transactional(readOnly = true)
    public List<RoomAmenityResponse> getAmenities(Long roomId) {
        Room room = roomService.getEntityById(roomId);
        return room.getAmenities().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void addAmenity(Long roomId, RoomAmenityRequest request) {
        Room room = roomService.getEntityById(roomId);
        Location location = room.getLocation();
        locationSecurity.validateOwner(location.getId());
        Amenity amenity = amenityRepository.findById(request.amenityId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Amenity not found: " + request.amenityId()
                ));

        validateLocation(room, amenity);

        if (room.getAmenities().stream().anyMatch(ra ->
                ra.getAmenity().getId().equals(amenity.getId()))) {
            throw new ConflictException(
                    "Amenity is already assigned to this room"
            );
        }

        if (amenity.getStockQuantity() < request.amount()) {
            throw new ConflictException(
                    "Insufficient stock for amenity: " + amenity.getName()
            );
        }

        amenity.setStockQuantity(amenity.getStockQuantity() - request.amount());

        RoomAmenity roomAmenity = new RoomAmenity();
        roomAmenity.setRoom(room);
        roomAmenity.setAmenity(amenity);
        roomAmenity.setAmount(request.amount());
        room.getAmenities().add(roomAmenity);
    }

    @Override
    @Transactional
    public void removeAmenity(Long roomId, Long amenityId) {
        Room room = roomService.getEntityById(roomId);
        locationSecurity.validateOwner(room.getLocation().getId());
        RoomAmenity roomAmenity = room.getAmenities().stream()
                .filter(ra -> ra.getAmenity().getId().equals(amenityId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Amenity is not assigned to this room: " + amenityId
                ));

        roomAmenity.getAmenity().setStockQuantity(
                roomAmenity.getAmenity().getStockQuantity() + roomAmenity.getAmount()
        );

        room.getAmenities().remove(roomAmenity);
    }


    private void validateLocation(Room room, Amenity amenity) {
        if (!room.getLocation().getId().equals(amenity.getLocation().getId())) {
            throw new ConflictException(
                    "Amenity does not belong to the room's location"
            );
        }
    }


    private RoomAmenityResponse toResponse(RoomAmenity roomAmenity) {
        Amenity amenity = roomAmenity.getAmenity();
        return new RoomAmenityResponse(
                amenity.getId(),
                amenity.getName(),
                amenity.getDescription(),
                amenity.getPrice(),
                roomAmenity.getAmount()
        );
    }
}
